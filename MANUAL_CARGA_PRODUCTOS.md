# 📦 GUÍA PARA CARGAR PRODUCTOS - IHARA & LONDON

## 🌐 ACCESO AL PANEL DE ADMINISTRACIÓN

### URL del Panel Admin:
```
https://iharalondon.netlify.app/admin
```

### Datos de Acceso:
- **Email:** El que te enviaron por invitación
- **Contraseña:** La que creaste al aceptar la invitación

---

## ➕ CÓMO AGREGAR UN PRODUCTO NUEVO

### Paso 1: Ingresar al Panel
1. Ir a: **https://iharalondon.netlify.app/admin**
2. Hacer clic en **"Login with Netlify Identity"**
3. Ingresar tu email y contraseña

### Paso 2: Crear Producto
1. En el menú lateral, hacer clic en **"Productos"**
2. Hacer clic en el botón **"Nuevo Producto"** (arriba a la derecha)
3. Completar el formulario con los datos del producto

---

## 📋 CAMPOS DEL FORMULARIO - EXPLICACIÓN COMPLETA

### 1️⃣ **Nombre del Producto** *(Obligatorio)*
**Qué es:** El nombre que verán los clientes
**Ejemplo:** `Anillo Heritage London`
**Consejo:** Usa nombres descriptivos y atractivos

---

### 2️⃣ **Precio (en euros)** *(Obligatorio)*
**Qué es:** Precio de venta en euros (€)
**Ejemplo:** `155.00` o `228.50`
**Importante:** 
- Usar punto (.) para decimales, NO coma
- No poner el símbolo €, solo el número
- Ejemplos correctos: `99.00`, `249.90`, `1250.00`

---

### 3️⃣ **Categoría** *(Obligatorio)*
**Qué es:** Tipo de producto
**Opciones disponibles:**
- `anillos` - Para anillos
- `collares` - Para collares y cadenas
- `bolsos` - Para carteras y bolsos
- `relojes` - Para relojes
- `gafas` - Para anteojos/lentes
- `pulseras` - Para pulseras y brazaletes
- `pendientes` - Para aros/aretes
- `accesorios` - Para otros accesorios

**Ejemplo:** Seleccionar `anillos` si es un anillo

---

### 4️⃣ **Material** *(Obligatorio)*
**Qué es:** Material principal del producto
**Opciones disponibles:**
- `oro` - Oro (cualquier quilate)
- `plata` - Plata 925 o similar
- `bronce` - Bronce o latón
- `acero` - Acero inoxidable
- `cuero` - Cuero genuino
- `tela` - Tela o textil
- `plastico` - Plástico o acetato
- `madera` - Madera
- `otro` - Cualquier otro material

**Ejemplo:** Seleccionar `oro` para un anillo de oro

---

### 5️⃣ **Rating (1-5)** *(Opcional)*
**Qué es:** Calificación del producto en estrellas
**Rango:** De 1.0 a 5.0
**Ejemplo:** `4.8` o `5.0`
**Por defecto:** Si no lo completás, se pone `5.0`
**Consejo:** Usar entre 4.5 y 5.0 para productos premium

---

### 6️⃣ **Descripción Corta** *(Obligatorio)*
**Qué es:** Resumen breve que aparece en la tarjeta del producto
**Ejemplo:** `Anillo minimalista de oro 18k con diseño atemporal.`
**Límite:** Máximo 100 caracteres
**Consejo:** Ser concisa pero atractiva

---

### 7️⃣ **Descripción Completa** *(Obligatorio)*
**Qué es:** Descripción detallada del producto
**Ejemplo:**
```
Anillo de oro 18 quilates con diseño minimalista que captura 
la esencia de la elegancia británica. Acabado pulido espejo 
que refleja la luz con cada movimiento. Perfecto para uso 
diario o ocasiones especiales. Hipoalergénico y resistente 
al agua. Incluye caja de regalo premium.
```
**Consejo:** Incluir:
- Material y calidad
- Características especiales
- Ocasiones de uso
- Qué incluye

---

### 8️⃣ **Fotos del Producto** *(Obligatorio - Mínimo 1)*
**Qué es:** Imágenes del producto
**Cantidad:** De 1 a 5 fotos
**Formato aceptado:** JPG, PNG, WebP
**Tamaño recomendado:** 1200x1200px o similar
**Peso máximo:** 5MB por foto

**Cómo subir fotos:**
1. Hacer clic en **"Agregar foto"**
2. Arrastrar la imagen o hacer clic para buscar
3. Esperar a que se suba (aparece una barra de progreso)
4. Repetir para agregar más fotos

