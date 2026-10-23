# -*- coding: utf-8 -*-
from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class ResPartner(models.Model):
    _inherit = 'res.partner'

    tipo_identificacion = fields.Selection([
        ('cedula', 'Cédula de Identidad'),
        ('ruc', 'RUC (Registro Único de Contribuyentes)'),
        ('pasaporte', 'Pasaporte'),
        ('consumidor_final', 'Consumidor Final')
    ], string='Tipo de Identificación', default='cedula', required=True)

    tipo_contribuyente = fields.Selection([
        ('natural', 'Persona Natural'),
        ('juridica', 'Sociedad / Persona Jurídica'),
        ('publica', 'Entidad del Sector Público'),
        ('especial', 'Contribuyente Especial')
    ], string='Tipo de Contribuyente', default='natural')

    es_tercera_edad = fields.Boolean(
        string='Aplica Exoneración Tercera Edad',
        help='Aplica 50% de exoneración en tasas y trámites autorizados por ley'
    )

    es_discapacidad = fields.Boolean(
        string='Aplica Beneficio Discapacidad',
        help='Aplica porcentaje de rebaja según carnet CONADIS / MSP'
    )

    porcentaje_discapacidad = fields.Float(
        string='% de Discapacidad',
        default=0.0
    )

    @api.constrains('vat', 'tipo_identificacion')
    def _check_identificacion_ecuador(self):
        for partner in self:
            if not partner.vat or partner.tipo_identificacion == 'consumidor_final':
                continue
            val = partner.vat.strip()
            if partner.tipo_identificacion == 'cedula' and (len(val) != 10 or not val.isdigit()):
                raise ValidationError(_("La cédula de identidad ecuatoriana debe contener exactamente 10 dígitos numéricos."))
            elif partner.tipo_identificacion == 'ruc' and (len(val) != 13 or not val.isdigit()):
                raise ValidationError(_("El RUC ecuatoriano debe contener exactamente 13 dígitos numéricos terminados en 001."))
