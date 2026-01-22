# 📋 Guía de Preparación para Producción - Ihara & London

## 1. ✅ Imágenes Reales

### Imágenes Requeridas

#### Productos (public/images/products/)
- [ ] 12 imágenes de productos principales (800x800px, WebP optimizado)
- [ ] Múltiples ángulos por producto (opcional)
- [ ] Imágenes de variantes de color

#### Blog (public/images/blog/)
- [ ] blog-1.jpg - Tendencias de joyería 2025 (600x400px)
- [ ] blog-2.jpg - Cuidado de joyas (600x400px)
- [ ] blog-3.jpg - Guía de regalos (600x400px)
- [ ] blog-4.jpg - Historia de la joyería (600x400px)

#### Sobre Nosotros (public/images/about/)
- [ ] workshop.jpg - Taller de artesanos (800x500px)

#### Equipo (public/images/team/)
- [ ] yuki-ihara.jpg - Foto de Yuki Ihara (300x300px)
- [ ] victoria-london.jpg - Foto de Victoria London (300x300px)

### Optimización de Imágenes

```bash
# Instalar herramienta de optimización
npm install -g sharp-cli

# Optimizar imágenes
sharp -i input.jpg -o output.webp --webp

# O usar el script integrado
npm run optimize-images
```

---

## 2. 🔐 Configuración de Credenciales en Netlify

### Variables de Entorno Obligatorias

1. **Ir a Netlify Dashboard** → Tu sitio → Site settings → Environment variables

2. **Agregar las siguientes variables:**

```bash
# ✅ OBLIGATORIO - SendGrid para emails
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@tudominio.com

# ✅ OBLIGATORIO - Seguridad JWT
JWT_SECRET=tu_clave_secreta_muy_larga_de_al_menos_48_caracteres_aleatoria

# ✅ OBLIGATORIO - Configuración de marca
BRAND=Ihara & London
TOKEN_TTL_HOURS=48

# ✅ OBLIGATORIO - URL base
APP_BASE_URL=https://iharalondon.netlify.app

# ✅ OBLIGATORIO - Email de contacto (Nodemailer)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail
CONTACT_EMAIL=info@iharalondon.com

# 🔶 OPCIONAL - SMTP personalizado
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# 💳 OBLIGATORIO - Mercado Pago (cuando esté listo para pagos reales)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxx  # Usar PROD cuando estés listo
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxx

# 📊 OPCIONAL - Analytics (admin)
ADMIN_API_KEY=tu_clave_admin_aleatoria_para_exportar_suscriptores

# 🗄️ FUTURO - Base de datos
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Cómo Obtener las Credenciales

#### SendGrid
1. Ir a https://sendgrid.com/
2. Crear cuenta gratuita (100 emails/día gratis)
3. Settings → API Keys → Create API Key
4. Copiar la clave (solo se muestra una vez)

#### Gmail App Password
1. Ir a https://myaccount.google.com/security
2. Activar verificación en 2 pasos
3. Ir a "App passwords"
4. Generar nueva contraseña de aplicación
5. Usar esta contraseña (no tu contraseña normal)

#### Mercado Pago
1. Ir a https://www.mercadopago.com.ar/developers/
2. Crear aplicación
3. Obtener credenciales de TEST primero
4. Cuando estés listo, usar credenciales de PRODUCCIÓN

---

## 3. 📊 Analytics - Activación

### Google Analytics 4

1. Crear propiedad en https://analytics.google.com/
2. Obtener Measurement ID (G-XXXXXXXXXX)
3. Actualizar en [analytics-config.html](ihara-london/analytics-config.html):

```javascript
// Línea 12-13
gtag('config', 'TU_MEASUREMENT_ID_REAL');
```

### Facebook Pixel

1. Ir a Facebook Business Manager → Events Manager
2. Crear Pixel
3. Obtener Pixel ID
4. Actualizar en [analytics-config.html](ihara-london/analytics-config.html):

```javascript
// Línea 24
fbq('init', 'TU_FACEBOOK_PIXEL_ID_REAL');
```

### Hotjar

1. Crear cuenta en https://www.hotjar.com/
2. Obtener Site ID
3. Actualizar en [analytics-config.html](ihara-london/analytics-config.html):

```javascript
// Línea 58
h._hjSettings={hjid:TU_HOTJAR_ID_REAL,hjsv:6};
```

---

## 4. 🚀 Checklist Pre-Deploy

### Antes de Ir a Producción

- [ ] Todas las imágenes reales están cargadas
- [ ] Todas las variables de entorno están configuradas en Netlify
- [ ] Analytics IDs actualizados con IDs reales
- [ ] SendGrid funcionando (enviar email de prueba)
- [ ] Mercado Pago en modo TEST funcionando
- [ ] Todos los formularios probados
- [ ] Revisar que no haya console.log en producción
- [ ] Lighthouse score > 90
- [ ] Probar en móvil real
- [ ] Verificar SSL activo
- [ ] Sitemap.xml actualizado
- [ ] Robots.txt configurado
- [ ] Dominio personalizado configurado (opcional)

### Comandos de Deploy

```bash
# 1. Instalar dependencias
npm install

