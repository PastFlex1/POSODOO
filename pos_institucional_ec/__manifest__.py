# -*- coding: utf-8 -*-
{
    'name': 'POS Recaudación y Ventanilla Institucional Ecuador (Odoo 19)',
    'version': '19.0.1.0.0',
    'category': 'Point of Sale',
    'summary': 'Punto de Venta para Instituciones Públicas del Ecuador: Tasas, Partidas Presupuestarias, Cuentas Contables y OWL 2',
    'description': """
Módulo de Punto de Venta (POS) Institucional para Odoo 19
=========================================================
Diseñado específicamente para ventanillas de recaudación y cobro del sector público ecuatoriano:
- Clasificación presupuestaria (Partidas oficiales 13.01.08...).
- Trazabilidad contable automática (Cuentas 6.1.3...).
- Tratamientos tributarios según normativa SRI (IVA 0%, IVA 15%, Exento, No Objeto).
- Exoneraciones y rebajas automáticas por ley (Tercera Edad, Discapacidad).
- Control de caja, arqueo de gaveta y depósitos en Cuenta Rotativa Única BCE.
- Interfaz reactiva en OWL 2 con pantalla dividida y teclado numérico touch.
    """,
    'author': 'Alex Palma / Sector Público Ecuador',
    'website': 'https://www.gob.ec',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'point_of_sale',
        'account',
    ],
    'data': [
        'security/ir.model.access.csv',
        'data/demo_data.xml',
        'views/res_partner_views.xml',
        'views/product_template_views.xml',
        'views/pos_order_views.xml',
        'views/pos_proforma_views.xml',
        'views/pos_session_views.xml',
        'views/pos_deposito_views.xml',
        'views/menu_views.xml',
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'pos_institucional_ec/static/src/scss/pos_odoo19.scss',
            'pos_institucional_ec/static/src/app/store/pos_store.js',
            'pos_institucional_ec/static/src/app/components/numpad/numpad_widget.js',
            'pos_institucional_ec/static/src/app/components/traceability/budget_traceability.js',
            'pos_institucional_ec/static/src/app/screens/ticket_screen/ticket_screen_patch.js',
            'pos_institucional_ec/static/src/app/screens/payment_screen/payment_screen_patch.js',
            'pos_institucional_ec/static/src/xml/pos_templates.xml',
        ],
    },
    'installable': True,
    'application': True,
    'auto_install': False,
}
