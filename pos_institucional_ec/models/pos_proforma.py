# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from datetime import datetime, timedelta

class PosProforma(models.Model):
    _name = 'pos.proforma'
    _description = 'Proforma / Cotización Institucional de Ventanilla'
    _order = 'fecha_emision desc, id desc'

    name = fields.Char(
        string='N° de Proforma',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('Nuevo')
    )

    partner_id = fields.Many2one(
        'res.partner',
        string='Ciudadano / Contribuyente',
        required=True
    )

    fecha_emision = fields.Datetime(
        string='Fecha de Emisión',
        default=fields.Datetime.now,
        required=True
    )

    fecha_vencimiento = fields.Date(
        string='Válida Hasta',
        default=lambda self: (fields.Date.today() + timedelta(days=15)),
        required=True
    )

    currency_id = fields.Many2one(
        'res.currency',
        string='Moneda',
        default=lambda self: self.env.company.currency_id
    )

    line_ids = fields.One2many(
        'pos.proforma.line',
        'proforma_id',
        string='Detalle de Conceptos Cotizados'
    )

    subtotal_bruto = fields.Monetary(
        string='Subtotal Bruto',
        currency_field='currency_id',
        compute='_compute_totals',
        store=True
    )

    total_descuento = fields.Monetary(
        string='Rebajas / Exoneraciones',
        currency_field='currency_id',
        compute='_compute_totals',
        store=True
    )

    monto_iva = fields.Monetary(
        string='IVA Calculado',
        currency_field='currency_id',
        compute='_compute_totals',
        store=True
    )

    total = fields.Monetary(
        string='Total Cotizado (USD)',
        currency_field='currency_id',
        compute='_compute_totals',
        store=True
    )

    state = fields.Selection([
        ('borrador', 'Cotización Vigente'),
        ('facturado', 'Facturada y Cobrada'),
        ('vencido', 'Vencida / Expirada'),
        ('cancelado', 'Anulada')
    ], string='Estado de la Proforma', default='borrador', tracking=True)

    order_id = fields.Many2one(
        'pos.order',
        string='Factura / Comprobante Generado',
        readonly=True,
        copy=False
    )

    observacion = fields.Text(
        string='Términos y Observaciones de la Cotización',
        default='Documento informativo de proforma institucional. Valores vigentes por 15 días calendario.'
    )

    @api.depends('line_ids.price_subtotal', 'line_ids.price_tax', 'line_ids.discount_amount')
    def _compute_totals(self):
        for rec in self:
            bruto = sum(l.price_unit * l.qty for l in rec.line_ids)
            desc = sum(l.discount_amount for l in rec.line_ids)
            iva = sum(l.price_tax for l in rec.line_ids)
            rec.subtotal_bruto = bruto
            rec.total_descuento = desc
            rec.monto_iva = iva
            rec.total = (bruto - desc) + iva

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('Nuevo')) == _('Nuevo'):
                vals['name'] = self.env['ir.sequence'].next_by_code('pos.proforma') or _('PROF-%s') % fields.Date.today()
        return super().create(vals_list)

    def action_convert_to_order(self):
        """Convierte la proforma en una orden de venta en el POS."""
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'res_model': 'pos.order',
            'view_mode': 'form',
            'target': 'current',
            'context': {
                'default_partner_id': self.partner_id.id,
                'default_lines': [(0, 0, {
                    'product_id': l.product_id.id,
                    'qty': l.qty,
                    'price_unit': l.price_unit,
                    'partida_presupuestaria': l.partida_presupuestaria,
                    'cuenta_contable_institucional': l.cuenta_contable_institucional,
                    'unidad_responsable': l.unidad_responsable,
                    'tratamiento_tributario': l.tratamiento_tributario,
                }) for l in self.line_ids]
            }
        }


class PosProformaLine(models.Model):
    _name = 'pos.proforma.line'
    _description = 'Línea de Proforma Institucional'

    proforma_id = fields.Many2one(
        'pos.proforma',
        string='Proforma',
        ondelete='cascade',
        required=True
    )

    product_id = fields.Many2one(
        'product.product',
        string='Concepto / Trámite',
        required=True
    )

    qty = fields.Float(
        string='Cantidad',
        default=1.0,
        required=True
    )

    price_unit = fields.Monetary(
        string='Tarifa Oficial',
        currency_field='currency_id',
        required=True
    )

    discount_amount = fields.Monetary(
        string='Descuento / Exoneración',
        currency_field='currency_id',
        default=0.0
    )

    price_subtotal = fields.Monetary(
        string='Base Imponible',
        currency_field='currency_id',
        compute='_compute_subtotal',
        store=True
    )

    price_tax = fields.Monetary(
        string='IVA Calculado',
        currency_field='currency_id',
        default=0.0
    )

    currency_id = fields.Many2one(
        'res.currency',
        related='proforma_id.currency_id'
    )

    partida_presupuestaria = fields.Char(string='Partida Presupuestaria')
    cuenta_contable_institucional = fields.Char(string='Cuenta Contable')
    unidad_responsable = fields.Char(string='Unidad Responsable')
    tratamiento_tributario = fields.Selection([
        ('IVA_0', 'IVA 0%'),
        ('IVA_15', 'IVA 15%'),
        ('EXENTO', 'Exento'),
        ('NO_OBJETO', 'No Objeto')
    ], default='IVA_0')

    @api.depends('price_unit', 'qty', 'discount_amount')
    def _compute_subtotal(self):
        for line in self:
            bruto = line.price_unit * line.qty
            line.price_subtotal = max(0, bruto - line.discount_amount)
