// Utilidades de seguridad compartidas para funciones Netlify
import { z } from 'zod';

// Esquemas de validación
export const emailSchema = z.string().email().max(255);
export const nameSchema = z.string().min(1).max(200).regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/);
export const messageSchema = z.string().min(10).max(5000);
export const phoneSchema = z.string().regex(/^[\d\s+()-]{7,20}$/);

// Sanitización básica de HTML
export function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Rate limiting simple basado en IP
const requestTracker = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const MAX_REQUESTS = 10; // 10 requests por minuto

export function checkRateLimit(ip, endpoint) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  
  if (!requestTracker.has(key)) {
    requestTracker.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  const tracker = requestTracker.get(key);
  const timePassed = now - tracker.firstRequest;
  
  // Reset si pasó la ventana de tiempo
  if (timePassed > RATE_LIMIT_WINDOW) {
    requestTracker.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }
  
  // Incrementar contador
  tracker.count++;
  
  if (tracker.count > MAX_REQUESTS) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW - timePassed) / 1000)
    };
  }
  
  return { allowed: true, remaining: MAX_REQUESTS - tracker.count };
}

// Limpiar tracker cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestTracker.entries()) {
    if (now - value.firstRequest > RATE_LIMIT_WINDOW * 2) {
      requestTracker.delete(key);
    }
  }
}, 300000);

// Validar origen de request
export function validateOrigin(event) {
  const allowedOrigins = [
    'https://iharalondon.netlify.app',
    'http://localhost:8888',
    'http://localhost:3000'
  ];
  
  const origin = event.headers.origin || event.headers.referer;
  if (!origin) return false;
  
  return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

// Headers seguros para respuestas
export const secureHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Respuesta de error estandarizada
export function errorResponse(statusCode, message, details = null) {
  return {
    statusCode,
    headers: secureHeaders,
    body: JSON.stringify({ 
      ok: false, 
      error: message,
      ...(details && { details })
    })
  };
}

// Respuesta de éxito estandarizada
export function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    headers: secureHeaders,
    body: JSON.stringify({ ok: true, ...data })
  };
}

// Detectar ataques de inyección SQL/XSS básicos
export function detectAttackPatterns(input) {
  const patterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi,
    /--/g, // SQL comments
    /;.*(\n|$)/g // Multiple statements
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

// Log de seguridad
export function securityLog(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context
  };
  
  console.log(JSON.stringify(logEntry));
  
  // En producción, podrías enviar a un servicio de logging externo
  if (process.env.NODE_ENV === 'production' && level === 'critical') {
    // TODO: Enviar a servicio de alertas
  }
}
