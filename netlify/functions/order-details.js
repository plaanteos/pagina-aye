// Netlify Function: order-details
// Devuelve detalles completos de una venta específica
import { getStore } from '@netlify/blobs';

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  // Verificar autenticación admin
  const authHeader = event.headers['x-admin-key'] || event.headers['authorization'];
  if (ADMIN_API_KEY && authHeader !== ADMIN_API_KEY) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No autorizado' }) };
  }

  const orderId = event.queryStringParameters?.id;
  if (!orderId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'ID de orden requerido' })
    };
  }

  try {
    const ordersStore = getStore({ name: 'orders', consistency: 'strong' });
    
    // Obtener orden específica
    const orderData = await ordersStore.get(orderId);
    if (!orderData) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Orden no encontrada' })
      };
    }

    const order = JSON.parse(orderData);

    // Enriquecer datos si es necesario
    const enrichedOrder = {
      id: orderId,
      ...order,
      createdAt: order.created_at || order.createdAt,
      formattedTotal: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
      }).format(order.total || 0),
      itemsCount: order.items?.length || 0,
      totalQuantity: order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ order: enrichedOrder })
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
}
