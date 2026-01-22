// Netlify Function: newsletter-list
// Devuelve JSON con suscriptores (paginación simple opcional ?limit=&cursor=)
import { getStore } from '@netlify/blobs';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

export async function handler(event){
  if(event.httpMethod !== 'GET') return { statusCode:405, body: JSON.stringify({ error:'Método no permitido'}) };
  if(ADMIN_API_KEY){
    const key = event.headers['x-admin-key'];
    if(key !== ADMIN_API_KEY) return { statusCode:401, body: JSON.stringify({ error:'No autorizado'}) };
  }
  const limit = Math.min(Number(event.queryStringParameters?.limit||'100'), 500);
  const store = getStore({ name:'subscribers', consistency:'strong' });
  const listing = await store.list({ prefix: '' });
  const blobs = Array.isArray(listing) ? listing : (listing?.blobs || []);
  const items = [];
  for(const k of blobs.slice(0, limit)){
    const key = k?.key || k; // soportar distintos formatos
    const raw = await store.get(key);
    if(!raw) continue; try { items.push(JSON.parse(raw)); } catch{}
  }
  const total = Array.isArray(listing) ? listing.length : (listing?.blobs?.length || items.length);
  return { statusCode:200, headers:{'Content-Type':'application/json; charset=UTF-8'}, body: JSON.stringify({ total, count: items.length, items }) };
}
