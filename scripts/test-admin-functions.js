#!/usr/bin/env node

/**
 * Test script para validar funciones administrativas
 * Ejecutar: npm run test:admin
 */

const https = require('https');
const http = require('http');

// Configuración de testing
const CONFIG = {
    baseUrl: process.env.SITE_URL || 'http://localhost:8888',
    apiKey: process.env.ADMIN_API_KEY || 'test-key',
    timeout: 5000
};

console.log('🧪 TESTING DASHBOARD ADMINISTRATIVO - IHARA & LONDON');
console.log('================================================');
console.log(`📍 Base URL: ${CONFIG.baseUrl}`);
console.log(`🔑 API Key: ${CONFIG.apiKey ? '✅ Configurada' : '❌ No configurada'}`);
console.log('');

// Test cases
const tests = [
    {
        name: 'Dashboard Stats',
        path: '/api/dashboard/stats',
        method: 'GET',
        requiresAuth: true,
        expectedStatus: 200
    },
    {
        name: 'Orders List',
        path: '/api/orders/list',
        method: 'GET',
        requiresAuth: true,
        expectedStatus: 200
    },
    {
        name: 'Newsletter List',
        path: '/api/newsletter/list',
        method: 'GET',
        requiresAuth: true,
        expectedStatus: 200
    },
    {
        name: 'Sales Reports',
        path: '/api/reports/sales?reportType=sales-summary',
        method: 'GET',
        requiresAuth: true,
        expectedStatus: 200
    },
    {
        name: 'Dashboard Page',
        path: '/dashboard',
        method: 'GET',
        requiresAuth: false,
        expectedStatus: 200
    }
];

/**
 * Realizar request HTTP/HTTPS
 */
function makeRequest(options) {
    return new Promise((resolve, reject) => {
        const protocol = options.hostname === 'localhost' ? http : https;
        
        const req = protocol.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.setTimeout(CONFIG.timeout);
        req.end();
    });
}

/**
 * Ejecutar un test individual
 */
async function runTest(test) {
    const url = new URL(CONFIG.baseUrl + test.path);
    
    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: test.method,
        headers: {
            'User-Agent': 'Ihara-Admin-Test/1.0'
        }
    };
    
    // Agregar autenticación si es requerida
    if (test.requiresAuth && CONFIG.apiKey) {
        options.headers['x-admin-key'] = CONFIG.apiKey;
    }
    
    try {
        const result = await makeRequest(options);
        
        const passed = result.status === test.expectedStatus;
        const emoji = passed ? '✅' : '❌';
        const status = passed ? 'PASS' : 'FAIL';
        
        console.log(`${emoji} ${test.name}: ${status} (${result.status})`);
        
        if (!passed) {
            console.log(`   Expected: ${test.expectedStatus}, Got: ${result.status}`);
        }
        
        // Validaciones adicionales para endpoints JSON
        if (passed && test.path.includes('/api/') && result.status === 200) {
            try {
                const jsonData = JSON.parse(result.data);
                console.log(`   📄 Respuesta JSON válida`);
                
                // Validaciones específicas
                if (test.path.includes('/dashboard/stats')) {
                    if (jsonData.sales && jsonData.newsletter) {
                        console.log(`   📊 Estructura de estadísticas correcta`);
                    }
                }
                
                if (test.path.includes('/orders/list')) {
                    if (jsonData.orders && jsonData.pagination) {
                        console.log(`   🛍️ Estructura de ventas correcta`);
                    }
                }
                
            } catch (e) {
                console.log(`   ⚠️ Respuesta no es JSON válido`);
            }
        }
        
        return passed;
        
    } catch (error) {
        console.log(`❌ ${test.name}: ERROR (${error.message})`);
        return false;
    }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
    console.log('🚀 Iniciando tests...\n');
    
    let passed = 0;
    let total = tests.length;
    
    for (const test of tests) {
        const result = await runTest(test);
        if (result) passed++;
        console.log(''); // Línea en blanco
    }
    
    console.log('================================================');
    console.log(`📊 Resultados: ${passed}/${total} tests pasaron`);
    
    if (passed === total) {
        console.log('🎉 ¡Todos los tests pasaron! Dashboard listo para usar.');
        process.exit(0);
    } else {
        console.log('⚠️ Algunos tests fallaron. Revisar configuración.');
        process.exit(1);
    }
}

/**
 * Validaciones previas
 */
function validateEnvironment() {
    if (!CONFIG.apiKey || CONFIG.apiKey === 'test-key') {
        console.log('⚠️ ADVERTENCIA: ADMIN_API_KEY no está configurada');
        console.log('   Para testing completo, configura la variable de entorno');
        console.log('   export ADMIN_API_KEY="tu-clave-segura"');
        console.log('');
    }
    
    if (CONFIG.baseUrl.includes('localhost')) {
        console.log('🔧 Testing en desarrollo local');
        console.log('   Asegúrate de tener el servidor corriendo: npm run dev');
        console.log('');
    } else {
        console.log('🌐 Testing en producción');
        console.log('   Verificando endpoints remotos...');
        console.log('');
    }
}

// Ejecutar tests
if (require.main === module) {
    validateEnvironment();
    runAllTests().catch(error => {
        console.error('💥 Error ejecutando tests:', error);
        process.exit(1);
    });
}

module.exports = { runAllTests, runTest };