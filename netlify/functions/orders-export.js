// Netlify Function: orders-export
// Exporta todas las ventas a CSV
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
    
    const {
      format = 'csv',
      status = 'all',
      startDate,
      endDate
    } = event.queryStringParameters || {};

    // Obtener todas las órdenes
    const { blobs } = await ordersStore.list();
    let orders = [];

    for (const blob of blobs) {
      try {
        const orderData = await ordersStore.get(blob.key);
        const order = JSON.parse(orderData);
        orders.push({
          id: blob.key,
          ...order,
          createdAt: new Date(order.created_at || order.createdAt)
        });
      } catch (error) {
        console.error('Error loading order:', blob.key, error);
      }
    }

    // Aplicar filtros
    if (status !== 'all') {
      orders = orders.filter(order => order.payment_status === status);
    }

    if (startDate || endDate) {
      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Ordenar por fecha
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (format === 'csv') {
      // Generar CSV
      const headers = [
        'ID Orden',
        'Fecha',
        'Cliente',
        'Email',
        'Teléfono',
        'Total',
        'Estado Pago',
        'Método Pago',
        'Productos',
        'Cantidades'
      ];

      const csvRows = [headers.join(',')];
      
      orders.forEach(order => {
        const productos = order.items?.map(item => item.product || item.name || 'Sin nombre').join('; ') || '';
        const cantidades = order.items?.map(item => item.quantity || 1).join('; ') || '';
        
        const row = [
          order.id || order.order_id || '',
          order.createdAt.toLocaleDateString('es-ES'),
          `"${order.customer?.name || ''}"`,
          order.customer?.email || '',
          order.customer?.phone || '',
          order.total || 0,
          order.payment_status || '',
          order.payment_method || '',
          `"${productos}"`,
          cantidades
        ];
        
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const timestamp = new Date().toISOString().split('T')[0];
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv; charset=UTF-8',
          'Content-Disposition': `attachment; filename="ventas-ihara-london-${timestamp}.csv"`,
          'Access-Control-Allow-Origin': '*'
        },
        body: csvContent
      };
    } else {
      // Formato JSON
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Content-Disposition': `attachment; filename="ventas-ihara-london-${new Date().toISOString().split('T')[0]}.json"`,
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ orders, exportedAt: new Date().toISOString() }, null, 2)
      };
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
}
