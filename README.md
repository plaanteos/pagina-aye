# Ihara & London Store

Sitio e-commerce premium con carrito, favoritos, checkout multi-paso y newsletter con doble opt-in. Desplegable en Netlify con funciones serverless para backend y contenido estático optimizado.

## 🚀 Características Principales

### E-commerce Core
- ✅ Catálogo de productos con filtros avanzados
- ✅ Carrito de compras con persistencia localStorage
- ✅ Sistema de favoritos completo
- ✅ Checkout multi-paso con validación
- ✅ Integración con MercadoPago
- ✅ Gestión de variantes (tallas, colores)

### Sistemas de Comunicación
- ✅ Newsletter doble opt-in con JWT
- ✅ Formulario de contacto con emails automáticos
- ✅ Sistema de métricas y analytics para newsletter
- ✅ Confirmación automática por email
- ✅ Panel de administración de suscriptores

### Seguridad & Performance
- ✅ Headers de seguridad avanzados (CSP, HSTS, X-Frame-Options)
- ✅ Sanitización de inputs y validación con Zod
- ✅ Rate limiting en funciones serverless
- ✅ Detección de patrones de ataque
- ✅ CSS/JS minificado y optimizado
- ✅ Lazy loading de imágenes
- ✅ PWA optimizations

### Accesibilidad
- ✅ WCAG 2.1 Nivel AA compliant
- ✅ Navegación completa por teclado
- ✅ Atributos ARIA implementados
- ✅ Soporte para lectores de pantalla
- ✅ Focus management en modales
- ✅ Respeto a prefers-reduced-motion

## 📁 Estructura

```
├── ihara-london/              # Sitio estático principal
│   ├── ihara_london_store.html
│   ├── assets/
│   │   ├── js/               # JavaScript optimizado
│   │   └── styles/           # CSS minificado
│   ├── public/images/        # Imágenes optimizadas
│   └── *.html               # Páginas adicionales
├── netlify/functions/        # Funciones serverless
│   ├── newsletter-*.js      # Sistema newsletter
│   ├── contact-submit.js    # Formulario contacto
│   ├── mercadopago-*.js     # Integración pagos
│   └── utils/               # Utilidades compartidas
├── netlify.toml             # Configuración Netlify
└── package.json             # Scripts y dependencias
```

## 🔐 Seguridad Implementada

### Rate Limiting
Todas las funciones serverless tienen rate limiting (5-10 req/min por IP):
- Newsletter subscribe: 10 req/min
- Contact form: 5 req/min
- Prevención de spam y ataques

### Sanitización y Validación
- Validación con Zod en todos los inputs
- Sanitización HTML para prevenir XSS
- Detección de patrones de inyección SQL
- Escape de caracteres especiales

### Headers de Seguridad
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=63072000
Content-Security-Policy: [configurado]
```

## 📊 Sistema de Métricas

### Endpoint de Métricas
```bash
GET /api/newsletter/metrics
Headers: x-admin-key: <ADMIN_API_KEY>
```

**Respuesta:**
```json
{
  "ok": true,
  "summary": {
    "totalSubscribes": 150,
    "totalConfirms": 120,
    "totalUnsubscribes": 5,
    "conversionRate": "80%",
    "activeSubscribers": 115
  },
  "metricsByDate": {
    "2025-01-15": { "subscribes": 10, "confirms": 8, "unsubscribes": 0 }
  },
  "recentEvents": [...]
}
```

## Flujo Newsletter (JWT stateless)
1. Usuario envía email a `/api/newsletter/subscribe` -> función genera JWT (expira en TOKEN_TTL_HOURS) y manda correo de confirmación.
2. Usuario hace clic en el enlace -> `/api/newsletter/confirm?token=...` -> valida token y envía bienvenida.
3. Se guarda en Netlify Blobs para persistencia (key: email, value: JSON con metadata).
4. Tracking automático de métricas (subscribes, confirms, unsubscribes).

## Variables de Entorno (Netlify)
Configurar en Dashboard (no subir `.env`). Basado en `.env.example`:

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| SENDGRID_API_KEY | API Key SendGrid con permiso Mail Send | ✅ Sí |
| FROM_EMAIL | Remitente verificado (Sender Auth o Domain Auth) | ✅ Sí |
| JWT_SECRET | Secreto para firmar tokens (min 48 caracteres) | ✅ Sí |
| BRAND | Nombre marca en templates | ✅ Sí |
| TOKEN_TTL_HOURS | Horas de validez del token confirmación | ✅ Sí |
| APP_BASE_URL | URL pública final para enlaces | ✅ Sí |
| EMAIL_USER | Cuenta remitente para formulario de contacto | ✅ Sí |
| EMAIL_PASS | App password o contraseña SMTP | ✅ Sí |
| CONTACT_EMAIL | Email donde llegan consultas | No |
| ADMIN_API_KEY | Llave para endpoints admin (list/export/metrics) | No |
| SMTP_HOST | Host SMTP personalizado | No |
| SMTP_PORT | Puerto SMTP | No |
| SMTP_SECURE | Usar SSL/TLS | No |
| MERCADOPAGO_ACCESS_TOKEN | Token de MercadoPago | No |
| MERCADOPAGO_PUBLIC_KEY | Public Key de MercadoPago | No |

## Despliegue en Netlify (Pasos)
1. (Opcional) Crear repositorio GitHub y subir código.
2. En Netlify: New Site > Import from Git. Build command: (vacío). Publish directory: `ihara-london`.
3. Añadir variables de entorno (ver tabla arriba).
4. Verificar remitente en SendGrid (Sender o dominio). 
5. Deploy. 
6. Probar suscripción en `/ihara_london_store.html`.
7. Confirmar correo y recibir bienvenida.
8. (Opcional) Añadir dominio personalizado y luego APP_BASE_URL.

## Desarrollo Local con Netlify CLI
```bash
npx @netlify/cli login
npx @netlify/cli dev
# Abrir http://localhost:8888/ihara_london_store.html
```

## Deploy manual por CLI
```powershell
npm run build
npx @netlify/cli login
npm run deploy
```
Las funciones estarán en `/.netlify/functions/<nombre>` y accesibles vía redirects `/api/newsletter/...`.

## Mejoras Futuras Sugeridas
- Persistencia real de suscriptores (DB / KV).
- Endpoint `unsubscribe` + enlace en los correos (compliance).
- Webhooks SendGrid para métricas (aperturas / rebotes).
- Reintento y supresión de correos hard bounce.
- Limpieza de carpeta `server/` si ya no se usará.

## 🧪 Testing y Validación

### Lighthouse Score (Objetivos)
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 95

### Testing Manual
```bash
# Performance
npm run build
lighthouse https://iharalondon.netlify.app --view

