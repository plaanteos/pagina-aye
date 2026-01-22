import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import sgMail from '@sendgrid/mail';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PORT = process.env.PORT || 3001;
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@tu-dominio.com';
const API_TOKEN = process.env.API_TOKEN || '';
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS||'600000');
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX||'50');
const BRAND = 'Ihara & London';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const TOKEN_TTL_HOURS = Number(process.env.TOKEN_TTL_HOURS || '48');

if(!SENDGRID_KEY){
  console.error('Falta SENDGRID_API_KEY en el entorno');
}
else sgMail.setApiKey(SENDGRID_KEY);

const app = express();
app.use(express.json({ limit: '200kb' }));
app.use(helmet({ crossOriginResourcePolicy:false }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(morgan('combined'));

// Rate limiting
app.use('/api/', rateLimit({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX, standardHeaders:true, legacyHeaders:false }));

// Carga / persistencia simple de suscriptores (archivo json plano)
const dataDir = path.resolve(process.cwd(), 'data');
const subsFile = path.join(dataDir, 'subscribers.json');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
function loadSubs(){
  try {
    const raw = JSON.parse(fs.readFileSync(subsFile,'utf8'));
    // Migración formato antiguo (array simple de emails) -> objetos
    if(Array.isArray(raw)) return raw.map(e=>({ email:e, confirmed:true, token:null, createdAt:new Date().toISOString(), confirmedAt:new Date().toISOString() }));
    if(Array.isArray(raw.subscribers)) return raw.subscribers; // por si futuro
    if(Array.isArray(raw.list)) return raw.list; // fallback
    return Array.isArray(raw)? raw : [];
  } catch { return []; }
}
function saveSubs(list){
  try { fs.writeFileSync(subsFile, JSON.stringify(list,null,2)); }
  catch(e){ console.error('No se pudo guardar subs', e.message); }
}

function generateToken(){ return crypto.randomBytes(24).toString('hex'); }
function buildWelcomeTemplate(email){
  const name = email.split('@')[0].replace(/[^a-zA-Z0-9._-]+/g,' ').trim();
  const prettyName = name? (name.charAt(0).toUpperCase()+name.slice(1)) : 'Cliente';
  const year = new Date().getFullYear();
    return `<!DOCTYPE html><html lang="es"><head><meta charset='UTF-8'><title>Bienvenida ${BRAND}</title><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#0d0d0d;color:#f5f5f5;}a{color:#d4af37;text-decoration:none;} .hero{background:linear-gradient(135deg,#111,#1d1d1d);padding:40px 25px;text-align:center;}h1{font-size:28px;margin:0;background:linear-gradient(45deg,#fff,#d4af37);-webkit-background-clip:text;color:transparent;}p{line-height:1.55;font-size:14px;margin:16px 0;} .card{max-width:620px;margin:0 auto;background:#181818;border:1px solid #2a2a2a;border-radius:18px;overflow:hidden;box-shadow:0 6px 22px -8px rgba(0,0,0,.6);} .content{padding:10px 28px 40px;} .badge{display:inline-block;background:#d4af37;color:#111;font-weight:600;padding:6px 14px;border-radius:30px;font-size:11px;letter-spacing:.5px;} .cta{display:inline-block;margin-top:22px;background:#d4af37;color:#111;padding:14px 26px;font-weight:600;border-radius:40px;font-size:13px;letter-spacing:.8px;} .grid{display:flex;flex-wrap:wrap;gap:14px;margin:28px 0 10px;} .grid-item{flex:1 1 160px;background:#202020;border:1px solid #2c2c2c;border-radius:14px;padding:14px 16px;min-width:150px;} .grid-item h3{margin:0 0 6px;font-size:15px;color:#fff;} .grid-item span{font-size:12px;opacity:.75;} footer{font-size:11px;opacity:.65;padding:24px 10px;text-align:center;} hr{border:none;border-top:1px solid #2e2e2e;margin:34px 0;} .logo{font-size:13px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#d4af37;margin:0;} @media(max-width:520px){h1{font-size:24px;} .content{padding:0 22px 34px;} .grid{flex-direction:column;} .grid-item{min-width:auto;} }</style></head><body><div class='card'><div class='hero'><p class='logo'>${BRAND}</p><h1>Bienvenida, ${prettyName}</h1><div class='badge'>EXPERIENCIA EXCLUSIVA</div></div><div class='content'><p>Gracias por confirmar tu suscripción. Desde ahora recibirás acceso temprano a lanzamientos y ediciones limitadas.</p><p>Cada detalle cuenta. Este es el comienzo de algo especial.</p><div class='grid'><div class='grid-item'><h3>Acceso Anticipado</h3><span>Nuevas colecciones antes.</span></div><div class='grid-item'><h3>Ediciones Limitadas</h3><span>Piezas seleccionadas.</span></div><div class='grid-item'><h3>Guías Personalizadas</h3><span>Consejos y cuidado.</span></div></div><a class='cta' href='https://www.instagram.com/ihara_calzado?igsh=MXhsaXJhcTI4djg2Mg==' target='_blank' rel='noopener'>Síguenos</a><hr><p style='font-size:12px;opacity:.7;'>Si no solicitaste esto, ignora el correo.</p><p style='font-size:12px;opacity:.55;'>&copy; ${year} ${BRAND}. Todos los derechos reservados.</p></div></div><footer>Enviado automáticamente</footer></body></html>`;
}
function buildConfirmationEmail(token, email){
  const link = `${APP_BASE_URL}/confirm-newsletter.html?token=${token}`;
  return `<html><body style='font-family:Arial;background:#0d0d0d;color:#eee;padding:40px;text-align:center;'>
  <h2 style='color:#d4af37;margin-top:0;'>Confirma tu suscripción</h2>
  <p style='line-height:1.5;'>Hola <strong>${email}</strong>, para completar tu suscripción a <strong>${BRAND}</strong> haz clic en el botón:</p>
  <p><a href='${link}' style='background:#d4af37;color:#111;padding:14px 24px;border-radius:32px;display:inline-block;font-weight:600;text-decoration:none;'>Confirmar suscripción</a></p>
  <p style='font-size:12px;opacity:.7;'>Si no solicitaste esto, ignora el correo.</p>
  </body></html>`;
}

app.get('/health', (_,res)=> res.json({ ok:true, ts: Date.now() }));

const subSchema = z.object({
  email: z.string().email(),
  html: z.string().min(20).max(200000)
});

// Suscripción directa (modo legacy): envía bienvenida inmediata
app.post('/api/newsletter', async (req,res)=>{
  if(API_TOKEN){
    const auth = req.get('x-api-token');
    if(auth !== API_TOKEN){ return res.status(401).json({ ok:false, error:'No autorizado'}); }
  }
  const parsed = subSchema.safeParse(req.body);
  if(!parsed.success){
    return res.status(400).json({ ok:false, error:'Datos inválidos', details: parsed.error.issues });
  }
  if(!SENDGRID_KEY){
    return res.status(503).json({ ok:false, error:'Servicio email no configurado' });
  }
  let { email, html } = parsed.data;
  // Sanitizar mínimo (SendGrid hace HTML allowance, asumimos template generado por front controlado)
  if(html.length > 200000) html = html.slice(0,200000);
  const subs = loadSubs();
  if(subs.includes(email.toLowerCase())){
    return res.json({ ok:true, duplicate:true });
  }
  try {
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: `Bienvenida a ${BRAND}`,
      html
    });
    subs.push({ email: email.toLowerCase(), confirmed:true, token:null, createdAt:new Date().toISOString(), confirmedAt:new Date().toISOString() });
    saveSubs(subs);
    res.json({ ok:true });
  } catch(err){
    console.error('Error envío', err.response?.body || err.message);
    res.status(500).json({ ok:false, error:'Error enviando correo' });
  }
});