# 2. Optimizar y construir
npm run build

# 3. Deploy a Netlify
npm run deploy

# O push a Git (deploy automático)
git add .
git commit -m "Ready for production"
git push origin main
```

---

## 5. 📱 Post-Deploy Testing

### Verificaciones Obligatorias

1. **Funcionalidad**
   - [ ] Newsletter suscripción y confirmación
   - [ ] Formulario de contacto
   - [ ] Carrito de compras
   - [ ] Checkout completo
   - [ ] Mercado Pago redirect

2. **Performance**
   - [ ] Lighthouse (Performance > 90)
   - [ ] WebPageTest (First Contentful Paint < 2s)
   - [ ] Imágenes lazy loading funcionando

3. **SEO**
   - [ ] Meta tags completos
   - [ ] Open Graph funcionando (probar con Facebook Debugger)
   - [ ] Twitter Cards funcionando
   - [ ] Sitemap accesible

4. **Seguridad**
   - [ ] HTTPS activo
   - [ ] Headers de seguridad correctos
   - [ ] No hay credenciales expuestas en código

---

## 6. 🔄 Mantenimiento Continuo

### Tareas Mensuales
- Revisar analytics (GA4, Hotjar)
- Exportar lista de suscriptores
- Revisar logs de Netlify Functions
- Actualizar contenido del blog
- Optimizar imágenes nuevas

### Tareas Trimestrales
- Actualizar dependencias npm
- Revisar lighthouse scores
- Actualizar contenido SEO
- A/B testing de CTA

---

## 7. 🆘 Soporte y Troubleshooting

### Problemas Comunes

**Newsletter no envía emails:**
- Verificar SENDGRID_API_KEY en Netlify
- Revisar logs: Netlify → Functions → newsletter-subscribe
- Verificar que FROM_EMAIL esté verificado en SendGrid

**Formulario de contacto falla:**
- Verificar EMAIL_USER y EMAIL_PASS
- Si usas Gmail, verificar App Password
- Revisar logs de contact-submit function

**Mercado Pago no redirige:**
- Verificar MERCADOPAGO_ACCESS_TOKEN
- Usar credenciales TEST primero
- Revisar logs de mercadopago-create-preference

### Contacto de Soporte
- Netlify Docs: https://docs.netlify.com/
- SendGrid Support: https://support.sendgrid.com/
- Mercado Pago Devs: https://www.mercadopago.com.ar/developers/

---

## 8. 📈 Mejoras Futuras

### Fase 2 (Opcional)
- [ ] Base de datos para persistencia real
- [ ] Panel de administración
- [ ] Sistema de órdenes completo
- [ ] Integración con WhatsApp Business
- [ ] Chat en vivo
- [ ] Sistema de cupones/descuentos
- [ ] Programa de fidelización

---

**✅ Con esta guía, el sitio estará 100% listo para producción profesional.**
