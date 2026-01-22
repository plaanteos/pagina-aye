// Netlify Function: sales-reports
// Genera reportes detallados de ventas con filtros avanzados
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

  const {
    reportType = 'sales-summary',
    period = 'last-30-days',
    startDate,
    endDate,
    groupBy = 'day'
  } = event.queryStringParameters || {};

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

    // Filtrar por fechas
    let filteredOrders = orders.filter(o => o.payment_status === 'approved');
    
    if (startDate || endDate || period !== 'all-time') {
      const { start, end } = getDateRange(period, startDate, endDate);
      filteredOrders = filteredOrders.filter(order => 
        order.createdAt >= start && order.createdAt <= end
      );
    }

    let report = {};

    switch (reportType) {
      case 'sales-summary':
        report = generateSalesSummary(filteredOrders, groupBy);
        break;
      case 'products-analysis':
        report = generateProductsAnalysis(filteredOrders);
        break;
      case 'customers-analysis':
        report = generateCustomersAnalysis(filteredOrders);
        break;
      case 'revenue-trends':
        report = generateRevenueTrends(filteredOrders, groupBy);
        break;
      case 'complete-report':
        // Obtener suscriptores para reporte completo
        const { blobs: subscriberBlobs } = await subscribersStore.list();
        let subscribers = [];
        
        for (const blob of subscriberBlobs) {
          try {
            const subscriberData = await subscribersStore.get(blob.key);
            subscribers.push(JSON.parse(subscriberData));
          } catch (error) {
            console.error('Error loading subscriber:', blob.key);
          }
        }
        
        report = generateCompleteReport(filteredOrders, subscribers, groupBy);
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Tipo de reporte no válido' })
        };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reportType,
        period,
        generatedAt: new Date().toISOString(),
        dataPoints: filteredOrders.length,
        ...report
      })
    };

  } catch (error) {
    console.error('Error generating report:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
}

function getDateRange(period, startDate, endDate) {
  const end = endDate ? new Date(endDate) : new Date();
  let start;

  switch (period) {
    case 'last-7-days':
      start = new Date(end);
      start.setDate(start.getDate() - 7);
      break;
    case 'last-30-days':
      start = new Date(end);
      start.setDate(start.getDate() - 30);
      break;
    case 'last-90-days':
      start = new Date(end);
      start.setDate(start.getDate() - 90);
      break;
    case 'this-month':
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
    case 'last-month':
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0); // Último día del mes anterior
      break;
    case 'this-year':
      start = new Date(end.getFullYear(), 0, 1);
      break;
    case 'custom':
      start = startDate ? new Date(startDate) : new Date(0);
      break;
    default:
      start = new Date(0);
  }

  return { start, end };
}

function generateSalesSummary(orders, groupBy) {
  const summary = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
    averageOrderValue: 0,
    timeSeriesData: []
  };

  if (orders.length > 0) {
    summary.averageOrderValue = summary.totalRevenue / orders.length;
  }

  // Generar datos de serie temporal
  const groupedData = groupOrdersByPeriod(orders, groupBy);
  summary.timeSeriesData = Object.entries(groupedData).map(([period, periodOrders]) => ({
    period,
    orders: periodOrders.length,
    revenue: periodOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
    averageOrderValue: periodOrders.length > 0 ? 
      periodOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0) / periodOrders.length : 0
  })).sort((a, b) => a.period.localeCompare(b.period));

  return summary;
}

function generateProductsAnalysis(orders) {
  const productStats = {};
  
  orders.forEach(order => {
    order.items?.forEach(item => {
      const productName = item.product || item.name || 'Producto sin nombre';
      if (!productStats[productName]) {
        productStats[productName] = {
          name: productName,
          totalQuantity: 0,
          totalRevenue: 0,
          ordersCount: 0,
          averagePrice: 0
        };
      }
      
      productStats[productName].totalQuantity += item.quantity || 1;
      productStats[productName].totalRevenue += (item.price || 0) * (item.quantity || 1);
      productStats[productName].ordersCount += 1;
    });
  });

  // Calcular precio promedio
  Object.values(productStats).forEach(product => {
    if (product.totalQuantity > 0) {
      product.averagePrice = product.totalRevenue / product.totalQuantity;
    }
  });

  const sortedProducts = Object.values(productStats)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return {
    topSellingProducts: sortedProducts.slice(0, 10),
    totalProducts: sortedProducts.length,
    totalProductsSold: sortedProducts.reduce((sum, p) => sum + p.totalQuantity, 0)
  };
}

function generateCustomersAnalysis(orders) {
  const customerStats = {};
  
  orders.forEach(order => {
    const email = order.customer?.email || 'Sin email';
    if (!customerStats[email]) {
      customerStats[email] = {
        email,
        name: order.customer?.name || 'Sin nombre',
        ordersCount: 0,
        totalSpent: 0,
        firstOrder: order.createdAt,
        lastOrder: order.createdAt
      };
    }
    
    customerStats[email].ordersCount += 1;
    customerStats[email].totalSpent += parseFloat(order.total) || 0;
    
    if (order.createdAt < customerStats[email].firstOrder) {
      customerStats[email].firstOrder = order.createdAt;
    }
    if (order.createdAt > customerStats[email].lastOrder) {
      customerStats[email].lastOrder = order.createdAt;
    }
  });

  const customers = Object.values(customerStats);
  
  return {
    totalCustomers: customers.length,
    repeatCustomers: customers.filter(c => c.ordersCount > 1).length,
    topCustomers: customers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10),
    customerLifetimeValue: customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0
  };
}

function generateRevenueTrends(orders, groupBy) {
  const trends = groupOrdersByPeriod(orders, groupBy);
  const periods = Object.keys(trends).sort();
  
  const trendData = periods.map((period, index) => {
    const periodOrders = trends[period];
    const revenue = periodOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    
    // Calcular crecimiento comparado con período anterior
    let growth = 0;
    if (index > 0) {
      const previousPeriod = trends[periods[index - 1]];
      const previousRevenue = previousPeriod.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
      if (previousRevenue > 0) {
        growth = ((revenue - previousRevenue) / previousRevenue) * 100;
      }
    }
    
    return {
      period,
      revenue,
      orders: periodOrders.length,
      growth: parseFloat(growth.toFixed(2))
    };
  });

  return {
    trendData,
    totalGrowth: trendData.length > 1 ? 
      trendData[trendData.length - 1].growth : 0,
    averageGrowth: trendData.reduce((sum, t) => sum + t.growth, 0) / trendData.length || 0
  };
}

function generateCompleteReport(orders, subscribers, groupBy) {
  return {
    sales: generateSalesSummary(orders, groupBy),
    products: generateProductsAnalysis(orders),
    customers: generateCustomersAnalysis(orders),
    revenue: generateRevenueTrends(orders, groupBy),
    newsletter: {
      totalSubscribers: subscribers.length,
      confirmedSubscribers: subscribers.filter(s => s.confirmed).length,
      unsubscribedCount: subscribers.filter(s => s.unsubscribed).length,
      conversionRate: subscribers.length > 0 ? 
        (subscribers.filter(s => s.confirmed).length / subscribers.length) * 100 : 0
    }
  };
}

function groupOrdersByPeriod(orders, groupBy) {
  const groups = {};
  
  orders.forEach(order => {
    let key;
    const date = order.createdAt;
    
    switch (groupBy) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'year':
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(order);
  });
  
  return groups;
}