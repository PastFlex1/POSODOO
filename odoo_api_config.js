/**
 * CONFIGURACIÓN Y ADAPTADOR DE CONEXIÓN BACKEND — ODOO 19
 * Archivo desacoplado para enganchar con el servidor Odoo real.
 */

'use strict';

const ODOO_BACKEND_CONFIG = {
  // Cambiar a true para conectarse a un servidor Odoo real
  active: false,

  // URL del servidor Odoo 19 (ej. http://localhost:8069 o IP del servidor)
  serverUrl: 'http://localhost:8069',

  // Nombre de la base de datos de Odoo 19
  database: 'odoo19_institucional',

  // Credenciales de acceso de ventanilla / API
  auth: {
    username: 'admin',
    password: 'admin_password'
  },

  // Endpoints API REST / JSON-RPC creados en el módulo pos_institucional_ec
  endpoints: {
    ping: '/api/pos/ping',
    initData: '/api/pos/init_data',
    createOrder: '/api/pos/create_order',
    registerDeposit: '/api/pos/register_deposit',
    createProforma: '/api/pos/create_proforma',
    getProformas: '/api/pos/get_proformas'
  }
};

/**
 * Servicio Adaptador para Odoo Backend
 * Si ODOO_BACKEND_CONFIG.active es false, trabaja de forma autónoma con datos simulados.
 * Si es true, envía y recibe datos del servidor Odoo 19 en tiempo real.
 */
const OdooBackendService = {
  config: ODOO_BACKEND_CONFIG,

  /** Probar conectividad con el servidor Odoo */
  async testConnection() {
    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.ping}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} })
      });
      const data = await response.json();
      return { success: true, data: data.result || data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /** Cargar datos iniciales desde Odoo 19 */
  async fetchInitialData() {
    if (!this.config.active) return null;

    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.initData}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} })
      });
      const json = await response.json();
      return json.result || json;
    } catch (err) {
      console.warn('Odoo Backend no disponible, usando datos locales:', err);
      return null;
    }
  },

  /** Enviar orden cobrada al backend Odoo 19 */
  async syncOrder(orderPayload) {
    if (!this.config.active) {
      return { success: true, simulated: true, id: orderPayload.id };
    }

    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.createOrder}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { order_data: orderPayload }
        })
      });
      const json = await response.json();
      return json.result || json;
    } catch (err) {
      console.error('Error sincronizando con Odoo Backend:', err);
      return { success: false, error: err.message };
    }
  },

  /** Enviar depósito bancario a Odoo 19 */
  async syncDeposit(depositPayload) {
    if (!this.config.active) {
      return { success: true, simulated: true, id: depositPayload.id };
    }

    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.registerDeposit}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { deposit_data: depositPayload }
        })
      });
      const json = await response.json();
      return json.result || json;
    } catch (err) {
      console.error('Error sincronizando depósito con Odoo:', err);
      return { success: false, error: err.message };
    }
  },

  /** Emitir Proforma / Cotización a Odoo 19 */
  async syncProforma(proformaPayload) {
    if (!this.config.active) {
      return { success: true, simulated: true, id: proformaPayload.id };
    }

    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.createProforma}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: { proforma_data: proformaPayload }
        })
      });
      const json = await response.json();
      return json.result || json;
    } catch (err) {
      console.error('Error sincronizando proforma con Odoo:', err);
      return { success: false, error: err.message };
    }
  },

  /** Obtener Proformas desde Odoo 19 */
  async fetchProformas() {
    if (!this.config.active) return null;

    try {
      const response = await fetch(`${this.config.serverUrl}${this.config.endpoints.getProformas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: {} })
      });
      const json = await response.json();
      return (json.result && json.result.proformas) || null;
    } catch (err) {
      console.warn('Error consultando proformas de Odoo:', err);
      return null;
    }
  }
};
