# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PosOrder(models.Model):
    _inherit = 'pos.order'

    numero_recaudacion_institucional = fields.Char(
        string='N° de Recaudación de Ventanilla',
        copy=False,
        readonly=True,
        index=True
    )

    referencia_bancaria_pago = fields.Char(
        string='Referencia / N° Comprobante / Voucher Bancario'
    )

    banco_entidad = fields.Char(
        string='Entidad Bancaria Depositaria / Procesador'
    )

    base_iva_0 = fields.Monetary(
        string='Base Imponible IVA 0%',
        currency_field='currency_id',
        readonly=True
    )

    base_iva_15 = fields.Monetary(
        string='Base Imponible IVA 15%',
        currency_field='currency_id',
        readonly=True
    )

    monto_iva_15 = fields.Monetary(
        string='Impuesto IVA 15% Calculado',
        currency_field='currency_id',
        readonly=True
    )

    base_exenta = fields.Monetary(
        string='Valor Exento de IVA',
        currency_field='currency_id',
        readonly=True
    )

    base_no_objeto = fields.Monetary(
        string='Valor No Objeto de IVA',
        currency_field='currency_id',
        readonly=True
    )

    total_exoneraciones = fields.Monetary(
        string='Total Rebajas / Exoneraciones de Ley',
        currency_field='currency_id',
        readonly=True
    )

    total_retenciones_aplicadas = fields.Monetary(
        string='Retenciones en la Fuente Verificadas',
        currency_field='currency_id',
        readonly=True
    )

    estado_deposito_tesoreria = fields.Selection([
        ('pendiente', 'Pendiente de Depósito'),
        ('conciliado', 'Conciliado en Banco / BCE')
    ], string='Estado de Bancarización', default='pendiente', tracking=True)

    es_simulacion_sri = fields.Boolean(
        string='Simulación Sin Validez Tributaria SRI',
        default=True,
        help='Indica que la orden se generó en el entorno de demostración institucional'
    )

    @api.model
    def _order_fields(self, ui_order):
        fields_dict = super()._order_fields(ui_order)
        fields_dict.update({
            'numero_recaudacion_institucional': ui_order.get('numero_recaudacion_institucional'),
            'referencia_bancaria_pago': ui_order.get('referencia_bancaria_pago'),
            'banco_entidad': ui_order.get('banco_entidad'),
            'base_iva_0': ui_order.get('base_iva_0', 0.0),
            'base_iva_15': ui_order.get('base_iva_15', 0.0),
            'monto_iva_15': ui_order.get('monto_iva_15', 0.0),
            'base_exenta': ui_order.get('base_exenta', 0.0),
            'base_no_objeto': ui_order.get('base_no_objeto', 0.0),
            'total_exoneraciones': ui_order.get('total_exoneraciones', 0.0),
            'total_retenciones_aplicadas': ui_order.get('total_retenciones_aplicadas', 0.0),
            'es_simulacion_sri': True,
        })
        return fields_dict


class PosOrderLine(models.Model):
    _inherit = 'pos.order.line'

    partida_presupuestaria = fields.Char(
        string='Partida Presupuestaria',
        help='Partida de clasificador presupuestario de ingresos'
    )

    cuenta_contable_institucional = fields.Char(
        string='Cuenta Contable',
        help='Cuenta del catálogo oficial de finanzas públicas'
    )

    unidad_responsable = fields.Char(
        string='Unidad Administrativa'
    )

    tratamiento_tributario = fields.Selection([
        ('IVA_0', 'Tarifa IVA 0%'),
        ('IVA_15', 'Tarifa IVA 15%'),
        ('EXENTO', 'Exento'),
        ('NO_OBJETO', 'No Objeto')
    ], string='Tratamiento Tributario SRI', default='IVA_0')

    rebaja_autorizada = fields.Monetary(
        string='Rebaja / Exoneración Unitaria',
        currency_field='currency_id'
    )

    referencia_obligacion = fields.Char(
        string='Referencia de Obligación'
    )
