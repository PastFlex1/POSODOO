# -*- coding: utf-8 -*-
from odoo import models, fields, api, _

class PosDepositoBancario(models.Model):
    _name = 'pos.deposito.bancario'
    _description = 'Depósito Bancario Institucional de Remesas de Ventanilla'
    _order = 'fecha_deposito desc, id desc'

    name = fields.Char(
        string='Código de Depósito',
        required=True,
        copy=False,
        readonly=True,
        default=lambda self: _('Nuevo')
    )

    session_id = fields.Many2one(
        'pos.session',
        string='Sesión / Cierre de Caja Origen'
    )

    fecha_deposito = fields.Datetime(
        string='Fecha y Hora de Depósito',
        default=fields.Datetime.now,
        required=True
    )

    banco = fields.Selection([
        ('bce', 'Banco Central del Ecuador (BCE) - Cta. Rotativa Única'),
        ('banecuador', 'BanEcuador B.P. - Cuenta Recaudadora Institucional'),
        ('pacifico', 'Banco del Pacífico - Cta. Recaudación'),
        ('pichincha', 'Banco Pichincha - Cta. Corriente Institucional')
    ], string='Entidad Bancaria Depositaria', default='bce', required=True)

    numero_papeleta = fields.Char(
        string='N° de Papeleta / Depósito Bancario',
        required=True
    )

    currency_id = fields.Many2one(
        'res.currency',
        string='Moneda',
        default=lambda self: self.env.company.currency_id
    )

    monto = fields.Monetary(
        string='Monto Depositado (USD)',
        currency_field='currency_id',
        required=True
    )

    usuario_responsable_id = fields.Many2one(
        'res.users',
        string='Funcionario Tesorero Responsable',
        default=lambda self: self.env.user,
        required=True
    )

    estado = fields.Selection([
        ('borrador', 'Registrado (En Tránsito)'),
        ('conciliado', 'Conciliado en Estado de Cuenta BCE')
    ], string='Estado de Conciliación', default='conciliado', required=True)

    observacion = fields.Text(
        string='Observaciones / Detalle de Remesa'
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('name', _('Nuevo')) == _('Nuevo'):
                vals['name'] = self.env['ir.sequence'].next_by_code('pos.deposito.bancario') or _('DEP-%s') % fields.Date.today()
        return super().create(vals_list)
