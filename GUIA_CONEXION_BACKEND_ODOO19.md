# Guía de Conexión Backend: Odoo 19 & Frontend POS

Esta guía explica a los desarrolladores backend cómo **enganchar este frontend POS con una instancia de Odoo 19** en menos de 5 minutos.

---

## 🏗️ Arquitectura de Integración

El sistema cuenta con un puente bidireccional completamente desacoplado:

1. **En el Backend (Odoo 19)**:
   - Módulo: `pos_institucional_ec`
   - Controlador API: `pos_institucional_ec/controllers/main.py`
   - Modelos: `res.partner`, `product.template`, `pos.order`, `pos.session`, `pos.deposito.bancario`.

2. **En el Frontend (Web POS)**:
   - Archivo de configuración: [`odoo_api_config.js`](./odoo_api_config.js)
   - Adaptador: `OdooBackendService` integrado de forma transparente en `app.js`.

---

## 🔌 Paso 1: Configurar la URL en el Frontend

Edita el archivo [`odoo_api_config.js`](./odoo_api_config.js):

```javascript
const ODOO_BACKEND_CONFIG = {
  // 1. Activar conexión real con Odoo
  active: true,

  // 2. URL de tu servidor Odoo 19
  serverUrl: 'http://localhost:8069',

  // 3. Nombre de la base de datos de Odoo
  database: 'odoo19_db',

  // 4. Credenciales de acceso
  auth: {
    username: 'admin',
    password: 'admin_password'
  }
};
```

*(También puedes configurarlo visualmente haciendo clic en el botón **"Odoo 19: Simulado"** en la barra superior del POS).*

---

## 📡 Paso 2: Endpoints Disponibles en Odoo 19

El controlador [`pos_institucional_ec/controllers/main.py`](./pos_institucional_ec/controllers/main.py) expone los siguientes métodos JSON-RPC:

### 1. Healthcheck / Ping
- **Ruta**: `POST /api/pos/ping`
- **Respuesta**:
  ```json
  { "status": "ok", "server": "Odoo 19.0", "module": "pos_institucional_ec" }
  ```

### 2. Carga Inicial de Datos (`init_data`)
- **Ruta**: `POST /api/pos/init_data`
- **Devuelve**:
  - `session`: Sesión activa del cajero (`id`, `name`, `fondo_sencillo_inicial`, `punto_emision`).
  - `products`: Catálogo de trámites con `codigo_institucional`, `partida_presupuestaria`, `cuenta_contable_institucional`, `tratamiento_tributario`.
  - `partners`: Contribuyentes con `vat`, `tipo_identificacion`, `tipo_contribuyente`, `es_tercera_edad`.

### 3. Asentar Orden Cobrada (`create_order`)
- **Ruta**: `POST /api/pos/create_order`
- **Recibe**: Payload con líneas de la orden, contribuyente, bases imponibles (IVA 0%, IVA 15%, Exento), deducciones y número de recaudación.
- **Crea**: Registro en `pos.order` y `pos.order.line` con validación contable y tributaria.

### 4. Registro de Depósito Bancario (`register_deposit`)
- **Ruta**: `POST /api/pos/register_deposit`
- **Recibe**: Número de papeleta, banco depositario (`bce`), monto en USD y observación.
- **Crea**: Registro en `pos.deposito.bancario` asociado a la Cuenta Rotativa Única.

---

## 🛡️ Modo Dual: Simulado vs En Vivo

- **Si Odoo NO está corriendo o `active: false`**: El frontend funciona de forma 100% autónoma en modo demostración utilizando `LocalStorage` (ideal para presentaciones a clientes sin servidor).
- **Si Odoo está activo (`active: true`)**: El frontend envía automáticamente cada venta y depósito al servidor Odoo 19 y recibe los IDs de base de datos.
