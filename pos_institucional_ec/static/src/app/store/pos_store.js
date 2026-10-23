/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { Order, Orderline } from "@point_of_sale/app/store/models";

// Parchear PosStore en Odoo 19 para soportar atributos institucionales ecuatorianos
patch(PosStore.prototype, {
    async setup() {
        await super.setup(...arguments);
        this.es_simulacion_institucional = true;
    },

    // Formateo en centavos para máxima precisión financiera
    formatMoneyCents(cents) {
        const val = (Number(cents) || 0) / 100;
        return `$${val.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
});

// Parchear Orderline para arrastrar partidas presupuestarias y cuentas contables
patch(Orderline.prototype, {
    setup(options) {
        super.setup(...arguments);
        const product = this.get_product();
        if (product) {
            this.partida_presupuestaria = product.partida_presupuestaria || '13.01.08.01 Tasas Generales';
            this.cuenta_contable_institucional = product.cuenta_contable_institucional || '6.1.3.01 Derechos Administrativos';
            this.unidad_responsable = product.unidad_responsable || 'Dirección Financiera';
            this.tratamiento_tributario = product.tratamiento_tributario || 'IVA_0';
            this.rebaja_autorizada = product.porcentaje_rebaja_autorizada || 0.0;
        }
    },

    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        json.partida_presupuestaria = this.partida_presupuestaria;
        json.cuenta_contable_institucional = this.cuenta_contable_institucional;
        json.unidad_responsable = this.unidad_responsable;
        json.tratamiento_tributario = this.tratamiento_tributario;
        return json;
    }
});

// Parchear Order para exportar desglose de bases tributarias ecuatorianas
patch(Order.prototype, {
    export_as_JSON() {
        const json = super.export_as_JSON(...arguments);
        let base0 = 0;
        let base15 = 0;
        let iva15 = 0;
        let baseExenta = 0;

        for (const line of this.get_orderlines()) {
            const price = line.get_display_price();
            if (line.tratamiento_tributario === 'IVA_15') {
                base15 += price;
                iva15 += price * 0.15;
            } else if (line.tratamiento_tributario === 'EXENTO') {
                baseExenta += price;
            } else {
                base0 += price;
            }
        }

        json.base_iva_0 = base0;
        json.base_iva_15 = base15;
        json.monto_iva_15 = iva15;
        json.base_exenta = baseExenta;
        json.numero_recaudacion_institucional = `REC-2026-${Date.now().toString().slice(-5)}`;
        return json;
    }
});
