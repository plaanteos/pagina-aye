// Admin Dashboard Extensions
// Additional functionality for orders and newsletter management

class OrdersManager {
    constructor(adminDashboard) {
        this.dashboard = adminDashboard;
        this.currentFilters = {
            status: 'all',
            limit: 20,
            offset: 0,
            search: '',
            startDate: '',
            endDate: ''
        };
    }

    async loadOrders() {
        try {
            const params = new URLSearchParams(this.currentFilters).toString();
            const response = await fetch(`/api/orders/list?${params}`, {
                headers: {
                    'x-admin-key': this.dashboard.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.renderOrdersSection(data);

        } catch (error) {
            console.error('Error loading orders:', error);
            this.showOrdersError('Error cargando las ventas');
        }
    }

    renderOrdersSection(data) {
        const { orders, pagination, stats } = data;
        
        const html = `
            <div class="orders-header">
                <div class="stats-mini">
                    <div class="stat-mini">
                        <h4>Total Ventas</h4>
                        <span>${stats.total}</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Aprobadas</h4>
                        <span class="positive">${stats.approved}</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Pendientes</h4>
                        <span class="neutral">${stats.pending}</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Ingresos Total</h4>
                        <span>€${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="orders-filters">
                    <div class="filter-row">
                        <select id="statusFilter" onchange="ordersManager.updateFilter('status', this.value)">
                            <option value="all">Todos los estados</option>
                            <option value="approved">Aprobado</option>
                            <option value="pending">Pendiente</option>
                            <option value="rejected">Rechazado</option>
                        </select>
                        
                        <input type="text" id="searchFilter" placeholder="Buscar por cliente, email o ID..." 
                               value="${this.currentFilters.search}" 
                               onkeyup="ordersManager.handleSearchKeyup(event)">
                               
                        <input type="date" id="startDateFilter" 
                               onchange="ordersManager.updateFilter('startDate', this.value)">
                               
                        <input type="date" id="endDateFilter" 
                               onchange="ordersManager.updateFilter('endDate', this.value)">
                               
                        <button class="btn btn-primary" onclick="ordersManager.exportOrders()">
                            📊 Exportar CSV
                        </button>
                    </div>
                </div>
            </div>

            <div class="orders-table-container">
                <table class="orders-table enhanced">
                    <thead>
                        <tr>
                            <th>ID Orden</th>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Productos</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>
                                    <span class="order-id" title="${order.id}">${(order.id || '').substring(0, 8)}...</span>
                                </td>
                                <td>${new Date(order.createdAt).toLocaleDateString('es-ES')}</td>
                                <td>${order.customer?.name || 'Sin nombre'}</td>
                                <td>${order.customer?.email || 'Sin email'}</td>
                                <td class="amount">€${(order.total || 0).toFixed(2)}</td>
                                <td>
                                    <span class="status-badge status-${order.payment_status || 'unknown'}">
                                        ${this.dashboard.getStatusText(order.payment_status)}
                                    </span>
                                </td>
                                <td class="products-cell">
                                    <span class="products-count">${order.items?.length || 0} productos</span>
                                    ${order.items?.length > 0 ? `
                                        <div class="products-preview">
                                            ${order.items.slice(0, 2).map(item => 
                                                `<span class="product-tag">${item.product || item.name || 'Sin nombre'}</span>`
                                            ).join('')}
                                            ${order.items.length > 2 ? `<span class="more-products">+${order.items.length - 2} más</span>` : ''}
                                        </div>
                                    ` : ''}
                                </td>
                                <td>
                                    <button class="btn-action" onclick="ordersManager.viewOrderDetails('${order.id}')">
                                        👁️ Ver
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            ${this.renderPagination(pagination)}
        `;

        document.getElementById('ordersContent').innerHTML = html;
        this.updateFilterValues();
    }

    renderPagination(pagination) {
        const { total, offset, limit, hasMore } = pagination;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(total / limit);

        return `
            <div class="pagination">
                <div class="pagination-info">
                    Mostrando ${offset + 1}-${Math.min(offset + limit, total)} de ${total} pedidos
                </div>
                <div class="pagination-controls">
                    <button class="btn" ${offset === 0 ? 'disabled' : ''} 
                            onclick="ordersManager.changePage(${currentPage - 1})">
                        ← Anterior
                    </button>
                    <span class="page-info">Página ${currentPage} de ${totalPages}</span>
                    <button class="btn" ${!hasMore ? 'disabled' : ''} 
                            onclick="ordersManager.changePage(${currentPage + 1})">
                        Siguiente →
                    </button>
                </div>
            </div>
        `;
    }

    updateFilter(key, value) {
        this.currentFilters[key] = value;
        this.currentFilters.offset = 0; // Reset to first page
        this.loadOrders();
    }

    updateFilterValues() {
        document.getElementById('statusFilter').value = this.currentFilters.status;
        document.getElementById('searchFilter').value = this.currentFilters.search;
        document.getElementById('startDateFilter').value = this.currentFilters.startDate;
        document.getElementById('endDateFilter').value = this.currentFilters.endDate;
    }

    handleSearchKeyup(event) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.updateFilter('search', event.target.value);
        }, 500);
    }

