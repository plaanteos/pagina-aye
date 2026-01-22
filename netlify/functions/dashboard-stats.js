// Netlify Function: dashboard-stats
// Devuelve estadísticas completas para el dashboard de administración
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
    const subscribersStore = getStore({ name: 'subscribers', consistency: 'strong' });
    
    // Obtener todas las órdenes
    const { blobs: orderBlobs } = await ordersStore.list();
    let orders = [];

    for (const blob of orderBlobs) {
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

    // Obtener suscriptores
    const { blobs: subscriberBlobs } = await subscribersStore.list();
    let subscribers = [];
    
    for (const blob of subscriberBlobs) {
      try {
        const subscriberData = await subscribersStore.get(blob.key);
        const subscriber = JSON.parse(subscriberData);
        subscribers.push({
          ...subscriber,
          createdAt: new Date(subscriber.createdAt)
        });
      } catch (error) {
        console.error('Error loading subscriber:', blob.key, error);
      }
    }

    // Calcular fechas
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Estadísticas de ventas
    const approvedOrders = orders.filter(o => o.payment_status === 'approved');
    const todayOrders = approvedOrders.filter(o => o.createdAt >= today);
    const yesterdayOrders = approvedOrders.filter(o => 
      o.createdAt >= yesterday && o.createdAt < today
    );
    const thisMonthOrders = approvedOrders.filter(o => o.createdAt >= thisMonth);
    const lastMonthOrders = approvedOrders.filter(o => 
      o.createdAt >= lastMonth && o.createdAt <= lastMonthEnd
    );

    // Estadísticas de newsletter
    const activeSubscribers = subscribers.filter(s => s.confirmed && !s.unsubscribed);
    const todaySubscribers = subscribers.filter(s => s.createdAt >= today);
    const thisMonthSubscribers = subscribers.filter(s => s.createdAt >= thisMonth);

    // Top productos
    const productSales = {};
    approvedOrders.forEach(order => {
      order.items?.forEach(item => {
        const productName = item.product || item.name || 'Producto sin nombre';
        if (!productSales[productName]) {
          productSales[productName] = { quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += item.quantity || 1;
        productSales[productName].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Ventas por día (últimos 7 días)
    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = approvedOrders.filter(o => 
        o.createdAt >= date && o.createdAt < nextDate
      );
      
      dailySales.push({
        date: date.toISOString().split('T')[0],
        sales: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
      });
    }

    const stats = {
      sales: {
        today: {
          count: todayOrders.length,
          revenue: todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
          change: todayOrders.length - yesterdayOrders.length
        },
        thisMonth: {
          count: thisMonthOrders.length,
          revenue: thisMonthOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
          change: thisMonthOrders.length - lastMonthOrders.length
        },
        total: {
          count: approvedOrders.length,
          revenue: approvedOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0)
        },
        pending: orders.filter(o => o.payment_status === 'pending').length,
        rejected: orders.filter(o => o.payment_status === 'rejected').length
      },
      newsletter: {
        total: activeSubscribers.length,
        today: todaySubscribers.length,
        thisMonth: thisMonthSubscribers.length,
        confirmed: subscribers.filter(s => s.confirmed).length,
        unsubscribed: subscribers.filter(s => s.unsubscribed).length
      },
      products: {
        topSelling: topProducts
      },
      charts: {
        dailySales
      },
      lastUpdated: now.toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Error generating dashboard stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
}
