// Netlify Function: newsletter-export
// Devuelve CSV de suscriptores (email, createdAt, confirmedAt, unsubscribedAt) usando Netlify Blobs
// Seguridad básica: header x-admin-key debe coincidir con ADMIN_API_KEY
import { getStore } from '@netlify/blobs';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

export async function handler(event){
  if(event.httpMethod !== 'GET') return { statusCode:405, body:'Método no permitido' };
  if(ADMIN_API_KEY){
    const key = event.headers['x-admin-key'];
    if(key !== ADMIN_API_KEY) return { statusCode:401, body:'No autorizado' };
  }
  const store = getStore({ name:'subscribers', consistency:'strong' });
  // Obtener claves desde store.list()
  const listing = await store.list({ prefix: '' });
  const blobs = Array.isArray(listing) ? listing : (listing?.blobs || []);
  const rows = [['email','createdAt','confirmedAt','unsubscribedAt']];
  for(const k of blobs){
    const key = k?.key || k;
    const raw = await store.get(key);
    if(!raw) continue; let obj=null; try { obj=JSON.parse(raw); } catch{}
    if(!obj) continue;
    rows.push([
      obj.email || key,
      obj.createdAt || '',
      obj.confirmedAt || '',
      obj.unsubscribedAt || ''
    ]);
  }
  const csv = rows.map(r=> r.map(f=> '"'+String(f).replace(/"/g,'""')+'"').join(',')).join('\n');
  return { statusCode:200, headers:{ 'Content-Type':'text/csv; charset=UTF-8','Content-Disposition':'attachment; filename="subscribers.csv"' }, body: csv };
}
