# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PosSession(models.Model):
    _inherit = 'pos.session'

    fondo_sencillo_inicial = fields.Monetary(
        string='Fondo Inicial de Sencillo (USD)',
        currency_field='currency_id',
        default=50.0,
        help='Monto físico asignado al cajero para cambio al inicio del turno'
    )

    efectivo_esperado_gaveta = fields.Monetary(
        string='Efectivo Total Esperado en Gaveta',
        currency_field='currency_id',
        compute='_compute_efectivo_esperado',
        store=True
    )

    efectivo_contado_arqueo = fields.Monetary(
        string='Efectivo Físico Contado (Arqueo)',
        currency_field='currency_id'
    )

    diferencia_arqueo = fields.Monetary(
        string='Diferencia de Arqueo (+ / -)',
        currency_field='currency_id',
        compute='_compute_diferencia_arqueo',
        store=True
    )

    observacion_turno = fields.Text(
        string='Observación de Cierre / Acta de Arqueo'
    )

    supervisor_tesoreria_id = fields.Many2one(
        'res.users',
        string='Supervisor de Tesorería Responsable',
        help='Funcionario de tesorería que valida la recepción de la remesa'
    )

    @api.depends('fondo_sencillo_inicial', 'order_ids', 'order_ids.payment_ids')
    def _compute_efectivo_esperado(self):
        for session in self:
            total_efectivo = 0.0
            for order in session.order_ids:
                for payment in order.payment_ids:
                    if payment.payment_method_id.is_cash_count:
                        total_efectivo += payment.amount
            session.efectivo_esperado_gaveta = session.fondo_sencillo_inicial + total_efectivo

    @api.depends('efectivo_esperado_gaveta', 'efectivo_contado_arqueo')
    def _compute_diferencia_arqueo(self):
        for session in self:
            session.diferencia_arqueo = session.efectivo_contado_arqueo - session.efectivo_esperado_gaveta
