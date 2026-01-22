// Netlify Function: newsletter-unsubscribe
// Marca un suscriptor como desuscrito mediante token JWT (t:'unsub') o email directo (POST)
import jwt from 'jsonwebtoken';
import { getStore } from '@netlify/blobs';

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_prod';

async function getSubscriber(email){
  const store = getStore({ name:'subscribers', consistency:'strong' });
  const raw = await store.get(email);
  if(!raw) return null; try { return JSON.parse(raw); } catch { return null; }
}
async function saveSubscriber(email, data){
  const store = getStore({ name:'subscribers', consistency:'strong' });
  await store.set(email, JSON.stringify(data));
}

export async function handler(event){
  try {
    let email = null;
    if(event.httpMethod === 'GET'){
      const token = event.queryStringParameters?.token;
      if(!token) return { statusCode:400, body:'Token faltante' };
      const payload = jwt.verify(token, JWT_SECRET);
      if(payload.t !== 'unsub') return { statusCode:400, body:'Token inválido' };
      email = payload.email.toLowerCase();
    } else if(event.httpMethod === 'POST') {
      const body = JSON.parse(event.body||'{}');
      email = (body.email||'').toLowerCase();
    } else {
      return { statusCode:405, body:'Método no permitido' };
    }
    if(!email) return { statusCode:400, body:'Email requerido' };
    const existing = await getSubscriber(email);
    if(!existing){
      return { statusCode:200, body:'Ya no está suscripto' };
    }
    const now = new Date().toISOString();
    existing.unsubscribedAt = now;
    existing.updatedAt = now;
    await saveSubscriber(email, existing);
    const html = `<html><body style='font-family:Arial;background:#0d0d0d;color:#eee;padding:40px;text-align:center;'><h3 style='color:#d4af37;'>Suscripción cancelada</h3><p style='line-height:1.5;'>${email} ha sido removido de la lista.</p><p style='font-size:12px;opacity:.6;'>Puedes volver a suscribirte cuando quieras.</p></body></html>`;
    return { statusCode:200, headers:{'Content-Type':'text/html; charset=UTF-8'}, body: html };
  } catch(err){
    if(err.name === 'TokenExpiredError'){
      return { statusCode:410, body:'Token expirado' };
    }
    return { statusCode:400, body:'Solicitud inválida' };
  }
}
