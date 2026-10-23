/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class BudgetTraceability extends Component {
    static template = "pos_institucional_ec.BudgetTraceability";

    setup() {
        this.pos = usePos();
        this.state = useState({
            isOpen: false
        });
    }

    toggleOpen() {
        this.state.isOpen = !this.state.isOpen;
    }

    get orderlines() {
        const currentOrder = this.pos.get_order();
        return currentOrder ? currentOrder.get_orderlines() : [];
    }
}