**Consejo:**
- Primera foto: La principal que se verá en la tienda
- Fotos siguientes: Diferentes ángulos, detalles, producto en uso
- Usar fotos con buena iluminación y fondo limpio

---

### 9️⃣ **Colores Disponibles** *(Opcional)*
**Qué es:** Colores en los que viene el producto
**Cómo seleccionar:** Hacer clic en los colores que apliquen
**Opciones disponibles:**
- ☐ Oro
- ☐ Plata
- ☐ Rose Gold
- ☐ Negro
- ☐ Blanco
- ☐ Marrón
- ☐ Azul
- ☐ Rojo
- ☐ Verde
- ☐ Rosa

**Ejemplo:** Para un anillo disponible en oro y plata, marcar ambos
**Consejo:** Si es color único, seleccionar solo ese o dejarlo vacío

---

### 🔟 **Talles Disponibles** *(Opcional)*
**Qué es:** Tamaños o talles del producto
**Cómo seleccionar:** Hacer clic en los talles disponibles
**Opciones:**
- ☐ XS
- ☐ S
- ☐ M
- ☐ L
- ☐ XL
- ☐ XXL
- ☐ Único

**Ejemplo:** 
- Para joyería: Seleccionar `Único`
- Para bolsos/ropa: Seleccionar `S`, `M`, `L`, etc.
**Consejo:** Si no tiene talles, seleccionar `Único`

---

### 1️⃣1️⃣ **Stock Disponible** *(Obligatorio)*
**Qué es:** Cantidad de unidades disponibles
**Ejemplo:** `25` (si tenés 25 unidades)
**Importante:** 
- Poner `0` si está agotado
- Actualizar cuando vendas o recibas stock nuevo

---

### 1️⃣2️⃣ **Producto Destacado** *(Opcional)*
**Qué es:** Marcar si querés destacar este producto
**Opciones:** ☐ Activar / ☐ Desactivar
**Cuándo usar:** Para productos principales o best sellers
**Por defecto:** Desactivado

---

### 1️⃣3️⃣ **Nuevo Ingreso** *(Opcional)*
**Qué es:** Mostrar badge "Nuevo" en el producto
**Opciones:** ☐ Activar / ☐ Desactivar
**Cuándo usar:** Para productos recién agregados
**Consejo:** Desactivar después de 1-2 meses
**Por defecto:** Desactivado

---

### 1️⃣4️⃣ **En Oferta** *(Opcional)*
**Qué es:** Marcar si el producto está con descuento
**Opciones:** ☐ Activar / ☐ Desactivar
**Importante:** Si activás esto, completar el siguiente campo
**Por defecto:** Desactivado

---

### 1️⃣5️⃣ **Precio Original (si está en oferta)** *(Opcional)*
**Qué es:** Precio anterior antes del descuento
**Ejemplo:** Si ahora cuesta €180 y antes €220, poner `220.00`
**Cuándo completar:** Solo si activaste "En Oferta"
**Resultado:** Se mostrará tachado el precio viejo y el % de descuento

---

### 1️⃣6️⃣ **Activo** *(Opcional)*
**Qué es:** Mostrar u ocultar el producto en la tienda
**Opciones:** ☐ Activar / ☐ Desactivar
**Por defecto:** Activado
**Cuándo desactivar:** 
- Si querés preparar el producto pero no mostrarlo todavía
- Si temporalmente no tenés stock
**Consejo:** Mejor desactivar que borrar el producto

---

### 1️⃣7️⃣ **Fecha de Creación** *(Opcional)*
**Qué es:** Fecha en que agregaste el producto
**Formato:** AAAA-MM-DD (2025-12-24)
**Por defecto:** Se completa automáticamente con la fecha actual
**Consejo:** Dejar el valor automático

---

### 1️⃣8️⃣ **SEO** *(Opcional - Avanzado)*
**Qué es:** Configuración para buscadores (Google)
**Campos:**
- **Título SEO:** Título optimizado para Google
- **Descripción SEO:** Descripción para resultados de búsqueda
- **Palabras Clave:** Palabras relacionadas separadas por comas

**Ejemplo:**
```
Título SEO: Anillo Heritage London - Oro 18k Minimalista | Ihara & London
Descripción SEO: Anillo de oro 18k con diseño minimalista. Elegancia atemporal británica. Envío gratis.
Palabras Clave: anillo oro, joyería minimalista, anillo elegante
```
**Consejo:** Si no sabés qué poner, dejarlo vacío

---

## 💾 GUARDAR Y PUBLICAR

### Paso 1: Guardar
- Hacer clic en el botón **"Save"** (arriba a la derecha)
- Esto guarda el producto como borrador

### Paso 2: Publicar
- Hacer clic en el botón **"Publish"** (arriba a la derecha)
- Ahora el producto aparecerá en la tienda

