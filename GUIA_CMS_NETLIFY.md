# 🎉 Panel de Administración Netlify CMS - Configurado

## ✅ Archivos Creados

### Panel Admin
- ✅ `ihara-london/admin/index.html` - Panel de administración
- ✅ `ihara-london/admin/config.yml` - Configuración del CMS

### Productos de Ejemplo
- ✅ `_products/anillo-heritage.json`
- ✅ `_products/collar-vintage.json`
- ✅ `_products/bolso-london-heritage.json`
- ✅ `_products/reloj-ihara-classic.json`

### Configuración
- ✅ `_config/general.json` - Configuración general de la tienda

### Loader
- ✅ `products-loader.js` - Carga dinámica de productos

---

## 🚀 Pasos para Activar el CMS

### 1️⃣ Habilitar Netlify Identity (IMPORTANTE)

Cuando subas el proyecto a Netlify:

1. Ve a tu sitio en Netlify Dashboard
2. Ve a **Site settings** > **Identity**
3. Haz clic en **Enable Identity**
4. En **Registration preferences** selecciona: **Invite only** (solo por invitación)
5. En **External providers** puedes habilitar login con GitHub, Google, etc.

### 2️⃣ Habilitar Git Gateway

1. En **Identity** > **Services**
2. Haz clic en **Enable Git Gateway**
3. Esto permite que el CMS guarde cambios en tu repositorio

### 3️⃣ Invitar Usuarios

1. Ve a **Identity** > **Invite users**
2. Ingresa el email de tu cliente
3. Le llegará un email para crear su contraseña

### 4️⃣ Acceder al Panel Admin

Una vez configurado, tu cliente puede acceder a:

```
https://tu-sitio.netlify.app/admin
```

O localmente:
```
http://localhost:8888/admin
```

---

## 👤 Cómo Usa el Panel tu Cliente

### Iniciar Sesión
1. Ir a `tutienda.com/admin`
2. Hacer clic en "Login with Netlify Identity"
3. Ingresar email y contraseña

### Agregar Producto Nuevo
1. Click en **Productos** en el menú lateral
2. Click en **Nuevo Producto**
3. Llenar el formulario:
   - Nombre del producto
   - Precio
   - Categoría
   - Material
   - Descripción
   - Subir fotos (drag & drop)
   - Seleccionar colores
   - Seleccionar talles
   - Stock disponible
4. Click en **Save** (arriba a la derecha)
5. Click en **Publish** para publicar

### Editar Producto Existente
1. Click en **Productos**
2. Click en el producto a editar
3. Modificar campos necesarios
4. **Save** > **Publish**

### Eliminar Producto
1. Abrir el producto
2. Click en **Delete entry** (abajo)
3. Confirmar

---

## 📦 Características del Panel

### Gestión de Productos
- ✅ Nombre, precio, descripción
- ✅ Categorías (anillos, collares, bolsos, etc.)
- ✅ Múltiples fotos por producto
- ✅ Colores disponibles
- ✅ Talles disponibles
- ✅ Control de stock
- ✅ Productos destacados
- ✅ Nuevos ingresos
- ✅ Ofertas con precio original
- ✅ SEO por producto

### Gestión de Imágenes
- ✅ Upload con drag & drop
- ✅ Vista previa instantánea
- ✅ Optimización automática
- ✅ Hasta 5 fotos por producto

### Configuración General
- ✅ Nombre de la tienda
- ✅ Email y teléfono
- ✅ Dirección
- ✅ Logo
- ✅ Moneda
- ✅ IVA
- ✅ Envío gratis desde...

### Vista Previa en Tiempo Real
- ✅ Ve cómo queda el producto antes de publicar
- ✅ Preview automático en el panel

---

## 🔧 Comandos Útiles

### Desarrollar localmente con CMS
```bash
cd "c:\Users\jesus\OneDrive\Escritorio\Aye pagina"
npm run dev
```

Luego visita: `http://localhost:8888/admin`

### Deploy a producción
```bash
npm run deploy
```

---

## 📝 Estructura de un Producto JSON

```json
{
  "nombre": "Anillo Heritage",
  "precio": 155.00,
  "categoria": "anillos",
  "material": "oro",
  "rating": 4.8,
  "descripcion_corta": "Anillo minimalista de oro",
  "descripcion": "Descripción completa...",
  "fotos": ["/public/images/products/anillo1.jpg"],
  "colores": ["oro", "plata", "rose-gold"],
  "talles": ["Único"],
  "stock": 25,
  "destacado": true,
  "nuevo": false,
  "en_oferta": false,
  "activo": true,
  "fecha_creacion": "2025-01-15"
}
```

---

## 🎨 Personalización Adicional

### Agregar más categorías
Editar `admin/config.yml` línea 28:
```yaml
options: ["anillos", "collares", "bolsos", "tu-nueva-categoria"]
```

### Agregar más colores
Editar `admin/config.yml` línea 35:
```yaml
options:
  - {label: "Tu Color", value: "tu-color"}
```

### Cambiar idioma del panel
Ya está en español por defecto:
```yaml
locale: 'es'
```

---

## 🔒 Seguridad

- ✅ Autenticación requerida (Netlify Identity)
- ✅ Solo usuarios invitados pueden acceder
- ✅ Git Gateway maneja permisos
- ✅ Cambios versionados en Git
- ✅ Rollback disponible desde Git

---

## 🐛 Troubleshooting

### No puedo acceder al /admin
- Verifica que Netlify Identity esté habilitado
- Verifica que Git Gateway esté habilitado
- Limpia caché del navegador

### Las imágenes no se suben
- Verifica permisos en `admin/config.yml`
- Verifica que la carpeta `public/images/products` exista

### Los productos no aparecen en la tienda
- Verifica que el archivo `products-loader.js` esté incluido en el HTML
- Revisa la consola del navegador para errores

---

## 📞 Soporte

Si tu cliente tiene dudas, puede consultar:
- [Documentación Netlify CMS](https://www.netlifycms.org/docs/)
- [Video tutorial Netlify Identity](https://www.netlify.com/docs/identity/)

---

## ✨ Próximos Pasos

1. **Subir a Netlify** (si aún no lo hiciste)
2. **Habilitar Identity & Git Gateway**
3. **Invitar a tu cliente**
4. **Capacitar en uso del panel** (5-10 min)

¡Tu cliente ya puede gestionar toda su tienda sin tocar código! 🎉
