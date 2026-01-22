#!/usr/bin/env node

/**
 * Script de configuración de entorno
 * Ejecutar: npm run setup:env
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('⚙️ CONFIGURADOR DE ENTORNO - IHARA & LONDON');
console.log('==========================================');

/**
 * Generar API key segura
 */
function generateApiKey() {
    const prefix = 'ihara_admin_';
    const randomBytes = crypto.randomBytes(16).toString('hex');
    return prefix + randomBytes;
}

/**
 * Crear archivo .env.local para desarrollo
 */
function createLocalEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envPath)) {
        console.log('📄 Archivo .env.local ya existe, no se sobrescribirá');
        return false;
    }
    
    const apiKey = generateApiKey();
    const currentDate = new Date().toISOString().split('T')[0];
    
    const envContent = `# Configuración de desarrollo local - Ihara & London
# Generado automáticamente el ${currentDate}

# ==========================================
# ADMINISTRACIÓN (OBLIGATORIO)
# ==========================================
ADMIN_API_KEY=${apiKey}
JWT_SECRET=${crypto.randomBytes(32).toString('hex')}

# ==========================================
# EMAIL (OPCIONAL para desarrollo)
# ==========================================
# SENDGRID_API_KEY=SG.tu-sendgrid-key-aqui
# EMAIL_USER=info@iharalondon.com
# EMAIL_PASS=tu-app-password-aqui

# ==========================================
# PAGOS (OPCIONAL para testing)
# ==========================================
# MERCADOPAGO_ACCESS_TOKEN=TEST-tu-token-de-test
# MERCADOPAGO_PUBLIC_KEY=TEST-tu-public-key-de-test

# ==========================================
# CONFIGURACIÓN LOCAL
# ==========================================
NODE_ENV=development
BASE_URL=http://localhost:8888

# ==========================================
# INSTRUCCIONES:
# ==========================================
# 1. Copia ADMIN_API_KEY a las variables de entorno de Netlify
# 2. Para testing local: netlify dev
# 3. Accede a: http://localhost:8888/dashboard
# 4. Configura la API key en el dashboard: ${apiKey}
`;

    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Archivo .env.local creado en: ${envPath}`);
    console.log(`🔑 API Key generada: ${apiKey}`);
    
    return { envPath, apiKey };
}

/**
 * Validar estructura de archivos
 */
function validateFiles() {
    const requiredFiles = [
        'ihara-london/admin-dashboard.html',
        'ihara-london/assets/js/admin-dashboard-extensions.js',
        'netlify/functions/dashboard-stats.js',
        'netlify/functions/orders-list.js',
        'netlify.toml'
    ];
    
    console.log('\n🔍 Validando archivos del dashboard...');
    
    let allValid = true;
    for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - ¡FALTANTE!`);
            allValid = false;
        }
    }
    
    return allValid;
}

/**
 * Mostrar instrucciones de configuración
 */
function showInstructions(apiKey) {
    console.log('\n🚀 CONFIGURACIÓN COMPLETA');
    console.log('========================');
    console.log('');
    console.log('📝 PASOS SIGUIENTES:');
    console.log('');
    console.log('1. 🌐 CONFIGURAR EN NETLIFY:');
    console.log('   - Ve a tu dashboard de Netlify');
    console.log('   - Site settings → Environment variables');
    console.log(`   - Agrega: ADMIN_API_KEY = ${apiKey}`);
    console.log('   - Redeploy el sitio');
    console.log('');
    console.log('2. 🧪 TESTING LOCAL:');
    console.log('   npm run dev          # Iniciar servidor local');
    console.log('   npm run test:admin   # Ejecutar tests');
    console.log('');
    console.log('3. 🎯 ACCEDER AL DASHBOARD:');
    console.log('   Local:      http://localhost:8888/dashboard');
    console.log('   Producción: https://tudominio.com/dashboard');
    console.log('');
    console.log('4. 🔐 CONFIGURAR API KEY EN EL DASHBOARD:');
    console.log('   - Inicia sesión con Netlify Identity');
    console.log('   - Ve a Configuración');
    console.log(`   - Ingresa API key: ${apiKey}`);
    console.log('   - Guarda y disfruta! 🎉');
    console.log('');
    console.log('📚 MÁS INFO:');
    console.log('   - DASHBOARD_ADMIN_COMPLETO.md');
    console.log('   - GUIA_PRODUCCION.md');
    console.log('');
}

/**
 * Crear script de deploy rápido
 */
function createDeployScript() {
    const scriptPath = path.join(process.cwd(), 'deploy-admin.sh');
    
    const scriptContent = `#!/bin/bash

# Script de deploy rápido para Dashboard Admin
# Generado automáticamente

echo "🚀 DEPLOY DASHBOARD ADMIN - IHARA & LONDON"
echo "========================================="

# Verificar dependencias
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI no está instalado"
    echo "📦 Instalando: npm install -g netlify-cli"
    npm install -g netlify-cli
fi

# Build del proyecto
echo "🔨 Building proyecto..."
npm run build

# Deploy a producción
echo "🌐 Deploying a producción..."
netlify deploy --prod --dir=ihara-london --functions=netlify/functions

echo "✅ Deploy completado!"
echo "🎯 Dashboard disponible en: https://tudominio.com/dashboard"
`;

    fs.writeFileSync(scriptPath, scriptContent);
    
    // Hacer ejecutable en Unix
    if (process.platform !== 'win32') {
        fs.chmodSync(scriptPath, '755');
    }
    
    console.log(`📜 Script de deploy creado: ${scriptPath}`);
    console.log('   Ejecutar: ./deploy-admin.sh');
}

/**
 * Función principal
 */
function main() {
    // Validar archivos
    const filesValid = validateFiles();
    if (!filesValid) {
        console.log('\n❌ Algunos archivos requeridos faltan.');
        console.log('   Ejecuta la implementación completa primero.');
        process.exit(1);
    }
    
    console.log('\n✅ Todos los archivos están presentes');
    
    // Crear configuración local
    const envResult = createLocalEnv();
    let apiKey = envResult ? envResult.apiKey : 'configurar-manualmente';
    
    // Crear script de deploy
    createDeployScript();
    
    // Mostrar instrucciones
    showInstructions(apiKey);
}

// Ejecutar si es el script principal
if (require.main === module) {
    main();
}

module.exports = { generateApiKey, createLocalEnv, validateFiles };