    changePage(page) {
        const newOffset = (page - 1) * this.currentFilters.limit;
        this.currentFilters.offset = Math.max(0, newOffset);
        this.loadOrders();
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/orders/details?id=${orderId}`, {
                headers: {
                    'x-admin-key': this.dashboard.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            this.showOrderModal(data.order);

        } catch (error) {
            console.error('Error loading order details:', error);
            alert('Error cargando detalles del pedido');
        }
    }

    showOrderModal(order) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Detalles del Pedido</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="order-details">
                        <div class="detail-section">
                            <h4>Información General</h4>
                            <div class="detail-grid">
                                <div><strong>ID:</strong> ${order.id}</div>
                                <div><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString('es-ES')}</div>
                                <div><strong>Estado:</strong> <span class="status-badge status-${order.payment_status}">${this.dashboard.getStatusText(order.payment_status)}</span></div>
                                <div><strong>Total:</strong> ${order.formattedTotal || `€${order.total}`}</div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Información del Cliente</h4>
                            <div class="detail-grid">
                                <div><strong>Nombre:</strong> ${order.customer?.name || 'Sin nombre'}</div>
                                <div><strong>Email:</strong> ${order.customer?.email || 'Sin email'}</div>
                                <div><strong>Teléfono:</strong> ${order.customer?.phone || 'Sin teléfono'}</div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Productos (${order.itemsCount || 0})</h4>
                            <div class="products-list">
                                ${order.items?.map(item => `
                                    <div class="product-item">
                                        <div class="product-name">${item.product || item.name || 'Sin nombre'}</div>
                                        <div class="product-details">
                                            <span>Cantidad: ${item.quantity || 1}</span>
                                            <span>Precio: €${(item.price || 0).toFixed(2)}</span>
                                            <span>Subtotal: €${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                        </div>
                                    </div>
                                `).join('') || '<p>No hay productos en este pedido</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    async exportOrders() {
        try {
            const params = new URLSearchParams({
                format: 'csv',
                status: this.currentFilters.status,
                startDate: this.currentFilters.startDate,
                endDate: this.currentFilters.endDate
            }).toString();

            const response = await fetch(`/api/orders/export?${params}`, {
                headers: {
                    'x-admin-key': this.dashboard.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ventas-ihara-london-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting orders:', error);
            alert('Error exportando las ventas');
        }
    }

    showOrdersError(message) {
        document.getElementById('ordersContent').innerHTML = `
            <div class="error-message">
                ${message}
                <button class="btn btn-primary" onclick="ordersManager.loadOrders()" style="margin-left: 10px;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

class NewsletterManager {
    constructor(adminDashboard) {
        this.dashboard = adminDashboard;
    }

    async loadNewsletter() {
        try {
            // Load both subscribers and metrics
            const [subscribersResponse, metricsResponse] = await Promise.all([
                fetch('/api/newsletter/list', {
                    headers: {
                        'x-admin-key': this.dashboard.apiKey
                    }
                }),
                fetch('/api/newsletter/metrics', {
                    headers: {
                        'x-admin-key': this.dashboard.apiKey
                    }
                })
            ]);

            if (!subscribersResponse.ok || !metricsResponse.ok) {
                throw new Error('Error loading newsletter data');
            }

            const subscribersData = await subscribersResponse.json();
            const metricsData = await metricsResponse.json();

            this.renderNewsletterSection(subscribersData, metricsData);

        } catch (error) {
            console.error('Error loading newsletter data:', error);
            this.showNewsletterError('Error cargando datos del newsletter');
        }
    }

    renderNewsletterSection(subscribersData, metricsData) {
        const { items: subscribers } = subscribersData;
        const stats = metricsData.stats || {};

        const html = `
            <div class="newsletter-header">
                <div class="stats-mini">
                    <div class="stat-mini">
                        <h4>Total Suscriptores</h4>
                        <span>${stats.totalSubscriptions || 0}</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Confirmados</h4>
                        <span class="positive">${stats.totalConfirmations || 0}</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Tasa Conversión</h4>
                        <span>${(stats.conversionRate || 0).toFixed(1)}%</span>
                    </div>
                    <div class="stat-mini">
                        <h4>Activos</h4>
                        <span>${stats.activeSubscribers || 0}</span>
                    </div>
                </div>
                
                <div class="newsletter-actions">
                    <button class="btn btn-primary" onclick="newsletterManager.exportSubscribers()">
                        📊 Exportar CSV
                    </button>
                </div>
            </div>

            <div class="subscribers-table-container">
                <table class="orders-table enhanced">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Fecha Suscripción</th>
                            <th>Confirmado</th>
                            <th>Fecha Confirmación</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${subscribers.map(subscriber => `
                            <tr>
                                <td>${subscriber.email}</td>
                                <td>${new Date(subscriber.createdAt).toLocaleDateString('es-ES')}</td>
                                <td>
                                    ${subscriber.confirmed ? 
                                        '<span class="status-badge status-approved">Sí</span>' : 
                                        '<span class="status-badge status-pending">No</span>'
                                    }
                                </td>
                                <td>
                                    ${subscriber.confirmedAt ? 
                                        new Date(subscriber.confirmedAt).toLocaleDateString('es-ES') : 
                                        '-'
                                    }
                                </td>
                                <td>
                                    ${subscriber.unsubscribed ? 
                                        '<span class="status-badge status-rejected">Desuscrito</span>' :
                                        subscriber.confirmed ?
                                        '<span class="status-badge status-approved">Activo</span>' :
                                        '<span class="status-badge status-pending">Pendiente</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="newsletter-metrics">
                <h4>Métricas Detalladas</h4>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h5>Eventos Recientes</h5>
                        <div class="recent-events">
                            ${(metricsData.recentEvents || []).slice(0, 10).map(event => `
                                <div class="event-item">
                                    <span class="event-type">${event.type}</span>
                                    <span class="event-email">${event.email}</span>
                                    <span class="event-date">${new Date(event.timestamp).toLocaleString('es-ES')}</span>
                                </div>
                            `).join('') || '<p>No hay eventos recientes</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('newsletterContent').innerHTML = html;
    }

    async exportSubscribers() {
        try {
            const response = await fetch('/api/newsletter/export', {
                headers: {
                    'x-admin-key': this.dashboard.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `suscriptores-newsletter-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting subscribers:', error);
            alert('Error exportando suscriptores');
        }
    }

    showNewsletterError(message) {
        document.getElementById('newsletterContent').innerHTML = `
            <div class="error-message">
                ${message}
                <button class="btn btn-primary" onclick="newsletterManager.loadNewsletter()" style="margin-left: 10px;">
                    Reintentar
                </button>
            </div>
        `;
    }
}

class ReportsManager {
    constructor(adminDashboard) {
        this.dashboard = adminDashboard;
        this.currentReport = null;
    }

    init() {
        // Setup event handlers for custom date range
        document.getElementById('reportPeriod').addEventListener('change', (e) => {
            const customDateRange = document.getElementById('customDateRange');
            if (e.target.value === 'custom') {
                customDateRange.style.display = 'flex';
            } else {
                customDateRange.style.display = 'none';
            }
        });

        // Generate initial report
        this.generateReport();
    }

    async generateReport() {
        const reportType = document.getElementById('reportType').value;
        const period = document.getElementById('reportPeriod').value;
        const groupBy = document.getElementById('groupBy').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        const params = new URLSearchParams({
            reportType,
            period,
            groupBy
        });

        if (period === 'custom') {
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
        }

        try {
            document.getElementById('reportResults').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

            const response = await fetch(`/api/reports/sales?${params.toString()}`, {
                headers: {
                    'x-admin-key': this.dashboard.apiKey
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reportData = await response.json();
            this.currentReport = reportData;
            this.renderReport(reportData);

        } catch (error) {
            console.error('Error generating report:', error);
            document.getElementById('reportResults').innerHTML = 
                '<div class="error-message">Error generando el reporte. Verifica tu API key.</div>';
        }
    }

    renderReport(reportData) {
        const container = document.getElementById('reportResults');
        const { reportType } = reportData;

        let html = `
            <div class="report-header">
                <h3>📊 ${this.getReportTitle(reportType)}</h3>
                <div class="report-meta">
                    <span>Generado: ${new Date(reportData.generatedAt).toLocaleString('es-ES')}</span>
                    <span>Datos analizados: ${reportData.dataPoints} órdenes</span>
                    <button class="btn btn-primary" onclick="reportsManager.exportReport()">
                        📄 Exportar PDF
                    </button>
                </div>
            </div>
        `;

        switch (reportType) {
            case 'sales-summary':
                html += this.renderSalesSummary(reportData);
                break;
            case 'products-analysis':
                html += this.renderProductsAnalysis(reportData);
                break;
            case 'customers-analysis':
                html += this.renderCustomersAnalysis(reportData);
                break;
            case 'revenue-trends':
                html += this.renderRevenueTrends(reportData);
                break;
            case 'complete-report':
                html += this.renderCompleteReport(reportData);
                break;
        }

        container.innerHTML = html;
    }

    getReportTitle(reportType) {
        const titles = {
            'sales-summary': 'Resumen de Ventas',
            'products-analysis': 'Análisis de Productos',
            'customers-analysis': 'Análisis de Clientes', 
            'revenue-trends': 'Tendencias de Ingresos',
            'complete-report': 'Reporte Completo'
        };
        return titles[reportType] || reportType;
    }

    renderSalesSummary(data) {
        return '<div class="report-section"><p>Resumen de ventas cargando...</p></div>';
    }

    renderProductsAnalysis(data) {
        return '<div class="report-section"><p>Análisis de productos cargando...</p></div>';
    }

    renderCustomersAnalysis(data) {
        return '<div class="report-section"><p>Análisis de clientes cargando...</p></div>';
    }

    renderRevenueTrends(data) {
        return '<div class="report-section"><p>Tendencias de ingresos cargando...</p></div>';
    }

    renderCompleteReport(data) {
        return '<div class="complete-report"><p>Reporte completo cargando...</p></div>';
    }

    exportReport() {
        if (!this.currentReport) {
            alert('No hay reporte para exportar');
            return;
        }

        const printWindow = window.open('', '_blank');
        const reportContent = document.getElementById('reportResults').innerHTML;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reporte - Ihara & London</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .report-stats { display: flex; gap: 20px; margin: 20px 0; }
                        .report-stat { text-align: center; padding: 15px; border: 1px solid #ddd; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                        th { background: #f5f5f5; }
                        .positive { color: green; }
                        .negative { color: red; }
                    </style>
                </head>
                <body>
                    <h1>Reporte - Ihara & London</h1>
                    <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
                    ${reportContent}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }
}

// Global instances
let ordersManager = null;
let newsletterManager = null;
let reportsManager = null;

// Initialize when dashboard is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for main dashboard to be initialized
    const checkDashboard = setInterval(() => {
        if (window.adminDashboard) {
            ordersManager = new OrdersManager(window.adminDashboard);
            newsletterManager = new NewsletterManager(window.adminDashboard);
            reportsManager = new ReportsManager(window.adminDashboard);
            
            // Override the load methods in the main dashboard
            window.adminDashboard.loadOrdersData = () => ordersManager.loadOrders();
            window.adminDashboard.loadNewsletterData = () => newsletterManager.loadNewsletter();
            window.reportsManager = reportsManager;
            
            clearInterval(checkDashboard);
        }
    }, 100);
});