// Doble opt-in: paso 1 suscripción => correo con enlace
app.post('/api/newsletter/subscribe', async (req,res)=>{
  if(API_TOKEN){ const auth = req.get('x-api-token'); if(auth !== API_TOKEN) return res.status(401).json({ ok:false, error:'No autorizado'}); }
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if(!parsed.success) return res.status(400).json({ ok:false, error:'Email inválido' });
  if(!SENDGRID_KEY) return res.status(503).json({ ok:false, error:'Servicio email no configurado' });
  const email = parsed.data.email.toLowerCase();
  const subs = loadSubs();
  const existing = subs.find(s=> s.email===email);
  if(existing && existing.confirmed){ return res.json({ ok:true, duplicate:true, confirmed:true }); }
  // Generar token nuevo si no existe o re-lanzar
  const token = generateToken();
  if(existing){ existing.token = token; existing.confirmed=false; existing.tokenCreatedAt = new Date().toISOString(); }
  else subs.push({ email, confirmed:false, token, createdAt:new Date().toISOString(), confirmedAt:null, tokenCreatedAt: new Date().toISOString() });
  saveSubs(subs);
  try {
    await sgMail.send({ to: email, from: FROM_EMAIL, subject:`Confirma tu suscripción a ${BRAND}`, html: buildConfirmationEmail(token, email) });
    res.json({ ok:true, pending:true });
  } catch(err){
    console.error('Error envío confirmación', err.response?.body || err.message);
    res.status(500).json({ ok:false, error:'Error enviando confirmación' });
  }
});

// Confirmación doble opt-in
app.get(['/api/newsletter/confirm/:token','/api/newsletter/confirm'], async (req,res)=>{
  const token = req.params.token || req.query.token;
  if(!token) return res.status(400).send('<h3>Token faltante</h3>');
  const subs = loadSubs();
  const sub = subs.find(s=> s.token===token);
  if(!sub) return res.status(404).send('<h3>Token inválido o expirado</h3>');
  // Expiración
  if(!sub.confirmed && sub.tokenCreatedAt){
    const ageMs = Date.now() - new Date(sub.tokenCreatedAt).getTime();
    const ttlMs = TOKEN_TTL_HOURS * 3600 * 1000;
    if(ageMs > ttlMs){
      return res.status(410).send('<h3>Token expirado. Solicita una nueva suscripción.</h3>');
    }
  }
  if(sub.confirmed){ return res.send('<h3>Ya confirmado ✔</h3>'); }
  sub.confirmed = true; sub.confirmedAt = new Date().toISOString(); sub.token=null;
  saveSubs(subs);
  try {
    await sgMail.send({ to: sub.email, from: FROM_EMAIL, subject:`Bienvenida a ${BRAND}`, html: buildWelcomeTemplate(sub.email) });
  } catch(err){ console.error('Error enviando bienvenida tras confirmación', err.response?.body || err.message); }
  res.send('<h3>Suscripción confirmada ✔ Puedes cerrar esta ventana.</h3>');
});

app.listen(PORT, ()=> console.log(`Newsletter server en puerto ${PORT}`));
