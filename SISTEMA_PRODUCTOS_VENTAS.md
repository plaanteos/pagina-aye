# IMPORTANTE - SISTEMA DE PRODUCTOS Y VENTAS

## 🔒 Estado Inicial: SIN DATOS

La aplicación **NO tiene productos precargados**. 

### ✅ Productos
- Se agregan **manualmente** desde el panel admin
- Solo usuarios autenticados pueden agregarlos
- URL: https://iharalondon.netlify.app/admin

### ✅ Ventas/Pedidos
Las ventas **SÍ se guardan automáticamente** cuando:

1. Cliente completa el checkout
2. Cliente paga con MercadoPago
3. MercadoPago envía webhook a tu servidor
4. Se guarda en Netlify Blobs:
   - Datos del pedido
   - Productos comprados
   - Monto pagado
   - Estado del pago
   - Información del cliente

### 📦 Dónde se Guardan las Ventas

**Base de datos:** Netlify Blobs
**Store:** `orders` o similar (configurado en las funciones serverless)

**Información guardada:**
```json
{
  "order_id": "MP-12345",
  "customer": {
    "name": "María González",
    "email": "maria@example.com",
    "phone": "+54 9 1234567890"
  },
  "items": [
    {
      "product": "Anillo Elegance",
      "quantity": 1,
      "price": 45.90
    }
  ],
  "total": 45.90,
  "payment_status": "approved",
  "payment_method": "Mercado Pago",
  "created_at": "2025-08-28T10:30:00Z"
}
```

### 🚀 Flujo de Compra

1. Cliente agrega productos al carrito
2. Completa datos en checkout
3. Hace clic en "Pagar con MercadoPago"
4. MercadoPago procesa el pago
5. **Webhook automático guarda la venta**
6. Cliente recibe confirmación por email

### 📊 Ver Ventas

Las ventas se pueden consultar mediante:
- Funciones serverless personalizadas
- Panel admin (si se implementa)
- Netlify Blobs directamente

### ⚙️ Archivos Relevantes

- `netlify/functions/mercadopago-webhook.js` - Recibe notificaciones de pago
- `netlify/functions/mercadopago-create-preference.js` - Crea orden de pago
- Sistema de Blobs - Almacena datos

---

**Resumen:**
- ❌ Productos NO vienen precargados
- ✅ Ventas SÍ se guardan automáticamente
- 🔐 Solo usuarios autorizados agregan productos
