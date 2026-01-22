const fs = require('fs');
const path = require('path');

const filePath = './admin-dashboard.html';

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Reemplazar comillas curvas con comillas normales
content = content.replace(/[""]/g, '"');  // Reemplazar comillas dobles curvas
content = content.replace(/['']/g, "'");  // Reemplazar comillas simples curvas
content = content.replace(/[``]/g, "`");  // Reemplazar backticks curvas

// Guardar el archivo corregido
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Archivo corregido - comillas curvas reemplazadas por comillas normales');