### Estados del Producto:
- **Draft (Borrador):** Guardado pero no visible en la tienda
- **In Review (En revisión):** Esperando aprobación
- **Ready (Listo):** Publicado y visible para los clientes

---

## 📝 EJEMPLO COMPLETO DE PRODUCTO

### Datos a Completar:

```
Nombre del Producto: Collar Vintage Dreams
Precio: 228.00
Categoría: collares
Material: bronce
Rating: 4.6
Descripción Corta: Collar artesanal con piedras naturales seleccionadas
Descripción Completa: 
  Collar artesanal elaborado con piedras naturales 
  cuidadosamente seleccionadas. Base de bronce antiguo 
  con baño de oro. Cada pieza es única debido a las 
  variaciones naturales de las piedras. Longitud ajustable. 
  Incluye caja de regalo premium.

Fotos: [Subir 2-3 fotos del collar]
Colores: ☑ Oro ☑ Bronce
Talles: ☑ Único
Stock: 15
Producto Destacado: ☑ Activado
Nuevo Ingreso: ☑ Activado
En Oferta: ☐ Desactivado
Activo: ☑ Activado
```

---

## ✏️ EDITAR UN PRODUCTO EXISTENTE

1. Ir a **https://iharalondon.netlify.app/admin**
2. Hacer clic en **"Productos"** en el menú lateral
3. Hacer clic en el producto que querés editar
4. Modificar los campos necesarios
5. **Save** → **Publish**

---

## 🗑️ ELIMINAR UN PRODUCTO

1. Abrir el producto a eliminar
2. Hacer clic en **"Delete entry"** (abajo del formulario)
3. Confirmar la eliminación

**Importante:** Esta acción no se puede deshacer

**Alternativa:** En vez de eliminar, desactivar el producto (marcar "Activo" como desactivado)

---

## 🔄 ACTUALIZAR STOCK

### Cuando vendés un producto:
1. Ir al producto
2. Actualizar el campo **"Stock Disponible"**
3. Ejemplo: Si tenías 25 y vendiste 2, poner `23`
4. **Save** → **Publish**

### Cuando recibís más stock:
1. Ir al producto
2. Sumar las nuevas unidades al stock actual
3. **Save** → **Publish**

---

## 📸 CONSEJOS PARA FOTOS DE PRODUCTOS

### Calidad de Imagen:
✅ **Alta resolución:** Mínimo 1200x1200px
✅ **Buena iluminación:** Luz natural o artificial suave
✅ **Fondo limpio:** Blanco, negro o neutro
✅ **Enfoque nítido:** Producto bien definido

### Cantidad:
- **Mínimo:** 1 foto
- **Recomendado:** 3-4 fotos
- **Máximo:** 5 fotos

### Qué Mostrar:
1. **Foto principal:** Producto completo, vista frontal
2. **Foto 2:** Producto en uso (en mano, puesto)
3. **Foto 3:** Detalles (cierre, material, textura)
4. **Foto 4:** Otra vista o ángulo
5. **Foto 5:** Empaque o caja (opcional)

---

## ❓ PREGUNTAS FRECUENTES

### ¿Cuántos productos puedo cargar?
**Respuesta:** Ilimitados

### ¿Puedo cambiar las fotos después?
**Respuesta:** Sí, podés editarlo cuando quieras

### ¿Los cambios se ven inmediato?
**Respuesta:** Después de publicar, demora 1-2 minutos

### ¿Qué pasa si pongo stock en 0?
**Respuesta:** El producto se verá pero dirá "Agotado"

### ¿Puedo tener productos ocultos?
**Respuesta:** Sí, desactivando el campo "Activo"

### ¿Se pueden duplicar productos?
**Respuesta:** No directamente, pero podés copiar y pegar los datos en uno nuevo

---

## 📞 SOPORTE

Si tenés problemas o dudas:
- Revisar esta guía
- Verificar que todos los campos obligatorios estén completos
- Asegurarte de hacer clic en "Publish" después de "Save"

---

## 🎯 RESUMEN RÁPIDO

**Para Agregar Producto:**
1. Ir a: **https://iharalondon.netlify.app/admin**
2. Login con tu email
3. **Productos** → **Nuevo Producto**
4. Completar campos obligatorios (*)
5. Subir al menos 1 foto
6. **Save** → **Publish**

**Campos Obligatorios (*):**
- Nombre del Producto
- Precio
- Categoría
- Material
- Descripción Corta
- Descripción Completa
- Fotos (mínimo 1)
- Stock Disponible

¡Listo! Tu producto ya está en la tienda 🎉

---

**Última actualización:** Diciembre 2025
**Versión:** 1.0
