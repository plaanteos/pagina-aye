const { MercadoPagoConfig, Payment } = require('mercadopago');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Manejar preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        const body = event.body ? JSON.parse(event.body) : {};
        
        // Validar que la notificación viene de Mercado Pago
        const signature = event.headers['x-signature'];
        const requestId = event.headers['x-request-id'];
        
        if (!signature || !requestId) {
            console.log('Missing signature or request ID');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Signature requerida' })
            };
        }

        // Extraer información de la notificación
        const { type, data } = body;
        
        if (!type || !data || !data.id) {
            console.log('Invalid notification format:', body);
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Formato de notificación inválido' })
            };
        }

        console.log('Webhook notification received:', {
            type,
            id: data.id,
            timestamp: new Date().toISOString()
        });

        // Procesar según el tipo de notificación
        switch (type) {
            case 'payment':
                await handlePaymentNotification(data.id);
                break;
            case 'plan':
                console.log('Plan notification received:', data.id);
                break;
            case 'subscription':
                console.log('Subscription notification received:', data.id);
                break;
            case 'invoice':
                console.log('Invoice notification received:', data.id);
                break;
            default:
                console.log('Unknown notification type:', type);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'OK' })
        };

    } catch (error) {
        console.error('Error processing webhook:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor'
            })
        };
    }
};

async function handlePaymentNotification(paymentId) {
    try {
        const payment = new Payment(client);
        const paymentData = await payment.get({ id: paymentId });

        console.log('Payment notification processed:', {
            id: paymentData.id,
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            external_reference: paymentData.external_reference,
            transaction_amount: paymentData.transaction_amount,
            payer_email: paymentData.payer?.email
        });

        // Aquí puedes agregar lógica adicional según el estado del pago
        switch (paymentData.status) {
            case 'approved':
                await handleApprovedPayment(paymentData);
                break;
            case 'pending':
                await handlePendingPayment(paymentData);
                break;
            case 'rejected':
                await handleRejectedPayment(paymentData);
                break;
            case 'cancelled':
                await handleCancelledPayment(paymentData);
                break;
            case 'refunded':
                await handleRefundedPayment(paymentData);
                break;
            case 'charged_back':
                await handleChargebackPayment(paymentData);
                break;
            default:
                console.log('Unknown payment status:', paymentData.status);
        }

    } catch (error) {
        console.error('Error getting payment details:', error);
        throw error;
    }
}

async function handleApprovedPayment(paymentData) {
    console.log('Payment approved:', paymentData.id);
    
    // Aquí puedes:
    // 1. Actualizar el estado del pedido en tu base de datos
    // 2. Enviar email de confirmación al cliente
    // 3. Actualizar inventario
    // 4. Generar factura
    
    try {
        // Ejemplo: Enviar email de confirmación
        await sendConfirmationEmail(paymentData);
        
        // Ejemplo: Actualizar estado del pedido
        await updateOrderStatus(paymentData.external_reference, 'paid');
        
    } catch (error) {
        console.error('Error handling approved payment:', error);
    }
}

async function handlePendingPayment(paymentData) {
    console.log('Payment pending:', paymentData.id);
    
    // Manejar pagos pendientes (ej: efectivo, transferencia)
    try {
        await updateOrderStatus(paymentData.external_reference, 'pending');
        await sendPendingPaymentEmail(paymentData);
    } catch (error) {
        console.error('Error handling pending payment:', error);
    }
}

async function handleRejectedPayment(paymentData) {
    console.log('Payment rejected:', paymentData.id);
    
    try {
        await updateOrderStatus(paymentData.external_reference, 'rejected');
        await sendRejectedPaymentEmail(paymentData);
    } catch (error) {
        console.error('Error handling rejected payment:', error);
    }
}

async function handleCancelledPayment(paymentData) {
    console.log('Payment cancelled:', paymentData.id);
    
    try {
        await updateOrderStatus(paymentData.external_reference, 'cancelled');
    } catch (error) {
        console.error('Error handling cancelled payment:', error);
    }
}

async function handleRefundedPayment(paymentData) {
    console.log('Payment refunded:', paymentData.id);
    
    try {
        await updateOrderStatus(paymentData.external_reference, 'refunded');
        await sendRefundEmail(paymentData);
    } catch (error) {
        console.error('Error handling refunded payment:', error);
    }
}

async function handleChargebackPayment(paymentData) {
    console.log('Payment charged back:', paymentData.id);
    
    try {
        await updateOrderStatus(paymentData.external_reference, 'chargeback');
        // Notificar al equipo de administración
    } catch (error) {
        console.error('Error handling chargeback payment:', error);
    }
}

// Funciones auxiliares (implementar según tu infraestructura)
async function sendConfirmationEmail(paymentData) {
    // Implementar envío de email de confirmación
    console.log('Sending confirmation email for payment:', paymentData.id);
}

async function sendPendingPaymentEmail(paymentData) {
    // Implementar envío de email para pago pendiente
    console.log('Sending pending payment email for:', paymentData.id);
}

async function sendRejectedPaymentEmail(paymentData) {
    // Implementar envío de email para pago rechazado
    console.log('Sending rejected payment email for:', paymentData.id);
}

async function sendRefundEmail(paymentData) {
    // Implementar envío de email para reembolso
    console.log('Sending refund email for payment:', paymentData.id);
}

async function updateOrderStatus(externalReference, status) {
    // Implementar actualización de estado en base de datos
    console.log('Updating order status:', { externalReference, status });
}
