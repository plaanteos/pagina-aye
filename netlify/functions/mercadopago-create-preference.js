const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    options: {
        timeout: 5000,
        idempotencyKey: 'abc'
    }
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
        const body = JSON.parse(event.body);
    const { items, customer, payment_method } = body;

        // Validar datos requeridos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Items requeridos' })
            };
        }

        if (!customer || !customer.email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Datos del cliente requeridos' })
            };
        }

        // Configurar preferencia de pago
        const preference = new Preference(client);

        // Tipos de pago permitidos: tarjeta crédito/débito, efectivo (ticket) y transferencia bancaria
        const ALLOWED_TYPES = ['credit_card', 'debit_card', 'ticket', 'bank_transfer'];
        const ALL_TYPES = [
            'account_money',
            'ticket',
            'bank_transfer',
            'atm',
            'debit_card',
            'credit_card',
            'prepaid_card',
            'digital_currency',
            'digital_wallet'
        ];
        const EXCLUDED_TYPES = ALL_TYPES
            .filter((t) => !ALLOWED_TYPES.includes(t))
            .map((id) => ({ id }));

        const selectedType = String((payment_method?.type || payment_method?.method || '')).toLowerCase();
        const reqInst = Number(payment_method?.installments || 0);
        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        // Débito: 1 cuota; Crédito: solicitar o por defecto 12 (clamp 1..12)
        const maxInstallments = selectedType === 'debit_card'
            ? 1
            : clamp(Number.isFinite(reqInst) && reqInst > 0 ? reqInst : 12, 1, 12);

        const preferenceData = {
            items: items.map(item => ({
                id: item.id,
                title: item.title,
                quantity: item.quantity,
                unit_price: parseFloat(item.price),
                currency_id: 'ARS'
            })),
            payer: {
                name: customer.name,
                surname: customer.surname || '',
                email: customer.email,
                phone: {
                    area_code: customer.phone?.area_code || '11',
                    number: customer.phone?.number || ''
                },
                identification: {
                    type: customer.identification?.type || 'DNI',
                    number: customer.identification?.number || ''
                },
                address: {
                    street_name: customer.address?.street || '',
                    street_number: customer.address?.number || 0,
                    zip_code: customer.address?.zip_code || ''
                }
            },
            back_urls: {
                success: `${process.env.APP_BASE_URL || 'https://iharalondon.netlify.app'}/payment-success.html`,
                failure: `${process.env.APP_BASE_URL || 'https://iharalondon.netlify.app'}/payment-failure.html`,
                pending: `${process.env.APP_BASE_URL || 'https://iharalondon.netlify.app'}/payment-pending.html`
            },
            auto_return: 'approved',
            payment_methods: {
                excluded_payment_methods: [],
                excluded_payment_types: EXCLUDED_TYPES,
                installments: maxInstallments
            },
            notification_url: `${process.env.APP_BASE_URL || 'https://iharalondon.netlify.app'}/.netlify/functions/mercadopago-webhook`,
            statement_descriptor: 'IHARA&LONDON',
            external_reference: `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Aplicar descuentos según método de pago
        // Sin descuentos automáticos por tipo de pago

        // Nota: ya restringimos a los tipos permitidos globalmente; no necesitamos
        // cambiar exclusiones según 'payment_method.method' del frontend.

        // Crear preferencia
        const result = await preference.create({ body: preferenceData });

        // Log para debugging (en producción, usar un logger apropiado)
        console.log('Mercado Pago preference created:', {
            id: result.id,
            external_reference: preferenceData.external_reference,
            customer_email: customer.email
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                preference_id: result.id,
                init_point: result.init_point,
                sandbox_init_point: result.sandbox_init_point,
                external_reference: preferenceData.external_reference,
                qr_code: result.qr_code
            })
        };

    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Error interno del servidor',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando el pago'
            })
        };
    }
};
