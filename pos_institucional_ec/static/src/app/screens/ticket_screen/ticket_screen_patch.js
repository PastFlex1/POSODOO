/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { TicketScreen } from "@point_of_sale/app/screens/ticket_screen/ticket_screen";

patch(TicketScreen.prototype, {
    getPartnerIdentificacion(order) {
        const partner = order.get_partner();
        return partner ? `${partner.tipo_identificacion || 'ID'}: ${partner.vat || ''}` : 'Consumidor Final';
    }
});
