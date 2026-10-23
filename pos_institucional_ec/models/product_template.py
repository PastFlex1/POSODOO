# -*- coding: utf-8 -*-
from odoo import models, fields, api

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    codigo_institucional = fields.Char(
        string='Código de Trámite / Tasa',
        help='Código institucional del trámite (ej. CON-001, OBL-CER-2026-001)'
    )

    categoria_pos_institucional = fields.Selection([
        ('TASAS', 'Tasas y Derechos Administrativos'),
        ('INSPECCIONES', 'Inspecciones Técnicas y Ambientales'),
        ('SERVICIOS', 'Servicios, Planimetría y Copias'),
        ('ARRIENDOS', 'Arriendos y Vía Pública'),
        ('OTROS', 'Otras Rentas Institucionales')
    ], string='Categoría Institucional POS', default='TASAS', required=True)

    partida_presupuestaria = fields.Char(
        string='Partida Presupuestaria de Ingreso',
        help='Código de clasificador presupuestario oficial (ej. 13.01.08.01)'
    )

    cuenta_contable_institucional = fields.Char(
        string='Cuenta Contable de Ingreso',
        help='Código de catálogo de cuentas de finanzas públicas (ej. 6.1.3.05)'
    )

    unidad_responsable = fields.Char(
        string='Unidad Administrativa Responsable',
        help='Dirección municipal o departamental a cargo (ej. Dirección Financiera)'
    )

    tratamiento_tributario = fields.Selection([
        ('IVA_0', 'Tarifa IVA 0% (Servicio Público / Tasas)'),
        ('IVA_15', 'Gravado con Tarifa IVA 15%'),
        ('EXENTO', 'Exento de IVA'),
        ('NO_OBJETO', 'No Objeto de IVA')
    ], string='Tratamiento Tributario SRI', default='IVA_0', required=True)

    aplica_exoneracion_tercera_edad = fields.Boolean(
        string='Aplica Rebaja 50% Tercera Edad',
        default=False
    )

    porcentaje_rebaja_autorizada = fields.Float(
        string='% de Rebaja Autorizada',
        default=0.0
    )

    motivo_exoneracion = fields.Char(
        string='Base Legal / Resolución de Exoneración',
        help='Número de resolución o articulado de la ordenanza/ley'
    )

    @api.model
    def _load_pos_data_fields(self, config_id):
        fields_list = super()._load_pos_data_fields(config_id)
        fields_list += [
            'codigo_institucional',
            'categoria_pos_institucional',
            'partida_presupuestaria',
            'cuenta_contable_institucional',
            'unidad_responsable',
            'tratamiento_tributario',
            'aplica_exoneracion_tercera_edad',
            'porcentaje_rebaja_autorizada',
            'motivo_exoneracion'
        ]
        return fields_list
