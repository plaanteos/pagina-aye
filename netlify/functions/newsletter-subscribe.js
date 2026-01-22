// Netlify Function: newsletter-subscribe (doble opt-in)
// Env vars necesarios en Netlify: SENDGRID_API_KEY, FROM_EMAIL, JWT_SECRET, BRAND (opcional), APP_BASE_URL (opcional)
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getStore } from '@netlify/blobs';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@tu-dominio.com';
const BRAND = process.env.BRAND || 'Ihara & London';
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.URL || '';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';
const TOKEN_TTL_HOURS = Number(process.env.TOKEN_TTL_HOURS || '48');

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

function buildConfirmationEmail(token, email){
  const link = `${APP_BASE_URL}/confirm-newsletter.html?token=${encodeURIComponent(token)}`;
  return `<html><body style='font-family:Arial;background:#0d0d0d;color:#eee;padding:40px;text-align:center;'>
  <h2 style='color:#d4af37;margin-top:0;'>Confirma tu suscripción</h2>
  <p style='line-height:1.5;'>Hola <strong>${email}</strong>, para completar tu suscripción a <strong>${BRAND}</strong> haz clic en el botón:</p>
  <p><a href='${link}' style='background:#d4af37;color:#111;padding:14px 24px;border-radius:32px;display:inline-block;font-weight:600;text-decoration:none;'>Confirmar suscripción</a></p>
  <p style='font-size:12px;opacity:.7;'>Si no solicitaste esto, ignora el correo.</p>
  </body></html>`;
}

async function getSubscriber(email){
  const store = getStore({ name:'subscribers', consistency:'strong' });
  const raw = await store.get(email);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
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
  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: JSON.stringify({ ok:false, error:'Método no permitido'}) };
  }
  if(!SENDGRID_KEY){
    return { statusCode: 503, body: JSON.stringify({ ok:false, error:'Servicio email no configurado'}) };
  }
  let data; try { data = JSON.parse(event.body||'{}'); } catch { data = {}; }
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(data);
  if(!parsed.success){
    return { statusCode: 400, body: JSON.stringify({ ok:false, error:'Email inválido' }) };
  }
  const email = parsed.data.email.toLowerCase();
  // Buscar existente
  const existing = await getSubscriber(email);
  if(existing && existing.unsubscribedAt){
    // Si estaba desuscrito, permitir re-suscripción como nuevo
  }
  if(existing && existing.confirmedAt){
    // Ya confirmado: opcionalmente re-envía confirmación? Mejor indicar duplicado.
    return { statusCode: 200, body: JSON.stringify({ ok:true, duplicate:true, confirmed:true }) };
  }
  // Generar JWT con expiración (tipo confirmación)
  const token = jwt.sign({ email, t:'confirm' }, JWT_SECRET, { expiresIn: `${TOKEN_TTL_HOURS}h` });
  try {
  await sgMail.send({ to: email, from: FROM_EMAIL, subject:`Confirma tu suscripción a ${BRAND}`, html: buildConfirmationEmail(token, email) });
  const now = new Date().toISOString();
  await saveSubscriber(email, { email, createdAt: existing?.createdAt || now, updatedAt: now, pendingTokenIssuedAt: now, confirmedAt: existing?.confirmedAt || null, unsubscribedAt: existing?.unsubscribedAt || null });
  await trackMetric('subscribe', email);
  return { statusCode: 200, body: JSON.stringify({ ok:true, pending:true, duplicatePending: !!existing }) };
  } catch(err){
    console.error('Error SendGrid subscribe:', err.response?.body || err.message);
    return { statusCode: 500, body: JSON.stringify({ ok:false, error:'Error enviando confirmación' }) };
  }
}