# Accesibilidad
# Usar axe DevTools o WAVE
# Navegación solo por teclado
# Pruebas con NVDA/JAWS

# Seguridad
# Verificar headers con securityheaders.com
# Test XSS y SQL injection básicos
```

### Tests Automatizados (Futuro)
- Unit tests con Jest
- E2E tests con Playwright
- Visual regression con Percy
- Accessibility tests con axe-core

## 📈 Performance Optimizations

### Implementadas
- ✅ CSS/JS minificado y comprimido
- ✅ Lazy loading de imágenes con Intersection Observer
- ✅ Preload de recursos críticos
- ✅ Code splitting donde sea posible
- ✅ Compresión Gzip/Brotli en Netlify
- ✅ CDN global de Netlify
- ✅ Cache headers optimizados

### Recomendaciones Adicionales
- Usar WebP para todas las imágenes
- Implementar Service Worker para PWA offline
- Lazy load de componentes no críticos
- Implementar skeleton screens

## Endpoints Admin
Si defines `ADMIN_API_KEY`:
- `GET /api/newsletter/list` header `x-admin-key: <ADMIN_API_KEY>` devuelve JSON.
- `GET /api/newsletter/export` header `x-admin-key: <ADMIN_API_KEY>` descarga CSV.
- `GET /api/newsletter/metrics` header `x-admin-key: <ADMIN_API_KEY>` devuelve métricas.

## 📚 Documentación Adicional

Ver guías en la raíz del proyecto:
- `GUIA_PRODUCCION.md` - Checklist completo para deploy
- `ACCESIBILIDAD.md` - Guía de accesibilidad WCAG 2.1
- `IMPLEMENTACION_FINAL_100.md` - Documentación técnica completa
- `.env.example` - Variables de entorno con ejemplos

## 🚀 Próximos Pasos

### Corto Plazo
1. Agregar imágenes reales de productos
2. Configurar credenciales de producción
3. Activar Analytics (GA4, Facebook Pixel, Hotjar)
4. Pruebas con usuarios reales
5. Deploy a producción

### Mediano Plazo
- Base de datos PostgreSQL para órdenes
- Panel de administración completo
- Integración con WhatsApp Business
- Sistema de cupones/descuentos
- Programa de fidelización
- Multi-idioma (ES/EN)

### Largo Plazo
- App móvil nativa
- AR para probar productos
- IA para recomendaciones personalizadas
- Blockchain para certificados de autenticidad

## 🆘 Soporte y Troubleshooting

### Problemas Comunes

**Newsletter no envía:**
- Verificar SENDGRID_API_KEY en Netlify
- Verificar FROM_EMAIL verificado en SendGrid
- Revisar logs: Netlify Functions → newsletter-subscribe

**Formulario contacto falla:**
- Verificar EMAIL_USER y EMAIL_PASS
- Si Gmail: usar App Password, no contraseña normal
- Revisar logs de contact-submit

**Rate limiting excesivo:**
- Ajustar valores en `utils/security.js`
- Implementar whitelist de IPs confiables

### Logs y Debugging
```bash
# Ver logs en tiempo real (desarrollo local)
netlify dev

# Ver logs de producción
netlify logs:function newsletter-subscribe
netlify logs:function contact-submit
```

## 📞 Contacto

Para soporte técnico o consultas:
- Email: info@iharalondon.com
- Instagram: [@ihara_calzado](https://www.instagram.com/ihara_calzado)
- Ubicación: Ituzaingó 562, San Cristóbal, Santa Fe, Argentina

---

## Licencia
Uso interno del proyecto. © 2025 Ihara & London. Todos los derechos reservados.
