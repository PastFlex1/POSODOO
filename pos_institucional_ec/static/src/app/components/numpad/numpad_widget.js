/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class NumpadWidgetCustom extends Component {
    static template = "pos_institucional_ec.NumpadWidgetCustom";

    setup() {
        this.pos = usePos();
        this.state = useState({
            activeMode: 'qty', // 'qty' | 'disc' | 'price'
        });
    }

    setMode(mode) {
        this.state.activeMode = mode;
        const currentOrder = this.pos.get_order();
        if (currentOrder) {
            currentOrder.set_numpad_mode(mode);
        }
    }

    sendKey(val) {
        const currentOrder = this.pos.get_order();
        if (currentOrder && currentOrder.get_selected_orderline()) {
            currentOrder.send_key_to_numpad(val);
        }
    }

    sendBackspace() {
        this.sendKey('Backspace');
    }
}
