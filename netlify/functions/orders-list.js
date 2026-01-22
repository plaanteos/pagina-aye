// Netlify Function: orders-list
// Devuelve todas las ventas/pedidos con filtros y paginación
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

  try {
    const ordersStore = getStore({ name: 'orders', consistency: 'strong' });
    
    // Parámetros de consulta
    const {
      limit = '50',
      offset = '0',
      status = 'all',
      startDate,
      endDate,
      search = ''
    } = event.queryStringParameters || {};

    // Obtener todas las órdenes
    const { blobs } = await ordersStore.list();
    let orders = [];

    // Cargar datos de cada orden
    for (const blob of blobs) {
      try {
        const orderData = await ordersStore.get(blob.key);
        const order = JSON.parse(orderData);
        orders.push({
          id: blob.key,
          ...order,
          createdAt: order.created_at || order.createdAt
        });
      } catch (error) {
        console.error('Error loading order:', blob.key, error);
      }
    }

    // Filtrar por estado
    if (status !== 'all') {
      orders = orders.filter(order => order.payment_status === status);
    }

    // Filtrar por fecha
    if (startDate || endDate) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Filtrar por búsqueda (email, nombre, ID)
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.customer?.name?.toLowerCase().includes(searchLower) ||
        order.customer?.email?.toLowerCase().includes(searchLower) ||
        order.id?.toLowerCase().includes(searchLower) ||
        order.order_id?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha (más reciente primero)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginación
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    // Estadísticas básicas
    const stats = {
      total: orders.length,
      approved: orders.filter(o => o.payment_status === 'approved').length,
      pending: orders.filter(o => o.payment_status === 'pending').length,
      rejected: orders.filter(o => o.payment_status === 'rejected').length,
      totalRevenue: orders
        .filter(o => o.payment_status === 'approved')
        .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        orders: paginatedOrders,
        pagination: {
          total: orders.length,
          offset: startIndex,
          limit: parseInt(limit),
          hasMore: endIndex < orders.length
        },
        stats
      })
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
}
