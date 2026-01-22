const nodemailer = require('nodemailer');
const { z } = require('zod');

// Rate limiting simple
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS = 5; // 5 requests por minuto

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestTracker.has(ip)) {
    requestTracker.set(ip, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  const tracker = requestTracker.get(ip);
  const timePassed = now - tracker.firstRequest;
  if (timePassed > RATE_LIMIT_WINDOW) {
    requestTracker.set(ip, { count: 1, firstRequest: now });
    return { allowed: true };
  }
  tracker.count++;
  if (tracker.count > MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((RATE_LIMIT_WINDOW - timePassed) / 1000) };
  }
  return { allowed: true };
}

// Sanitización
function sanitizeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Detectar patrones de ataque
function detectAttack(input) {
  const patterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /(union|select|insert|update|delete|drop)\s+/gi
  ];
  return patterns.some(p => p.test(input));
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    // Rate limiting
    const clientIp = event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown';
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return {
        statusCode: 429,
        headers: { 'Retry-After': rateCheck.retryAfter.toString() },
        body: JSON.stringify({ error: 'Demasiadas solicitudes. Intenta más tarde.' })
      };
    }

    // Validate required environment variables
    const { EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS) {
      return {
        statusCode: 503,
        body: JSON.stringify({ error: 'Servicio de email no configurado' })
      };
    }

    let data;
    try {
      data = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'JSON inválido' })
      };
    }

    // Validación con Zod
    const schema = z.object({
      name: z.string().min(1).max(200).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/),
      email: z.string().email().max(255),
      subject: z.string().min(3).max(300),
      message: z.string().min(10).max(5000),
      newsletter: z.boolean().optional()
    });

    const validation = schema.safeParse(data);
    if (!validation.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Datos inválidos',
          details: validation.error.errors.map(e => e.message).join(', ')
        })
      };
    }

    const { name, email, subject, message, newsletter } = validation.data;

    // Detectar ataques
    if ([name, subject, message].some(detectAttack)) {
      console.warn('Attack attempt detected:', { clientIp, name, email });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Contenido no permitido' })
      };
    }

    // Configurar transporter de email. Soporta Gmail (por defecto) o SMTP genérico si se proveen SMTP_HOST/PORT/SECURE
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE } = process.env;
    const transporter = SMTP_HOST
      ? nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT ? Number(SMTP_PORT) : 587,
          secure: String(SMTP_SECURE||'false').toLowerCase() === 'true',
          auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        })
      : nodemailer.createTransport({
          service: 'gmail',
          auth: { user: EMAIL_USER, pass: EMAIL_PASS }
        });

  // Email al administrador (usa CONTACT_EMAIL o, si no existe, EMAIL_USER)
    const ADMIN_TO = process.env.CONTACT_EMAIL || EMAIL_USER;
  const SITE_URL = process.env.APP_BASE_URL || 'https://iharalondon.netlify.app';
    
    // Email al administrador
    const adminEmail = {
      from: EMAIL_USER,
      to: ADMIN_TO,
      subject: `Nueva consulta: ${sanitizeHtml(subject)}`,
      html: `
        <h2>Nueva consulta desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${sanitizeHtml(name)}</p>
        <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
        <p><strong>Asunto:</strong> ${sanitizeHtml(subject)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${sanitizeHtml(message).replace(/\n/g, '<br>')}</p>
        <p><strong>Newsletter:</strong> ${newsletter ? 'Sí' : 'No'}</p>
        <p><strong>IP:</strong> ${clientIp}</p>
        <hr>
        <p><small>Enviado desde ${SITE_URL} el ${new Date().toLocaleString('es-AR')}</small></p>
      `
    };

    // Email de confirmación al usuario
    const userEmail = {
      from: EMAIL_USER,
      to: email,
      subject: 'Confirmación de consulta - Ihara & London',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">¡Gracias por contactarnos!</h2>
          <p>Hola ${sanitizeHtml(name)},</p>
          <p>Hemos recibido tu consulta y nos pondremos en contacto contigo dentro de las próximas 24 horas.</p>
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 3px solid #d4af37;">
            <p><strong>Tu consulta:</strong></p>
            <p><strong>Asunto:</strong> ${sanitizeHtml(subject)}</p>
            <p><strong>Mensaje:</strong> ${sanitizeHtml(message).replace(/\n/g, '<br>')}</p>
          </div>
          <p>Mientras tanto, puedes seguir explorando nuestra colección en <a href="${SITE_URL}" style="color: #d4af37;">nuestro sitio web</a>.</p>
          <p>Saludos,<br>
          El equipo de Ihara & London</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            Ihara & London | Ituzaingó 562, San Cristóbal, Santa Fe, Argentina<br>
            <a href="mailto:info@iharalondon.com">info@iharalondon.com</a> | +54 9 3492 61-3004
          </p>
        </div>
      `
    };

    // Enviar emails
    await transporter.sendMail(adminEmail);
    await transporter.sendMail(userEmail);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Consulta enviada exitosamente. Te responderemos pronto.' 
      })
    };

  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
