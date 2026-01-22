// Netlify Function: newsletter-confirm
// Verifica token JWT y envía correo de bienvenida
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import { getStore } from '@netlify/blobs';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@tu-dominio.com';
const BRAND = process.env.BRAND || 'Ihara & London';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

function buildWelcomeTemplate(email){
  const name = email.split('@')[0].replace(/[^a-zA-Z0-9._-]+/g,' ').trim();
  const prettyName = name? (name.charAt(0).toUpperCase()+name.slice(1)) : 'Cliente';
  const year = new Date().getFullYear();
  const unsubToken = jwt.sign({ email, t:'unsub' }, JWT_SECRET, { expiresIn:'30d' });
  const unsubscribeLink = `${(process.env.APP_BASE_URL || process.env.URL || '')}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubToken)}`;
  return `<!DOCTYPE html><html lang="es"><head><meta charset='UTF-8'><title>Bienvenida ${BRAND}</title><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#0d0d0d;color:#f5f5f5;}a{color:#d4af37;text-decoration:none;} .hero{background:linear-gradient(135deg,#111,#1d1d1d);padding:40px 25px;text-align:center;}h1{font-size:28px;margin:0;background:linear-gradient(45deg,#fff,#d4af37);-webkit-background-clip:text;color:transparent;}p{line-height:1.55;font-size:14px;margin:16px 0;} .card{max-width:620px;margin:0 auto;background:#181818;border:1px solid #2a2a2a;border-radius:18px;overflow:hidden;box-shadow:0 6px 22px -8px rgba(0,0,0,.6);} .content{padding:10px 28px 40px;} .badge{display:inline-block;background:#d4af37;color:#111;font-weight:600;padding:6px 14px;border-radius:30px;font-size:11px;letter-spacing:.5px;} .cta{display:inline-block;margin-top:22px;background:#d4af37;color:#111;padding:14px 26px;font-weight:600;border-radius:40px;font-size:13px;letter-spacing:.8px;} .grid{display:flex;flex-wrap:wrap;gap:14px;margin:28px 0 10px;} .grid-item{flex:1 1 160px;background:#202020;border:1px solid #2c2c2c;border-radius:14px;padding:14px 16px;min-width:150px;} .grid-item h3{margin:0 0 6px;font-size:15px;color:#fff;} .grid-item span{font-size:12px;opacity:.75;} footer{font-size:11px;opacity:.65;padding:24px 10px;text-align:center;} hr{border:none;border-top:1px solid #2e2e2e;margin:34px 0;} .logo{font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#d4af37;margin:0;} @media(max-width:520px){h1{font-size:24px;} .content{padding:0 22px 34px;} .grid{flex-direction:column;} .grid-item{min-width:auto;} }</style></head><body><div class='card'><div class='hero'><p class='logo'>${BRAND}</p><h1>Bienvenida, ${prettyName}</h1><div class='badge'>EXPERIENCIA EXCLUSIVA</div></div><div class='content'><p>Gracias por confirmar tu suscripción. Desde ahora recibirás acceso temprano a lanzamientos y ediciones limitadas.</p><p>Cada detalle cuenta. Este es el comienzo de algo especial.</p><div class='grid'><div class='grid-item'><h3>Acceso Anticipado</h3><span>Nuevas colecciones antes.</span></div><div class='grid-item'><h3>Ediciones Limitadas</h3><span>Piezas seleccionadas.</span></div><div class='grid-item'><h3>Guías Personalizadas</h3><span>Consejos y cuidado.</span></div></div><a class='cta' href='https://www.instagram.com/ihara_calzado?igsh=MXhsaXJhcTI4djg2Mg==' target='_blank' rel='noopener'>Síguenos</a><hr><p style='font-size:12px;opacity:.7;'>Si no solicitaste esto, ignora el correo.</p><p style='font-size:11px;opacity:.55;'>Si deseas dejar de recibir correos haz clic <a href='${unsubscribeLink}' style='color:#d4af37;'>aquí</a>.</p><p style='font-size:12px;opacity:.55;'>&copy; ${year} ${BRAND}. Todos los derechos reservados.</p></div></div><footer>Enviado automáticamente • <a href='${unsubscribeLink}' style='color:#d4af37;'>Desuscribirse</a></footer></body></html>`;
}

async function getSubscriber(email){
  const store = getStore({ name:'subscribers', consistency:'strong' });
  const raw = await store.get(email);
  if(!raw) return null; try { return JSON.parse(raw); } catch { return null; }
}
async function saveSubscriber(email, data){
  const store = getStore({ name:'subscribers', consistency:'strong' });
  await store.set(email, JSON.stringify(data));
}

async function trackMetric(type, email){
  try {
    const metricsStore = getStore({ name:'newsletter-metrics', consistency:'strong' });
    const timestamp = new Date().toISOString();
    const key = `${type}_${timestamp}_${email.replace('@','_at_')}`;
    await metricsStore.set(key, JSON.stringify({ type, email, timestamp }));
  } catch(e){ console.error('Error tracking metric:', e); }
}

export async function handler(event){
  // Soporta path /api/newsletter/confirm y /api/newsletter/confirm/:token con redirect configurado
  const token = event.queryStringParameters?.token || (event.path || '').split('/').pop();
  if(!token){
    return { statusCode: 400, headers:{'Content-Type':'text/html; charset=UTF-8'}, body: '<h3>Token faltante</h3>' };
  }
  if(!SENDGRID_KEY){
    return { statusCode: 503, headers:{'Content-Type':'text/html; charset=UTF-8'}, body:'<h3>Servicio email no configurado</h3>' };
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if(payload.t !== 'confirm') throw new Error('tipo incorrecto');
    const email = payload.email.toLowerCase();
    const now = new Date().toISOString();
    const existing = await getSubscriber(email);
    if(existing && existing.confirmedAt){
      return { statusCode: 200, headers:{'Content-Type':'text/html; charset=UTF-8'}, body:'<h3>Ya estaba confirmado ✔</h3>' };
    }
    await saveSubscriber(email, { email, createdAt: existing?.createdAt || now, updatedAt: now, confirmedAt: now, unsubscribedAt: existing?.unsubscribedAt || null });
    await trackMetric('confirm', email);
    try { await sgMail.send({ to: email, from: FROM_EMAIL, subject:`Bienvenida a ${BRAND}`, html: buildWelcomeTemplate(email) }); } catch(err){ console.error('Error envío bienvenida', err.response?.body || err.message); }
    return { statusCode: 200, headers:{'Content-Type':'text/html; charset=UTF-8'}, body:'<h3>Suscripción confirmada ✔</h3>' };
  } catch(err){
    if(err.name === 'TokenExpiredError'){
      return { statusCode: 410, headers:{'Content-Type':'text/html; charset=UTF-8'}, body:'<h3>Token expirado</h3>' };
    }
    return { statusCode: 404, headers:{'Content-Type':'text/html; charset=UTF-8'}, body:'<h3>Token inválido</h3>' };
  }
}
