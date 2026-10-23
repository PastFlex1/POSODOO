# -*- coding: utf-8 -*-
import json
from odoo import http, _
from odoo.http import request

class PosInstitucionalController(http.Controller):

    @http.route('/api/pos/ping', type='json', auth='public', methods=['POST', 'OPTIONS'], cors='*')
    def ping(self, **kwargs):
        """Verifica conectividad entre el frontend POS y el backend Odoo 19."""
        return {
            'status': 'ok',
            'server': 'Odoo 19.0',
            'module': 'pos_institucional_ec',
            'timestamp': http.request.env.cr.now().isoformat() if http.request.env.cr else ''
        }

    @http.route('/api/pos/init_data', type='json', auth='user', methods=['POST'], cors='*')
    def get_pos_init_data(self, **kwargs):
        """Retorna todos los datos requeridos por el POS en un solo payload optimizado."""
        env = request.env
        
        # 1. Sesión activa del usuario
        session = env['pos.session'].search([
            ('user_id', '=', env.uid),
            ('state', '!=', 'closed')
        ], limit=1)

        session_data = {
            'id': session.id if session else False,
            'name': session.name if session else 'Sin sesión abierta',
            'state': session.state if session else 'closed',
            'fondo_sencillo_inicial': session.fondo_sencillo_inicial if session else 0.0,
            'punto_emision': session.config_id.name if session else '001-001',
        }

        # 2. Productos / Trámites institucionales
        products = env['product.product'].search_read([
            ('available_in_pos', '=', True)
        ], [
            'id', 'name', 'list_price', 'codigo_institucional',
            'categoria_pos_institucional', 'partida_presupuestaria',
            'cuenta_contable_institucional', 'unidad_responsable',
            'tratamiento_tributario', 'aplica_exoneracion_tercera_edad',
            'porcentaje_rebaja_autorizada'
        ])

        # 3. Clientes / Contribuyentes
        partners = env['res.partner'].search_read([
            ('active', '=', True)
        ], [
            'id', 'name', 'vat', 'tipo_identificacion', 'tipo_contribuyente',
            'email', 'phone', 'street', 'es_tercera_edad'
        ], limit=100)

        return {
            'session': session_data,
            'products': products,
            'partners': partners,
            'company': {
                'id': env.company.id,
                'name': env.company.name,
                'currency': env.company.currency_id.name or 'USD'
            }
        }

    @http.route('/api/pos/create_order', type='json', auth='user', methods=['POST'], cors='*')
    def create_pos_order(self, order_data, **kwargs):
        """Recibe una orden liquidada desde el frontend y asienta el registro en Odoo 19."""
        env = request.env
        session_id = order_data.get('session_id')
        if not session_id:
            session = env['pos.session'].search([
                ('user_id', '=', env.uid),
                ('state', '=', 'opened')
            ], limit=1)
            session_id = session.id if session else False

        lines = []
        for line in order_data.get('lines', []):
            lines.append((0, 0, {
                'product_id': line.get('product_id'),
                'qty': line.get('qty', 1),
                'price_unit': line.get('price_unit'),
                'price_subtotal': line.get('price_subtotal'),
                'price_subtotal_incl': line.get('price_subtotal_incl'),
                'partida_presupuestaria': line.get('partida_presupuestaria'),
                'cuenta_contable_institucional': line.get('cuenta_contable_institucional'),
                'unidad_responsable': line.get('unidad_responsable'),
                'tratamiento_tributario': line.get('tratamiento_tributario'),
            }))

        vals = {
            'session_id': session_id,
            'partner_id': order_data.get('partner_id'),
            'lines': lines,
            'amount_total': order_data.get('amount_total'),
            'amount_tax': order_data.get('amount_tax', 0.0),
            'amount_paid': order_data.get('amount_paid', order_data.get('amount_total')),
            'amount_return': order_data.get('amount_return', 0.0),
            'numero_recaudacion_institucional': order_data.get('numero_recaudacion_institucional'),
            'referencia_bancaria_pago': order_data.get('referencia_bancaria_pago'),
            'banco_entidad': order_data.get('banco_entidad'),
            'base_iva_0': order_data.get('base_iva_0', 0.0),
            'base_iva_15': order_data.get('base_iva_15', 0.0),
            'monto_iva_15': order_data.get('monto_iva_15', 0.0),
            'base_exenta': order_data.get('base_exenta', 0.0),
            'total_exoneraciones': order_data.get('total_exoneraciones', 0.0),
            'es_simulacion_sri': True,
        }

        order = env['pos.order'].create(vals)
        return {
            'success': True,
            'order_id': order.id,
            'name': order.name,
            'numero_recaudacion': order.numero_recaudacion_institucional
        }

    @http.route('/api/pos/register_deposit', type='json', auth='user', methods=['POST'], cors='*')
    def register_deposit(self, deposit_data, **kwargs):
        """Registra un depósito bancario en la Cuenta Rotativa Única BCE."""
        env = request.env
        deposito = env['pos.deposito.bancario'].create({
            'banco': deposit_data.get('banco', 'bce'),
            'numero_papeleta': deposit_data.get('numero_papeleta'),
            'monto': deposit_data.get('monto'),
            'observacion': deposit_data.get('observacion'),
            'estado': 'conciliado'
        })
        return {
            'success': True,
            'deposit_id': deposito.id,
            'name': deposito.name
        }

    @http.route('/api/pos/create_proforma', type='json', auth='user', methods=['POST'], cors='*')
    def create_pos_proforma(self, proforma_data, **kwargs):
        """Genera una proforma / cotización institucional en Odoo 19."""
        env = request.env
        lines = []
        for line in proforma_data.get('lines', []):
            lines.append((0, 0, {
                'product_id': line.get('product_id'),
                'qty': line.get('qty', 1),
                'price_unit': line.get('price_unit'),
                'discount_amount': line.get('discount_amount', 0.0),
                'price_tax': line.get('price_tax', 0.0),
                'partida_presupuestaria': line.get('partida_presupuestaria'),
                'cuenta_contable_institucional': line.get('cuenta_contable_institucional'),
                'unidad_responsable': line.get('unidad_responsable'),
                'tratamiento_tributario': line.get('tratamiento_tributario'),
            }))

        vals = {
            'partner_id': proforma_data.get('partner_id'),
            'line_ids': lines,
            'observacion': proforma_data.get('observacion', 'Cotización generada desde ventanilla POS.'),
            'state': 'borrador'
        }

        proforma = env['pos.proforma'].create(vals)
        return {
            'success': True,
            'proforma_id': proforma.id,
            'name': proforma.name,
            'total': proforma.total,
            'fecha_vencimiento': str(proforma.fecha_vencimiento)
        }

    @http.route('/api/pos/get_proformas', type='json', auth='user', methods=['POST'], cors='*')
    def get_pos_proformas(self, **kwargs):
        """Retorna el listado de proformas para consulta y facturación."""
        env = request.env
        proformas = env['pos.proforma'].search_read([], [
            'id', 'name', 'partner_id', 'fecha_emision', 'fecha_vencimiento',
            'subtotal_bruto', 'total_descuento', 'monto_iva', 'total', 'state', 'order_id'
        ], limit=50)
        return {'proformas': proformas}
