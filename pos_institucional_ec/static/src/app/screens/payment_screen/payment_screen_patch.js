/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

patch(PaymentScreen.prototype, {
    setQuickCashTender(val) {
        const order = this.currentOrder;
        const selectedPaymentline = order.get_selected_paymentline();
        if (!selectedPaymentline) return;

        let amount = 0;
        if (val === 'EXACT') {
            amount = order.get_due();
        } else {
            amount = parseFloat(val);
        }

        selectedPaymentline.set_amount(amount);
    },

    get cambioVuelto() {
        const order = this.currentOrder;
        return order ? order.get_change() : 0.0;
    }
});
