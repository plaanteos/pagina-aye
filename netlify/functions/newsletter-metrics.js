// Netlify Function: newsletter-metrics
// Analytics y métricas para newsletter
import { getStore } from '@netlify/blobs';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const ADMIN_KEY = process.env.ADMIN_API_KEY;
  const authHeader = event.headers['x-admin-key'] || event.headers['authorization'];
  
  if (!ADMIN_KEY || authHeader !== ADMIN_KEY) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  try {
    const store = getStore({ name: 'subscribers', consistency: 'strong' });
    const metricsStore = getStore({ name: 'newsletter-metrics', consistency: 'strong' });
    
    // Obtener todas las métricas
    const { blobs } = await metricsStore.list();
    const allMetrics = await Promise.all(
      blobs.map(async (blob) => {
        const data = await metricsStore.get(blob.key);
        return JSON.parse(data);
      })
    );

    // Calcular estadísticas
    const subscribedCount = allMetrics.filter(m => m.type === 'subscribe').length;
    const confirmedCount = allMetrics.filter(m => m.type === 'confirm').length;
    const unsubscribedCount = allMetrics.filter(m => m.type === 'unsubscribe').length;
    const conversionRate = subscribedCount > 0 ? (confirmedCount / subscribedCount * 100).toFixed(2) : 0;

    // Métricas por fecha
    const metricsByDate = {};
    allMetrics.forEach(metric => {
      const date = new Date(metric.timestamp).toISOString().split('T')[0];
      if (!metricsByDate[date]) {
        metricsByDate[date] = { subscribes: 0, confirms: 0, unsubscribes: 0 };
      }
      metricsByDate[date][metric.type + 's']++;
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        summary: {
          totalSubscribes: subscribedCount,
          totalConfirms: confirmedCount,
          totalUnsubscribes: unsubscribedCount,
          conversionRate: `${conversionRate}%`,
          activeSubscribers: confirmedCount - unsubscribedCount
        },
        metricsByDate,
        recentEvents: allMetrics.slice(-10).reverse()
      })
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error obteniendo métricas' }) };
  }
}
