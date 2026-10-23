# Módulo Odoo 19: POS Recaudación y Ventanilla Institucional (Ecuador)

Este módulo es un **Addon nativo para Odoo 19** diseñado con la arquitectura oficial de Odoo: **Python 3, PostgreSQL, XML QWeb y componentes reactivos en OWL 2 (Odoo Web Library)**.

---

## 🏛️ Características Principales

1. **Gestión de Contribuyentes Ecuatorianos (`res.partner`)**:
   - Tipos de identificación oficial: Cédula (10 dígitos), RUC (13 dígitos con validación), Pasaporte, Consumidor Final.
   - Tipos de contribuyente: Persona Natural, Sociedad Jurídica, Sector Público, Contribuyente Especial.
   - Beneficios de ley: Tercera Edad (50% de exoneración) y Discapacidad (según carnet CONADIS/MSP).

2. **Conceptos, Tasas y Derechos (`product.template`)**:
   - Clasificación por categorías: *Tasas*, *Inspecciones*, *Servicios*, *Arriendos*.
   - Tratamientos tributarios según normativa del SRI:
     - `IVA_0`: Tarifa IVA 0% (Tasas y servicios administrativos públicos).
     - `IVA_15`: Tarifa IVA 15% (Inspecciones técnicas, arrendamiento de bienes públicos).
     - `EXENTO`: Exento de IVA (Copias certificadas y planimetría).
     - `NO_OBJETO`: No objeto de impuesto (Derechos de trámite).
   - Clasificador presupuestario oficial (ej. `13.01.08.01`).
   - Catálogo de cuentas de finanzas públicas (ej. `6.1.3.05`).
   - Unidad administrativa responsable (ej. *Dirección Financiera*, *Rentas*).

3. **Punto de Venta Odoo 19 en OWL 2 (`point_of_sale._assets_pos`)**:
   - Pantalla dividida con Numpad táctil reactivo (`Cant`, `% Desc`, `Precio`, `⌫`).
   - Trazabilidad presupuestaria y contable desplegable en tiempo real.
   - Botones de cobro rápido de efectivo (`$5`, `$10`, `$20`, `$50`, `$100`, `Exacto`) con cálculo de cambio/vuelto automático.
   - Recibo oficial impreso con advertencia institucional de simulación SRI.

4. **Tesorería y Arqueo de Caja (`pos.session` y `pos.deposito.bancario`)**:
   - Fondo de sencillo inicial.
   - Arqueo de gaveta física y control de diferencias contra facturación.
   - Registro y conciliación de depósitos bancarios en la **Cuenta Rotativa Única del Banco Central del Ecuador (BCE)**.

---

## 📂 Estructura del Módulo Odoo 19

```
pos_institucional_ec/
├── __init__.py
├── __manifest__.py
├── models/
│   ├── __init__.py
│   ├── res_partner.py           # Contribuyentes y validaciones Cédula/RUC
│   ├── product_template.py      # Trámites, partidas y cuentas contables
│   ├── pos_order.py             # Órdenes, bases SRI y retenciones
│   ├── pos_session.py           # Arqueo de caja y fondo de sencillo
│   └── pos_deposito.py          # Depósitos en Cuenta Rotativa BCE
├── views/
│   ├── res_partner_views.xml
│   ├── product_template_views.xml
│   ├── pos_order_views.xml
│   ├── pos_session_views.xml
│   ├── pos_deposito_views.xml
│   └── menu_views.xml
├── security/
│   └── ir.model.access.csv      # Permisos de acceso
├── data/
│   └── demo_data.xml            # Datos semilla ecuatorianos
└── static/
    └── src/
        ├── scss/
        │   └── pos_odoo19.scss  # Estilos Odoo Enterprise (#714B67, #017E84)
        ├── app/
        │   ├── store/
        │   │   └── pos_store.js # Parche de PosStore en OWL 2
        │   ├── components/
        │   │   ├── numpad/      # Teclado táctil Odoo
        │   │   └── traceability/# Acordeón presupuestario
        │   └── screens/         # Parches de pantallas de pago y tickets
        └── xml/
            └── pos_templates.xml # Plantillas QWeb / OWL
```

---

## 🚀 Instalación en un Servidor Odoo 19

1. Copia la carpeta `pos_institucional_ec` dentro de tu directorio de addons personalizados de Odoo 19 (`custom_addons/`).
2. Agrega la ruta a tu archivo de configuración `odoo.conf`:
   ```ini
   addons_path = /ruta/a/odoo/addons,/ruta/a/custom_addons
   ```
3. Inicia o reinicia el servicio de Odoo 19 actualizando la lista de aplicaciones:
   ```bash
   python3 odoo-bin -c odoo.conf -u pos_institucional_ec -d tu_base_de_datos
   ```
4. O desde la interfaz web de Odoo 19:
   - Activa el **Modo Desarrollador** (*Ajustes -> Activar modo desarrollador*).
   - Ve a **Aplicaciones -> Actualizar lista de aplicaciones**.
   - Busca `POS Recaudación y Ventanilla Institucional Ecuador` y haz clic en **Activar / Instalar**.
