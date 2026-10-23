/**
 * SISTEMA DE FACTURACIÓN Y RECAUDACIÓN INSTITUCIONAL (ODOO POS + BOOTSTRAP 5)
 * Prototipo Funcional de Demostración para Institución Pública del Ecuador
 * Arquitectura Odoo Enterprise: Módulos, Pantalla Dividida POS, Teclado Touch y Catálogo Visual
 */

'use strict';

// =============================================================================
// 1. CAPA DE SERVICIO DE DATOS (DATA SERVICE / REPOSITORY SIMULADO)
//    Cálculos de importes estrictamente en CENTAVOS ENTEROS para precisión.
// =============================================================================

const STORAGE_KEYS = {
  STATE: 'pos_odoo_institucional_v3'
};

// Utilidades para cálculo en centavos enteros (Evita errores de precisión IEEE 754)
const MoneyUtil = {
  toCents(val) {
    return Math.round((Number(val) || 0) * 100);
  },
  fromCents(cents) {
    return (Number(cents) || 0) / 100;
  },
  format(cents) {
    const num = this.fromCents(cents);
    return `$${num.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

const DataService = {
  /** Genera los datos semilla iniciales */
  getInitialSeed() {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      cajas: [
        {
          id: 'CAJA-01',
          nombre: 'Caja 01 - Ventanilla Principal',
          puntoEmision: '001-001',
          cajeroAsignado: 'Alex Palma',
          cajeroId: 'USR-001',
          estado: 'ABIERTA', // 'ABIERTA' | 'CERRADA'
          fondoInicialCents: 5000, // $50.00
          fechaApertura: `${today} 08:00:00`,
          observacionApertura: 'Apertura de turno matutino regular.'
        }
      ],
      ciudadanos: [
        {
          id: 'CIU-001',
          identificacion: '1718293041',
          tipoIdentificacion: 'Cédula',
          nombre: 'María Elena Morales Guamán',
          correo: 'maria.morales@correo-demo.ec',
          direccion: 'Av. 10 de Agosto N24-112 y Cordero, Quito',
          telefono: '0984712390',
          tipoContribuyente: 'Persona Natural'
        },
        {
          id: 'CIU-002',
          identificacion: '1792345678001',
          tipoIdentificacion: 'RUC',
          nombre: 'Constructora Andina & Asociados Cía. Ltda.',
          correo: 'tributario@andina-demo.ec',
          direccion: 'Av. Shyris N36-120 y Naciones Unidas, Quito',
          telefono: '022948102',
          tipoContribuyente: 'Sociedad Jurídica'
        },
        {
          id: 'CIU-003',
          identificacion: '0928374651',
          tipoIdentificacion: 'Cédula',
          nombre: 'Carlos Patricio Mendoza Vera',
          correo: 'carlos.mendoza@correo-demo.ec',
          direccion: 'Cdla. Kennedy Norte Mz. 14 Sl. 8, Guayaquil',
          telefono: '0993847261',
          tipoContribuyente: 'Persona Natural'
        },
        {
          id: 'CIU-004',
          identificacion: '1003482910',
          tipoIdentificacion: 'Cédula',
          nombre: 'Luis Fernando Chimbo Quishpe',
          correo: 'luis.chimbo@correo-demo.ec',
          direccion: 'Calle Bolívar 5-42 y Sucre, Ibarra',
          telefono: '0978291034',
          tipoContribuyente: 'Persona Natural'
        },
        {
          id: 'CIU-005',
          identificacion: '0992345671001',
          tipoIdentificacion: 'RUC',
          nombre: 'Distribuidora Farmacéutica del Litoral S.A.',
          correo: 'contabilidad@farmalitoral-demo.ec',
          direccion: 'Km 7.5 Vía a Daule, Parque Industrial, Guayaquil',
          telefono: '042183900',
          tipoContribuyente: 'Sociedad Jurídica'
        }
      ],
      conceptos: [
        {
          codigo: 'CON-001',
          nombre: 'Emisión de Certificado de No Adeudar',
          categoria: 'TASAS',
          icono: 'bi-file-earmark-check',
          referenciaObligacion: 'OBL-CER-2026-001',
          periodo: '2026',
          tarifaCents: 500, // $5.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_0',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.01 Tasas y Derechos Administrativos',
          cuentaContable: '6.1.3.05 Ingresos por Certificaciones y Copias',
          unidadResponsable: 'Dirección Financiera / Rentas'
        },
        {
          codigo: 'CON-002',
          nombre: 'Tasa de Habilitación y Control de Actividades Económicas',
          categoria: 'TASAS',
          icono: 'bi-building-check',
          referenciaObligacion: 'OBL-HAB-2026-144',
          periodo: '2026',
          tarifaCents: 4500, // $45.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_0',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.02 Patentes y Habilitación',
          cuentaContable: '6.1.3.02 Ingresos por Tasas Administrativas',
          unidadResponsable: 'Dirección de Planificación y Control Urbano'
        },
        {
          codigo: 'CON-003',
          nombre: 'Inspección Técnica de Seguridad y Diagnóstico Ambiental',
          categoria: 'INSPECCIONES',
          icono: 'bi-tree',
          referenciaObligacion: 'OBL-AMB-2026-089',
          periodo: '2026-Q1',
          tarifaCents: 4000, // $40.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_15',
          porcentajeIva: 15,
          partidaPresupuestaria: '13.01.08.04 Servicios Técnicos Especializados',
          cuentaContable: '6.1.3.04 Ingresos por Servicios Técnicos y Peritajes',
          unidadResponsable: 'Dirección de Gestión Ambiental'
        },
        {
          codigo: 'CON-004',
          nombre: 'Derecho de Trámite Administrativo Institucional',
          categoria: 'TASAS',
          icono: 'bi-folder2-open',
          referenciaObligacion: 'OBL-TRA-2026-310',
          periodo: '2026',
          tarifaCents: 1250, // $12.50
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'NO_OBJETO',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.01 Tasas y Derechos Administrativos',
          cuentaContable: '6.1.3.01 Ingresos por Derechos Administrativos',
          unidadResponsable: 'Secretaría General'
        },
        {
          codigo: 'CON-005',
          nombre: 'Copias Certificadas y Planimetría Oficial',
          categoria: 'SERVICIOS',
          icono: 'bi-map',
          referenciaObligacion: 'OBL-PLA-2026-042',
          periodo: '2026',
          tarifaCents: 800, // $8.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'EXENTO',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.05 Reproducción y Cartografía',
          cuentaContable: '6.1.3.05 Ingresos por Certificaciones y Copias',
          unidadResponsable: 'Dirección de Catastro y Avalúos'
        },
        {
          codigo: 'CON-006',
          nombre: 'Tasa de Rodaje y Movilidad Cantonal',
          categoria: 'TASAS',
          icono: 'bi-car-front',
          referenciaObligacion: 'OBL-ROD-2026-781',
          periodo: 'Año 2026',
          tarifaCents: 2500, // $25.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_0',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.03 Tasas de Movilidad y Tránsito',
          cuentaContable: '6.1.3.03 Ingresos por Tasas de Movilidad y Tránsito',
          unidadResponsable: 'Empresa Pública de Tránsito y Movilidad'
        },
        {
          codigo: 'CON-007',
          nombre: 'Alquiler de Espacio Auditorio Institucional',
          categoria: 'ARRIENDOS',
          icono: 'bi-easel',
          referenciaObligacion: 'OBL-ALQ-2026-015',
          periodo: '2026-04',
          tarifaCents: 8000, // $80.00
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_15',
          porcentajeIva: 15,
          partidaPresupuestaria: '14.02.01.01 Arrendamiento de Bienes Públicos',
          cuentaContable: '6.1.4.01 Ingresos por Arrendamiento de Bienes Públicos',
          unidadResponsable: 'Dirección Administrativa'
        },
        {
          codigo: 'CON-008',
          nombre: 'Tasa de Habilitación con Exoneración Autorizada (50% Tercera Edad)',
          categoria: 'TASAS',
          icono: 'bi-heart-pulse',
          referenciaObligacion: 'OBL-EXO-2026-033',
          periodo: '2026',
          tarifaCents: 6000, // $60.00 tarifa
          rebajaAutorizadaCents: 3000, // $30.00 rebaja autorizada (50%)
          motivoExoneracion: 'Resolución Adm. N° RES-EXO-2026-042 (Tercera Edad)',
          tratamientoTributario: 'IVA_0',
          porcentajeIva: 0,
          partidaPresupuestaria: '13.01.08.02 Patentes y Habilitación',
          cuentaContable: '6.1.3.02 Ingresos por Tasas Administrativas',
          unidadResponsable: 'Dirección Financiera / Beneficios de Ley'
        },
        {
          codigo: 'CON-009',
          nombre: 'Concesión y Permiso de Ocupación Vía Pública',
          categoria: 'ARRIENDOS',
          icono: 'bi-cone-striped',
          referenciaObligacion: 'OBL-VIA-2026-512',
          periodo: '2026-03',
          tarifaCents: 3000,
          rebajaAutorizadaCents: 0,
          motivoExoneracion: null,
          tratamientoTributario: 'IVA_15',
          porcentajeIva: 15,
          partidaPresupuestaria: '13.01.08.01 Tasas y Derechos Administrativos',
          cuentaContable: '6.1.3.01 Ingresos por Derechos Administrativos',
          unidadResponsable: 'Comisaría Municipal de Vía Pública'
        }
      ],
      facturasPendientes: [
        {
          id: 'FAC-001-001-0000819',
          ciudadanoId: 'CIU-002',
          conceptoCodigo: 'CON-003',
          conceptoNombre: 'Inspección Técnica Ambiental y Diagnóstico',
          referenciaObligacion: 'OBL-LIC-2026-904',
          periodo: '2026',
          fechaEmision: `${today} 07:15:00`,
          items: [
            {
              codigo: 'CON-003',
              nombre: 'Inspección Técnica de Seguridad y Diagnóstico Ambiental',
              referenciaObligacion: 'OBL-AMB-2026-089',
              periodo: '2026-Q1',
              cantidad: 2,
              tarifaCents: 4000,
              valorBrutoCents: 8000,
              rebajaAutorizadaCents: 0,
              baseImponibleCents: 8000,
              tratamientoTributario: 'IVA_15',
              porcentajeIva: 15,
              impuestoCalculadoCents: 1200,
              totalLineaCents: 9200
            }
          ],
          subtotalBrutoCents: 8000,
          rebajasTotalCents: 0,
          subtotalNetoCents: 8000,
          baseIva0Cents: 0,
          baseIva15Cents: 8000,
          baseExentoCents: 0,
          baseNoObjetoCents: 0,
          iva15Cents: 1200,
          totalCents: 9200,
          cobrosAnterioresCents: 3000,
          anticiposAplicadosCents: 0,
          retencionesAplicadasCents: 1375,
          saldoPendienteCents: 4825,
          estado: 'PENDIENTE',
          puntoEmision: '001-001'
        }
      ],
      facturas: [],
      cobros: [
        {
          id: 'REC-2026-00820',
          facturaId: 'FAC-001-001-0000820',
          fecha: `${today} 08:35:12`,
          ciudadanoId: 'CIU-001',
          ciudadanoNombre: 'María Elena Morales Guamán',
          ciudadanoIdentificacion: '1718293041',
          metodoPago: 'EFECTIVO',
          efectivoRecibidoCents: 1000,
          cambioEntregadoCents: 500,
          referenciaPago: null,
          bancoEntidad: null,
          subtotal0Cents: 500,
          subtotalIvaCents: 0,
          ivaCents: 0,
          totalCents: 500,
          cajaId: 'CAJA-01',
          cajeroNombre: 'Alex Palma',
          cierreId: null,
          estadoCobro: 'COBRADO',
          estadoDeposito: 'PENDIENTE',
          estadoContable: 'ASENTADO'
        },
        {
          id: 'REC-2026-00821',
          facturaId: 'FAC-001-001-0000821',
          fecha: `${today} 09:12:44`,
          ciudadanoId: 'CIU-003',
          ciudadanoNombre: 'Carlos Patricio Mendoza Vera',
          ciudadanoIdentificacion: '0928374651',
          metodoPago: 'TRANSFERENCIA',
          efectivoRecibidoCents: 0,
          cambioEntregadoCents: 0,
          referenciaPago: 'BCE-TR-9041285',
          bancoEntidad: 'Banco Central del Ecuador',
          transferenciaVerificada: true,
          subtotal0Cents: 2500,
          subtotalIvaCents: 0,
          ivaCents: 0,
          totalCents: 2500,
          cajaId: 'CAJA-01',
          cajeroNombre: 'Alex Palma',
          cierreId: null,
          estadoCobro: 'COBRADO',
          estadoDeposito: 'CONCILIADO',
          estadoContable: 'ASENTADO'
        }
      ],
      cierres: [],
      depositosBancarios: [
        {
          id: 'DEP-2026-001',
          cierreId: 'CIE-2026-00041',
          fechaHora: `${today} 09:00:00`,
          banco: 'Banco Central del Ecuador (BCE) - Cta. Rotativa Única',
          numeroPapeleta: 'DEP-BCE-2026-8812',
          montoCents: 125000,
          usuarioResponsable: 'Dra. Carmen Velasteguí',
          estado: 'CONCILIADO',
          observacion: 'Depósito de remesa en efectivo de ventanillas del día anterior.'
        }
      ],
      solicitudesReversion: [],
      borradores: [],
      proformas: [
        {
          id: 'PROF-2026-00012',
          fechaEmision: `${today} 08:10:00`,
          fechaVencimiento: '2026-11-15',
          ciudadanoId: 'CIU-001',
          ciudadanoNombre: 'María Elena Morales Guamán',
          ciudadanoIdentificacion: '1718293041',
          ciudadanoCorreo: 'maria.morales@correo-demo.ec',
          ciudadanoDireccion: 'Av. 10 de Agosto N24-112 y Cordero, Quito',
          items: [
            {
              codigo: 'CON-001',
              nombre: 'Emisión de Certificado de No Adeudar',
              cantidad: 1,
              tarifaCents: 500,
              valorBrutoCents: 500,
              rebajaAutorizadaCents: 0,
              baseImponibleCents: 500,
              tratamientoTributario: 'IVA_0',
              porcentajeIva: 0,
              impuestoCalculadoCents: 0,
              totalLineaCents: 500,
              partidaPresupuestaria: '13.01.08.01 Tasas y Derechos Administrativos',
              cuentaContable: '6.1.3.05 Ingresos por Certificaciones y Copias',
              unidadResponsable: 'Dirección Financiera / Rentas'
            },
            {
              codigo: 'CON-005',
              nombre: 'Copias Certificadas y Planimetría Oficial',
              cantidad: 2,
              tarifaCents: 800,
              valorBrutoCents: 1600,
              rebajaAutorizadaCents: 0,
              baseImponibleCents: 1600,
              tratamientoTributario: 'EXENTO',
              porcentajeIva: 0,
              impuestoCalculadoCents: 0,
              totalLineaCents: 1600,
              partidaPresupuestaria: '13.01.08.05 Reproducción y Cartografía',
              cuentaContable: '6.1.3.05 Ingresos por Certificaciones y Copias',
              unidadResponsable: 'Dirección de Catastro y Avalúos'
            }
          ],
          subtotalBrutoCents: 2100,
          rebajasTotalCents: 0,
          subtotalNetoCents: 2100,
          baseIva0Cents: 500,
          baseIva15Cents: 0,
          baseExentoCents: 1600,
          baseNoObjetoCents: 0,
          iva15Cents: 0,
          totalCents: 2100,
          estado: 'VIGENTE',
          facturaGeneradaId: null,
          observacion: 'Proforma para trámite notarial de certificado y copias planimétricas.'
        },
        {
          id: 'PROF-2026-00011',
          fechaEmision: `${today} 07:30:00`,
          fechaVencimiento: '2026-11-10',
          ciudadanoId: 'CIU-002',
          ciudadanoNombre: 'Constructora Andina & Asociados Cía. Ltda.',
          ciudadanoIdentificacion: '1792345678001',
          ciudadanoCorreo: 'tributario@andina-demo.ec',
          ciudadanoDireccion: 'Av. Shyris N36-120 y Naciones Unidas, Quito',
          items: [
            {
              codigo: 'CON-002',
              nombre: 'Tasa de Habilitación y Control de Actividades Económicas',
              cantidad: 1,
              tarifaCents: 4500,
              valorBrutoCents: 4500,
              rebajaAutorizadaCents: 0,
              baseImponibleCents: 4500,
              tratamientoTributario: 'IVA_0',
              porcentajeIva: 0,
              impuestoCalculadoCents: 0,
              totalLineaCents: 4500,
              partidaPresupuestaria: '13.01.08.02 Patentes y Habilitación',
              cuentaContable: '6.1.3.02 Ingresos por Tasas Administrativas',
              unidadResponsable: 'Dirección de Planificación y Control Urbano'
            },
            {
              codigo: 'CON-003',
              nombre: 'Inspección Técnica de Seguridad y Diagnóstico Ambiental',
              cantidad: 1,
              tarifaCents: 4000,
              valorBrutoCents: 4000,
              rebajaAutorizadaCents: 0,
              baseImponibleCents: 4000,
              tratamientoTributario: 'IVA_15',
              porcentajeIva: 15,
              impuestoCalculadoCents: 600,
              totalLineaCents: 4600,
              partidaPresupuestaria: '13.01.08.04 Servicios Técnicos Especializados',
              cuentaContable: '6.1.3.04 Ingresos por Servicios Técnicos y Peritajes',
              unidadResponsable: 'Dirección de Gestión Ambiental'
            }
          ],
          subtotalBrutoCents: 8500,
          rebajasTotalCents: 0,
          subtotalNetoCents: 8500,
          baseIva0Cents: 4500,
          baseIva15Cents: 4000,
          baseExentoCents: 0,
          baseNoObjetoCents: 0,
          iva15Cents: 600,
          totalCents: 9100,
          estado: 'FACTURADA',
          facturaGeneradaId: 'FAC-001-001-0000821',
          observacion: 'Cotización anual de patentes y diagnóstico ambiental.'
        }
      ]
    };
  },

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATE);
      if (data) {
        const parsed = JSON.parse(data);
        if (!parsed.proformas || parsed.proformas.length === 0) {
          parsed.proformas = this.getInitialSeed().proformas;
          this.saveState(parsed);
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error cargando estado:', e);
    }
    const seed = this.getInitialSeed();
    this.saveState(seed);
    return seed;
  },

  saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state));
    } catch (e) {
      console.error('Error guardando estado:', e);
    }
  },

  resetDemoData() {
    const seed = this.getInitialSeed();
    this.saveState(seed);
    return seed;
  },

  buscarCiudadanos(state, query) {
    if (!query || query.trim() === '') return state.ciudadanos;
    const q = query.toLowerCase().trim();
    return state.ciudadanos.filter(c => 
      c.identificacion.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.correo.toLowerCase().includes(q)
    );
  },

  obtenerConceptos(state) {
    return state.conceptos;
  },

  obtenerFacturasPendientes(state, ciudadanoId) {
    return state.facturasPendientes.filter(f => f.ciudadanoId === ciudadanoId && f.estado !== 'COBRADO');
  },

  obtenerBorradores(state) {
    return state.borradores || [];
  }
};

// =============================================================================
// 2. CONTROLADOR PRINCIPAL DEL POS ODOO (CONTROLLER)
// =============================================================================

const POSApp = {
  state: null,
  currentRole: 'cajero', // 'cajero' | 'tesorero' | 'contador'
  currentView: 'pos', // 'pos', 'comprobantes', 'apertura', 'cierre', 'tesoreria_cierres', etc.

  // Estado del borrador activo en la pantalla de facturación Odoo
  posDraft: {
    ciudadano: null,
    modo: 'NUEVA_FACTURA', // 'NUEVA_FACTURA' | 'COBRAR_EXISTENTE'
    facturaExistenteSeleccionada: null,
    items: [], // Array de conceptos con atributos
    selectedLineIndex: 0, // Línea activa para el Numpad
    numpadMode: 'qty', // 'qty' | 'disc' | 'price'
    numpadBuffer: '', // Dígitos tipeados actualmente
    selectedCategory: 'TODOS', // Filtro de catálogo
    catalogSearchQuery: '',
    showFullBreakdown: false,
    budgetAccordionOpen: false,
    // Deducciones aplicadas
    cobrosAnterioresCents: 0,
    anticiposAplicadosCents: 0,
    retencionesAplicadasCents: 0,
    valorARecaudarCustomCents: null,
    // Formas de cobro
    metodoPago: 'EFECTIVO', // 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'
    efectivoRecibidoInput: '',
    bancoSeleccionado: 'Banco Pichincha',
    cuentaInstitucionalDestino: 'BCE - Cta. Rotativa Única N° 12-004-912',
    referenciaPago: '',
    transferenciaVerificada: true,
    tarjetaTipo: 'Visa Débito',
    tarjetaLoteVoucher: '',
    tarjetaConfirmada: true,
    isProcessing: false
  },

  reversionTargetId: null,

  /** Inicialización de la aplicación */
  init() {
    this.state = DataService.loadState();
    this.setupEventListeners();
    this.startClock();
    this.updateHeaderDisplay();
    this.updateOdooBackendIndicator();
    this.renderSidebarNavigation();
    this.renderCurrentView();
  },

  /** Actualiza el indicador visual de conexión con Odoo 19 Backend */
  updateOdooBackendIndicator() {
    const dot = document.getElementById('dot-odoo-backend');
    const lbl = document.getElementById('lbl-odoo-backend');
    const isLive = typeof OdooBackendService !== 'undefined' && OdooBackendService.config.active;

    if (dot && lbl) {
      if (isLive) {
        dot.style.background = '#10B981'; // Verde
        lbl.textContent = 'Odoo 19: En Vivo';
      } else {
        dot.style.background = '#FBBF24'; // Ámbar
        lbl.textContent = 'Odoo 19: Simulado';
      }
    }
  },

  openOdooBackendModal() {
    const isLive = typeof OdooBackendService !== 'undefined' && OdooBackendService.config.active;
    const urlInput = document.getElementById('odoo-cfg-url');
    const dbInput = document.getElementById('odoo-cfg-db');
    const userInput = document.getElementById('odoo-cfg-user');
    const passInput = document.getElementById('odoo-cfg-pass');
    const statusText = document.getElementById('odoo-status-text');
    const actionTxt = document.getElementById('btn-odoo-action-txt');

    if (typeof OdooBackendService !== 'undefined') {
      if (urlInput) urlInput.value = OdooBackendService.config.serverUrl;
      if (dbInput) dbInput.value = OdooBackendService.config.database;
      if (userInput) userInput.value = OdooBackendService.config.auth.username;
      if (passInput) passInput.value = OdooBackendService.config.auth.password;
    }

    if (statusText) {
      statusText.innerHTML = isLive
        ? '<span class="text-success fw-bold">● Modo En Vivo Activo (Conectado a servidor Odoo 19)</span>'
        : '<span class="text-warning fw-bold">● Modo Simulado (Funcionando con datos de demostración)</span>';
    }
    if (actionTxt) {
      actionTxt.textContent = isLive ? 'Cambiar a Modo Simulado' : 'Activar Odoo en Vivo';
    }

    this.openModal('modal-odoo-backend');
  },

  /** Reloj en tiempo real en el encabezado */
  startClock() {
    const clockEl = document.getElementById('hdr-clock');
    const update = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString('es-EC', { hour12: false });
      }
    };
    update();
    setInterval(update, 1000);
  },

  /** Listeners globales */
  setupEventListeners() {
    // Selector de rol en encabezado
    const roleSelect = document.getElementById('select-global-role');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        this.switchRole(e.target.value);
      });
    }

    // Botón de restablecer datos demo
    const btnReset = document.getElementById('btn-reset-seed');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Desea restablecer todos los datos del prototipo al estado inicial de demostración?')) {
          this.state = DataService.resetDemoData();
          this.posDraftReset();
          this.showToast('Datos de demostración restablecidos con éxito.', 'success');
          this.updateHeaderDisplay();
          this.renderSidebarNavigation();
          this.renderCurrentView();
        }
      });
    }

    // Barra superior de módulos Odoo (Tabs en la barra superior)
    const topModulesBar = document.getElementById('odoo-top-modules-bar');
    if (topModulesBar) {
      topModulesBar.querySelectorAll('.odoo-module-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mod = e.currentTarget.getAttribute('data-module');
          this.currentView = mod;
          this.updateHeaderDisplay();
          this.renderSidebarNavigation();
          this.renderCurrentView();
        });
      });
    }

    // Toggle de la barra lateral (App Drawer / Submódulos)
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const sidebarPanel = document.getElementById('pos-sidebar-panel');
    if (btnToggleSidebar && sidebarPanel) {
      btnToggleSidebar.addEventListener('click', () => {
        sidebarPanel.classList.toggle('hidden');
      });
    }

    // Cierre de modales con [data-close] o clic en backdrop
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn) {
        const modalId = closeBtn.getAttribute('data-close');
        this.closeModal(modalId);
      }
      if (e.target.classList.contains('modal-backdrop-custom') || e.target.classList.contains('modal-backdrop')) {
        this.closeModal(e.target.id);
      }
    });

    // Atajos de teclado del POS: F2 (Nuevo), F4 (Cobrar), Escape (Cerrar modal)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop-custom:not(.hidden), .modal-backdrop:not(.hidden)').forEach(modal => {
          modal.classList.add('hidden');
        });
      } else if (e.key === 'F2') {
        e.preventDefault();
        if (this.currentView === 'pos') {
          this.handleActionNuevo();
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        if (this.currentView === 'pos') {
          this.handleOpenConfirmCheckout();
        }
      }
    });

    // Confirmación de Apertura de Caja
    const btnSubmitAp = document.getElementById('btn-submit-apertura');
    if (btnSubmitAp) {
      btnSubmitAp.addEventListener('click', () => {
        this.handleConfirmApertura();
      });
    }

    // Ejecutar Cobro Final (en modal de confirmación)
    const btnConfirmFinal = document.getElementById('btn-confirm-final-action');
    if (btnConfirmFinal) {
      btnConfirmFinal.addEventListener('click', () => {
        this.executeFinalCheckout();
      });
    }

    // Imprimir ticket desde modal
    const btnPrintTicket = document.getElementById('btn-ticket-imprimir');
    if (btnPrintTicket) {
      btnPrintTicket.addEventListener('click', () => {
        window.print();
      });
    }

    // Nueva atención desde modal de ticket
    const btnNewAtt = document.getElementById('btn-ticket-nueva-atencion');
    if (btnNewAtt) {
      btnNewAtt.addEventListener('click', () => {
        this.closeModal('modal-ticket');
        this.handleActionNuevo();
      });
    }

    // Imprimir proforma desde modal
    const btnPrintProforma = document.getElementById('btn-proforma-imprimir');
    if (btnPrintProforma) {
      btnPrintProforma.addEventListener('click', () => {
        window.print();
      });
    }

    // Convertir proforma a factura directamente desde modal
    const btnConvertProformaDirecto = document.getElementById('btn-proforma-convertir-directo');
    if (btnConvertProformaDirecto) {
      btnConvertProformaDirecto.addEventListener('click', () => {
        const proformaId = btnConvertProformaDirecto.getAttribute('data-proforma-id');
        this.closeModal('modal-proforma-ticket');
        if (proformaId) {
          this.handleConvertirProformaAFactura(proformaId);
        }
      });
    }

    // Solicitud de Reversión
    const btnSubmitRev = document.getElementById('btn-submit-solicitud-reversion');
    if (btnSubmitRev) {
      btnSubmitRev.addEventListener('click', () => {
        this.handleSubmitReversion();
      });
    }

    // Registro de Depósito Bancario
    const btnSubmitDep = document.getElementById('btn-submit-deposito');
    if (btnSubmitDep) {
      btnSubmitDep.addEventListener('click', () => {
        this.handleSubmitDeposito();
      });
    }

    // Búsqueda en Modal de Selección de Cliente
    const citizenSearchInput = document.getElementById('citizen-modal-search');
    if (citizenSearchInput) {
      citizenSearchInput.addEventListener('input', (e) => {
        this.renderCitizenModalResults(e.target.value);
      });
    }

    // Modal de Conexión con Odoo Backend
    const btnToggleOdoo = document.getElementById('btn-toggle-odoo-backend');
    if (btnToggleOdoo) {
      btnToggleOdoo.addEventListener('click', () => {
        this.openOdooBackendModal();
      });
    }

    const btnPingOdoo = document.getElementById('btn-test-odoo-ping');
    if (btnPingOdoo) {
      btnPingOdoo.addEventListener('click', async () => {
        const urlInput = document.getElementById('odoo-cfg-url');
        if (urlInput && typeof OdooBackendService !== 'undefined') {
          OdooBackendService.config.serverUrl = urlInput.value.trim();
        }
        const statusText = document.getElementById('odoo-status-text');
        if (statusText) statusText.innerHTML = '⏳ Probando conexión con Odoo 19...';

        if (typeof OdooBackendService !== 'undefined') {
          const res = await OdooBackendService.testConnection();
          if (res.success) {
            if (statusText) statusText.innerHTML = '<span class="text-success fw-bold">✓ Conectado exitosamente con Odoo 19</span>';
            this.showToast('Conexión con Odoo 19 verificada.', 'success');
          } else {
            if (statusText) statusText.innerHTML = `<span class="text-danger fw-bold">✕ Sin conexión: Servidor Odoo no responde en esa URL</span>`;
            this.showToast('El servidor Odoo no responde en esa URL.', 'warning');
          }
        }
      });
    }

    const btnSaveOdoo = document.getElementById('btn-save-toggle-odoo');
    if (btnSaveOdoo) {
      btnSaveOdoo.addEventListener('click', () => {
        if (typeof OdooBackendService !== 'undefined') {
          const urlInput = document.getElementById('odoo-cfg-url');
          const dbInput = document.getElementById('odoo-cfg-db');
          const userInput = document.getElementById('odoo-cfg-user');
          const passInput = document.getElementById('odoo-cfg-pass');

          if (urlInput) OdooBackendService.config.serverUrl = urlInput.value.trim();
          if (dbInput) OdooBackendService.config.database = dbInput.value.trim();
          if (userInput) OdooBackendService.config.auth.username = userInput.value.trim();
          if (passInput) OdooBackendService.config.auth.password = passInput.value.trim();

          OdooBackendService.config.active = !OdooBackendService.config.active;
          this.updateOdooBackendIndicator();
          this.closeModal('modal-odoo-backend');
          this.showToast(OdooBackendService.config.active ? 'Modo Odoo en Vivo activado.' : 'Modo Simulado activado.', 'info');
        }
      });
    }
  },

  /** Cambio de Rol (Cajero, Tesorero, Contador) */
  switchRole(role) {
    this.currentRole = role;
    if (role === 'cajero') {
      this.currentView = 'pos';
    } else if (role === 'tesorero') {
      this.currentView = 'tesoreria_cierres';
    } else if (role === 'contador') {
      this.currentView = 'contabilidad_auditoria';
    }
    this.updateHeaderDisplay();
    this.renderSidebarNavigation();
    this.renderCurrentView();
    this.showToast(`Vista cambiada a: ${this.getRoleDisplayName(role)}`, 'info');
  },

  getRoleDisplayName(role) {
    if (role === 'cajero') return 'Cajero de Ventanilla (Operación POS)';
    if (role === 'tesorero') return 'Tesorero (Supervisión y Bancarización)';
    if (role === 'contador') return 'Contador (Trazabilidad y Asientos)';
    return role;
  },

  /** Actualización de textos e indicadores del encabezado Odoo */
  updateHeaderDisplay() {
    const caja = this.state.cajas[0];
    const isAbierta = caja && caja.estado === 'ABIERTA';

    const statusPill = document.getElementById('hdr-caja-status');
    if (statusPill) {
      if (isAbierta) {
        statusPill.className = 'odoo-badge-state open';
        statusPill.innerHTML = '<span class="odoo-state-dot"></span> ABIERTA';
      } else {
        statusPill.className = 'odoo-badge-state closed';
        statusPill.innerHTML = '<span class="odoo-state-dot"></span> CERRADA';
      }
    }

    const userName = document.getElementById('hdr-user-name');
    const userRole = document.getElementById('hdr-user-role');
    const userAvatar = document.getElementById('hdr-user-avatar');

    if (this.currentRole === 'cajero') {
      if (userName) userName.textContent = 'Alex Palma';
      if (userRole) userRole.textContent = 'Cajero de Ventanilla';
      if (userAvatar) {
        userAvatar.textContent = 'AP';
        userAvatar.style.background = 'var(--odoo-secondary)';
      }
    } else if (this.currentRole === 'tesorero') {
      if (userName) userName.textContent = 'Dra. Carmen Velasteguí';
      if (userRole) userRole.textContent = 'Supervisión de Tesorería';
      if (userAvatar) {
        userAvatar.textContent = 'CV';
        userAvatar.style.background = '#0e3054';
      }
    } else if (this.currentRole === 'contador') {
      if (userName) userName.textContent = 'Lcdo. Rodrigo Andrade';
      if (userRole) userRole.textContent = 'Contabilidad Financiera';
      if (userAvatar) {
        userAvatar.textContent = 'RA';
        userAvatar.style.background = '#047857';
      }
    }

    const selectRole = document.getElementById('select-global-role');
    if (selectRole && selectRole.value !== this.currentRole) {
      selectRole.value = this.currentRole;
    }

    // Sincronizar módulos activos en la barra superior
    const topModulesBar = document.getElementById('odoo-top-modules-bar');
    if (topModulesBar) {
      topModulesBar.querySelectorAll('.odoo-module-link').forEach(btn => {
        const mod = btn.getAttribute('data-module');
        if (mod === this.currentView || (mod === 'tesoreria_cierres' && this.currentView.startsWith('tesoreria')) || (mod === 'contabilidad_auditoria' && this.currentView.startsWith('contabilidad'))) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  },

  /** Menú Lateral Dinámico */
  renderSidebarNavigation() {
    const navList = document.getElementById('sidebar-nav');
    const titleEl = document.getElementById('sb-section-title');
    if (!navList) return;

    let items = [];
    if (this.currentRole === 'cajero') {
      titleEl.textContent = 'MÓDULO DE CAJA';
      items = [
        { id: 'pos', label: 'Punto de Venta (POS)', icon: '<i class="bi bi-shop"></i>' },
        { id: 'proformas', label: 'Proformas / Cotizaciones', icon: '<i class="bi bi-file-earmark-spreadsheet"></i>' },
        { id: 'comprobantes', label: 'Comprobantes Emitidos', icon: '<i class="bi bi-receipt"></i>' },
        { id: 'apertura', label: 'Apertura de Caja', icon: '<i class="bi bi-box-arrow-in-right"></i>' },
        { id: 'cierre', label: 'Arqueo y Cierre de Caja', icon: '<i class="bi bi-door-closed"></i>' }
      ];
    } else if (this.currentRole === 'tesorero') {
      titleEl.textContent = 'MÓDULO DE TESORERÍA';
      items = [
        { id: 'proformas', label: 'Cotizaciones / Proformas', icon: '<i class="bi bi-file-earmark-spreadsheet"></i>' },
        { id: 'tesoreria_cierres', label: 'Cierres de Caja Recibidos', icon: '<i class="bi bi-journal-bookmark"></i>' },
        { id: 'tesoreria_depositos', label: 'Depósitos Bancarios', icon: '<i class="bi bi-bank"></i>' },
        { id: 'tesoreria_reversiones', label: 'Solicitudes de Reversión', icon: '<i class="bi bi-arrow-repeat"></i>' },
        { id: 'tesoreria_reporte', label: 'Reporte de Recaudación', icon: '<i class="bi bi-bar-chart"></i>' }
      ];
    } else if (this.currentRole === 'contador') {
      titleEl.textContent = 'MÓDULO CONTABLE';
      items = [
        { id: 'contabilidad_auditoria', label: 'Auditoría y Trazabilidad', icon: '<i class="bi bi-clipboard-check"></i>' },
        { id: 'contabilidad_asientos', label: 'Asientos Contables Tipo', icon: '<i class="bi bi-journal-code"></i>' }
      ];
    }

    navList.innerHTML = items.map(item => `
      <li>
        <button class="sidebar-btn ${this.currentView === item.id ? 'active' : ''}" data-view="${item.id}">
          <span style="font-size: 1.1rem; line-height: 1;">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      </li>
    `).join('');

    navList.querySelectorAll('.sidebar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.currentView = e.currentTarget.getAttribute('data-view');
        this.updateHeaderDisplay();
        this.renderSidebarNavigation();
        this.renderCurrentView();
      });
    });
  },

  /** Renderiza la vista principal activa */
  renderCurrentView() {
    const main = document.getElementById('pos-main-container');
    if (!main) return;

    if (this.currentView === 'pos') this.renderViewPOS(main);
    else if (this.currentView === 'proformas') this.renderViewProformas(main);
    else if (this.currentView === 'comprobantes') this.renderViewComprobantes(main);
    else if (this.currentView === 'apertura') this.renderViewApertura(main);
    else if (this.currentView === 'cierre') this.renderViewCierre(main);
    else if (this.currentView === 'tesoreria_cierres') this.renderViewTesoreriaCierres(main);
    else if (this.currentView === 'tesoreria_depositos') this.renderViewTesoreriaDepositos(main);
    else if (this.currentView === 'tesoreria_reversiones') this.renderViewTesoreriaReversiones(main);
    else if (this.currentView === 'tesoreria_reporte') this.renderViewTesoreriaReporte(main);
    else if (this.currentView === 'contabilidad_auditoria') this.renderViewContabilidadAuditoria(main);
    else if (this.currentView === 'contabilidad_asientos') this.renderViewContabilidadAsientos(main);
  },

  // ===========================================================================
  // 3. VISTA PRINCIPAL ODOO POS (SPLIT SCREEN: TICKET + NUMPAD + CATÁLOGO)
  // ===========================================================================

  renderViewPOS(container) {
    const caja = this.state.cajas[0];
    const isAbierta = caja && caja.estado === 'ABIERTA';
    const draftCount = (this.state.borradores || []).length;

    // Si la caja está cerrada, bloquear con aviso formal estilo Odoo
    if (!isAbierta) {
      container.innerHTML = `
        <div class="card shadow-sm border-danger p-4 text-center my-4 mx-auto" style="max-width: 580px; background: #FFF5F5;">
          <div class="mb-3 text-danger">
            <i class="bi bi-lock-fill" style="font-size: 3rem;"></i>
          </div>
          <h4 class="fw-bold text-danger mb-2">La Caja se encuentra CERRADA</h4>
          <p class="text-muted small mb-4">
            Por normativa de control de arqueo y tesorería pública del Ecuador, debe aperturar su turno e ingresar el fondo de sencillo antes de recaudar.
          </p>
          <div>
            <button class="btn btn-primary fw-bold px-4" id="btn-ir-apertura-box" style="background: var(--odoo-primary); border-color: var(--odoo-primary-dark);">
              <i class="bi bi-box-arrow-in-right"></i> Realizar Apertura de Caja
            </button>
          </div>
        </div>
      `;
      const btnAp = container.querySelector('#btn-ir-apertura-box');
      if (btnAp) {
        btnAp.addEventListener('click', () => {
          this.openModalApertura();
        });
      }
      return;
    }

    const totals = this.calculateTotals();
    const items = this.posDraft.items;
    const selectedIdx = this.posDraft.selectedLineIndex;
    const ciudadano = this.posDraft.ciudadano;
    const modo = this.posDraft.modo;
    const pendingCount = this.getPendingInvoicesCount();

    container.innerHTML = `
      <div class="odoo-pos-container">
        
        <!-- SUB-BARRA DE CONTROL ODOO POS -->
        <div class="odoo-pos-subbar">
          <div class="pos-actions-group">
            <button class="btn-odoo-tool btn-odoo-primary" id="bar-btn-nuevo" title="Iniciar nuevo pedido limpio">
              <i class="bi bi-plus-lg"></i> Nuevo <span class="odoo-kbd">F2</span>
            </button>
            <button class="btn-odoo-tool" id="bar-btn-guardar-borrador" title="Poner orden en espera">
              <i class="bi bi-pause-circle"></i> Poner en Espera
            </button>
            <button class="btn-odoo-tool" id="bar-btn-ver-borradores" title="Recuperar orden pausada">
              <i class="bi bi-clock-history"></i> Órdenes <span class="badge bg-secondary">${draftCount}</span>
            </button>
            <button class="btn-odoo-tool" id="bar-btn-emitir-proforma" title="Generar proforma / cotización con los ítems y contribuyente actual">
              <i class="bi bi-file-earmark-spreadsheet text-info"></i> Emitir Proforma
            </button>
            
            <!-- Selector de Modos Odoo A / B -->
            <div class="odoo-mode-pills ms-2">
              <button class="odoo-mode-btn ${modo === 'NUEVA_FACTURA' ? 'active' : ''}" id="tab-modo-nueva">
                <i class="bi bi-cart-plus"></i> Modo A: Nueva Factura
              </button>
              <button class="odoo-mode-btn ${modo === 'COBRAR_EXISTENTE' ? 'active' : ''}" id="tab-modo-existente">
                <i class="bi bi-file-earmark-check"></i> Modo B: Cobrar Existente (${pendingCount})
              </button>
            </div>
          </div>

          <!-- Demos Rápidas SRI -->
          <div class="pos-actions-group">
            <span class="text-muted fw-bold small me-1 d-none d-xl-inline" style="font-size: 0.72rem;">Demos SRI:</span>
            <button class="btn-odoo-tool btn-load-scenario" data-scenario="TARIFA_0" title="Tarifa IVA 0%">
              1. IVA 0%
            </button>
            <button class="btn-odoo-tool btn-load-scenario" data-scenario="GRAVADA_IVA" title="Gravada IVA 15%">
              2. IVA 15%
            </button>
            <button class="btn-odoo-tool btn-load-scenario" data-scenario="TRATAMIENTOS_COMBINADOS" title="4 Tratamientos">
              3. 4 Casos
            </button>
            <button class="btn-odoo-tool btn-load-scenario" data-scenario="COBRO_ANTERIOR_RETENCION" title="Pago previo + Retención">
              4. Retención
            </button>
            <button class="btn-odoo-tool btn-load-scenario" data-scenario="EXONERACION_AUTORIZADA" title="50% Tercera Edad">
              5. Exoneración
            </button>
          </div>
        </div>

        <!-- GRID PRINCIPAL ODOO POS -->
        <div class="odoo-pos-grid">
          
          <!-- COLUMNA IZQUIERDA: ORDEN / TICKET + TECLADO NUMPAD TOUCH -->
          <div class="odoo-pos-left">
            
            <!-- Selector de Ciudadano / Contribuyente -->
            <div class="odoo-customer-bar">
              ${ciudadano ? `
                <div class="customer-active-badge">
                  <div class="customer-info-left">
                    <div class="customer-icon">${ciudadano.nombre.substring(0, 2).toUpperCase()}</div>
                    <div>
                      <div class="customer-text-name">${ciudadano.nombre}</div>
                      <div class="customer-text-meta">${ciudadano.tipoIdentificacion}: ${ciudadano.identificacion} • ${ciudadano.tipoContribuyente}</div>
                    </div>
                  </div>
                  <button class="btn-customer-clear" id="btn-cambiar-ciudadano" title="Cambiar o desvincular contribuyente">
                    <i class="bi bi-x-circle fs-6"></i>
                  </button>
                </div>
              ` : `
                <button class="btn-select-customer" id="btn-abrir-selector-cliente">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-plus fs-5 text-secondary"></i>
                    <span class="fw-bold small text-dark">+ Asignar Cliente / Contribuyente</span>
                  </div>
                  <span class="badge bg-light text-muted border">Buscar Cédula / RUC</span>
                </button>
              `}
            </div>

            <!-- Lista de Líneas de Orden (Ticket Odoo) -->
            <div class="odoo-orderlines-area" id="odoo-orderlines-list">
              ${items.length === 0 ? `
                <div class="odoo-empty-ticket">
                  <i class="bi bi-bag-plus"></i>
                  <h6 class="fw-bold text-secondary mb-1">El pedido está vacío</h6>
                  <p class="small text-muted mb-0">Haga clic en los conceptos del catálogo de la derecha para agregarlos a la orden.</p>
                </div>
              ` : items.map((it, idx) => {
                const isSelected = idx === selectedIdx;
                let taxClass = 'orderline-tax-0';
                let taxText = 'IVA 0%';
                if (it.tratamientoTributario === 'IVA_15') { taxClass = 'orderline-tax-15'; taxText = 'IVA 15%'; }
                else if (it.tratamientoTributario === 'EXENTO') { taxClass = 'orderline-tax-exento'; taxText = 'Exento'; }
                else if (it.tratamientoTributario === 'NO_OBJETO') { taxClass = 'orderline-tax-noobjeto'; taxText = 'No Objeto'; }

                return `
                  <div class="odoo-orderline ${isSelected ? 'selected' : ''}" data-line-index="${idx}">
                    <div class="orderline-header">
                      <span class="orderline-title">${it.nombre}</span>
                      <span class="orderline-total">${MoneyUtil.format(it.totalLineaCents)}</span>
                    </div>
                    <div class="orderline-details">
                      <div class="orderline-qty-info">
                        <strong>${it.cantidad}</strong> unidad${it.cantidad > 1 ? 'es' : ''} x 
                        <span>${MoneyUtil.format(it.tarifaCents)}</span>
                        <span class="orderline-tax-badge ${taxClass}">${taxText}</span>
                        ${it.rebajaAutorizadaCents > 0 ? `
                          <span class="text-danger fw-bold">(-${MoneyUtil.format(it.rebajaAutorizadaCents * it.cantidad)})</span>
                        ` : ''}
                      </div>
                      <div class="d-flex align-items-center gap-1">
                        <button class="btn btn-sm btn-light border py-0 px-1 btn-minus-row" data-index="${idx}" title="Reducir">
                          <i class="bi bi-dash"></i>
                        </button>
                        <button class="btn btn-sm btn-light border py-0 px-1 btn-plus-row" data-index="${idx}" title="Aumentar">
                          <i class="bi bi-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-light text-danger border py-0 px-1 btn-remove-line ms-1" data-index="${idx}" title="Eliminar concepto">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Resumen Financiero del Ticket -->
            <div class="odoo-ticket-summary">
              <div class="ticket-sum-row">
                <span>Subtotal neto de conceptos</span>
                <span class="font-mono">${MoneyUtil.format(totals.subtotalNetoCents)}</span>
              </div>
              ${totals.iva15Cents > 0 ? `
                <div class="ticket-sum-row">
                  <span>Impuesto IVA 15%</span>
                  <span class="font-mono text-primary">${MoneyUtil.format(totals.iva15Cents)}</span>
                </div>
              ` : ''}
              ${totals.rebajasTotalCents > 0 ? `
                <div class="ticket-sum-row discount">
                  <span>(-) Exoneraciones autorizadas</span>
                  <span class="font-mono">-${MoneyUtil.format(totals.rebajasTotalCents)}</span>
                </div>
              ` : ''}
              ${totals.totalDeduccionesCents > 0 ? `
                <div class="ticket-sum-row discount">
                  <span>(-) Cobros previos y retenciones</span>
                  <span class="font-mono">-${MoneyUtil.format(totals.totalDeduccionesCents)}</span>
                </div>
              ` : ''}
              <div class="ticket-sum-total">
                <span>TOTAL A COBRAR</span>
                <span class="val" id="sum-to-collect">${MoneyUtil.format(totals.valorARecaudarCents)}</span>
              </div>
            </div>

            <!-- TECLADO TOUCH ODOO (NUMPAD & ACTION PAD) -->
            <div class="odoo-action-numpad">
              <!-- Modos del Teclado -->
              <div class="numpad-modes">
                <button class="btn-numpad-mode ${this.posDraft.numpadMode === 'qty' ? 'active' : ''}" data-mode="qty" title="Modificar Cantidad">
                  Cant
                </button>
                <button class="btn-numpad-mode ${this.posDraft.numpadMode === 'disc' ? 'active' : ''}" data-mode="disc" title="Aplicar Rebaja / Descuento">
                  % Desc
                </button>
                <button class="btn-numpad-mode ${this.posDraft.numpadMode === 'price' ? 'active' : ''}" data-mode="price" title="Modificar Tarifa">
                  Precio
                </button>
                <button class="btn-numpad-mode text-danger" id="btn-numpad-backspace" title="Borrar / Corregir">
                  <i class="bi bi-backspace-fill"></i>
                </button>
              </div>

              <!-- Dígitos 1-9, +/-, 0, . -->
              <div class="numpad-keys">
                <button class="btn-numpad-key" data-key="1">1</button>
                <button class="btn-numpad-key" data-key="2">2</button>
                <button class="btn-numpad-key" data-key="3">3</button>
                <button class="btn-numpad-key" data-key="4">4</button>
                <button class="btn-numpad-key" data-key="5">5</button>
                <button class="btn-numpad-key" data-key="6">6</button>
                <button class="btn-numpad-key" data-key="7">7</button>
                <button class="btn-numpad-key" data-key="8">8</button>
                <button class="btn-numpad-key" data-key="9">9</button>
                <button class="btn-numpad-key" data-key="+/-">+/-</button>
                <button class="btn-numpad-key" data-key="0">0</button>
                <button class="btn-numpad-key" data-key=".">.</button>
              </div>
            </div>

            <!-- Botón Grande de Pago Odoo (Teal #017E84) -->
            <div class="odoo-btn-pay-block">
              <button class="btn-odoo-checkout" id="btn-checkout-final">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-credit-card-2-back fs-5"></i>
                  <span>Pagar / Cobrar (F4)</span>
                </div>
                <span class="font-mono fs-5" id="btn-pay-amount-display">${MoneyUtil.format(totals.valorARecaudarCents)}</span>
              </button>
            </div>

          </div>

          <!-- COLUMNA DERECHA: CATÁLOGO DE PRODUCTOS / CONCEPTOS (ODOO POS GRID) -->
          <div class="odoo-pos-right">
            
            <!-- Barra Superior de Búsqueda y Categorías -->
            <div class="odoo-catalog-header">
              <div class="odoo-search-wrap">
                <i class="bi bi-search search-icon"></i>
                <input type="text" id="input-catalog-search" class="odoo-search-input" placeholder="Buscar por código o descripción del trámite institucional..." value="${this.posDraft.catalogSearchQuery || ''}">
              </div>

              <!-- Pastillas de Categorías -->
              <div class="odoo-categories-bar" id="odoo-categories-list">
                <button class="odoo-category-pill ${this.posDraft.selectedCategory === 'TODOS' ? 'active' : ''}" data-cat="TODOS">
                  Todos los Trámites
                </button>
                <button class="odoo-category-pill ${this.posDraft.selectedCategory === 'TASAS' ? 'active' : ''}" data-cat="TASAS">
                  Tasas y Derechos
                </button>
                <button class="odoo-category-pill ${this.posDraft.selectedCategory === 'INSPECCIONES' ? 'active' : ''}" data-cat="INSPECCIONES">
                  Inspecciones Técnicas
                </button>
                <button class="odoo-category-pill ${this.posDraft.selectedCategory === 'SERVICIOS' ? 'active' : ''}" data-cat="SERVICIOS">
                  Servicios y Copias
                </button>
                <button class="odoo-category-pill ${this.posDraft.selectedCategory === 'ARRIENDOS' ? 'active' : ''}" data-cat="ARRIENDOS">
                  Arriendos y Vía Pública
                </button>
              </div>
            </div>

            <!-- Contenido según el Modo A o Modo B -->
            ${modo === 'NUEVA_FACTURA' ? `
              <!-- Grid de Tarjetas de Productos (Kanban Odoo POS) -->
              <div class="odoo-products-grid" id="odoo-products-grid">
                ${this.renderOdooProductCards()}
              </div>
            ` : `
              <!-- Modo B: Selector y Tarjetas de Facturas u Obligaciones Pendientes -->
              <div class="p-3" style="flex: 1; overflow-y: auto;">
                ${this.renderPendingInvoicesSelectorOdoo()}
              </div>
            `}

            <!-- Acordeón de Trazabilidad Presupuestaria y Contable (Bottom Drawer) -->
            <div class="border-top bg-light p-2 px-3">
              <div class="d-flex align-items-center justify-content-between" role="button" id="btn-toggle-budget-accordion" style="cursor: pointer;">
                <div class="d-flex align-items-center gap-2 small fw-bold text-dark">
                  <i class="bi bi-diagram-3-fill text-secondary"></i>
                  <span>Trazabilidad Presupuestaria y Contable Institucional (Simulación)</span>
                </div>
                <div class="d-flex align-items-center gap-2 small text-muted">
                  <span>${this.posDraft.budgetAccordionOpen ? 'Ocultar' : 'Consultar asociaciones'}</span>
                  <i class="bi bi-chevron-${this.posDraft.budgetAccordionOpen ? 'up' : 'down'}"></i>
                </div>
              </div>

              ${this.posDraft.budgetAccordionOpen ? `
                <div class="mt-2 pt-2 border-top">
                  <div class="table-responsive">
                    <table class="table table-sm table-bordered bg-white small mb-1">
                      <thead class="table-light">
                        <tr>
                          <th>Concepto</th>
                          <th>Partida Presupuestaria</th>
                          <th>Cuenta Contable</th>
                          <th>Unidad Responsable</th>
                          <th>Tesorería</th>
                          <th>Contabilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this.renderBudgetAccordionRows()}
                      </tbody>
                    </table>
                  </div>
                  <div class="d-flex justify-content-between text-muted" style="font-size: 0.65rem;">
                    <span>* Partidas y cuentas de demostración según catálogo oficial de finanzas públicas.</span>
                    <span class="text-success fw-bold">✓ Trazabilidad en tiempo real</span>
                  </div>
                </div>
              ` : ''}
            </div>

          </div>

        </div>

      </div>
    `;

    this.bindPOSEvents(container);
  },

  /** Genera las tarjetas de productos del catálogo Odoo */
  renderOdooProductCards() {
    let conceptos = DataService.obtenerConceptos(this.state);
    
    // Filtrar por categoría
    if (this.posDraft.selectedCategory && this.posDraft.selectedCategory !== 'TODOS') {
      conceptos = conceptos.filter(c => c.categoria === this.posDraft.selectedCategory);
    }

    // Filtrar por texto de búsqueda
    if (this.posDraft.catalogSearchQuery && this.posDraft.catalogSearchQuery.trim() !== '') {
      const q = this.posDraft.catalogSearchQuery.toLowerCase().trim();
      conceptos = conceptos.filter(c => 
        c.codigo.toLowerCase().includes(q) ||
        c.nombre.toLowerCase().includes(q) ||
        (c.referenciaObligacion && c.referenciaObligacion.toLowerCase().includes(q))
      );
    }

    if (conceptos.length === 0) {
      return `
        <div class="text-center py-5 text-muted" style="grid-column: 1 / -1;">
          <i class="bi bi-search fs-3 mb-2 d-block"></i>
          <p class="small mb-0">No se encontraron trámites o conceptos con ese criterio.</p>
        </div>
      `;
    }

    return conceptos.map(c => {
      let taxClass = 'orderline-tax-0';
      let taxBadge = 'IVA 0%';
      if (c.tratamientoTributario === 'IVA_15') { taxClass = 'orderline-tax-15'; taxBadge = 'IVA 15%'; }
      else if (c.tratamientoTributario === 'EXENTO') { taxClass = 'orderline-tax-exento'; taxBadge = 'Exento'; }
      else if (c.tratamientoTributario === 'NO_OBJETO') { taxClass = 'orderline-tax-noobjeto'; taxBadge = 'No Objeto'; }

      return `
        <div class="odoo-product-card" data-concept-code="${c.codigo}" role="button" tabindex="0">
          <div>
            <div class="card-top-icon">
              <div class="card-icon-badge">
                <i class="bi ${c.icono || 'bi-tag'}"></i>
              </div>
              <span class="card-product-tax ${taxClass}">${taxBadge}</span>
            </div>
            <div class="card-product-title" title="${c.nombre}">${c.nombre}</div>
            <div class="card-product-code">${c.codigo} • ${c.periodo || '2026'}</div>
          </div>
          <div class="card-bottom-row">
            <span class="card-product-price">${MoneyUtil.format(c.tarifaCents)}</span>
            <span class="text-primary small fw-bold"><i class="bi bi-plus-circle-fill"></i></span>
          </div>
        </div>
      `;
    }).join('');
  },

  /** Modo B Odoo: Selección de Facturas Pendientes */
  renderPendingInvoicesSelectorOdoo() {
    if (!this.posDraft.ciudadano) {
      return `
        <div class="card p-4 text-center border-dashed my-3">
          <i class="bi bi-person-x fs-2 text-muted mb-2"></i>
          <h6 class="fw-bold text-dark">Ningún Contribuyente Seleccionado</h6>
          <p class="small text-muted mb-3">Para consultar y recaudar facturas emitidas previamente, asigne primero al contribuyente.</p>
          <div>
            <button class="btn btn-sm btn-primary" id="btn-modo-b-asignar-cliente" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
              <i class="bi bi-person-plus"></i> Asignar Contribuyente
            </button>
          </div>
        </div>
      `;
    }

    const pending = DataService.obtenerFacturasPendientes(this.state, this.posDraft.ciudadano.id);
    if (pending.length === 0) {
      return `
        <div class="alert alert-success d-flex align-items-center gap-2 small">
          <i class="bi bi-check-circle-fill fs-5"></i>
          <div>
            <strong>Sin deudas pendientes:</strong> El contribuyente <strong>${this.posDraft.ciudadano.nombre}</strong> está al día con sus obligaciones.
          </div>
        </div>
      `;
    }

    return `
      <div>
        <h6 class="fw-bold text-dark mb-2">Obligaciones y Facturas Emitidas Pendientes de Cobro</h6>
        <div class="row g-3">
          ${pending.map(f => {
            const isSelected = this.posDraft.facturaExistenteSeleccionada?.id === f.id;
            return `
              <div class="col-12">
                <div class="card p-3 border ${isSelected ? 'border-primary shadow-sm bg-light' : ''}" style="cursor: pointer;" data-pending-fac-id="${f.id}">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge bg-secondary font-mono">${f.id}</span>
                      <h6 class="fw-bold mb-0 mt-1">${f.conceptoNombre}</h6>
                      <small class="text-muted font-mono">Ref: ${f.referenciaObligacion} • Fecha: ${f.fechaEmision}</small>
                    </div>
                    <div class="text-end">
                      <div class="text-muted small">Saldo Pendiente</div>
                      <div class="fw-bold fs-5 font-mono text-danger">${MoneyUtil.format(f.saldoPendienteCents || f.totalCents)}</div>
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center pt-2 border-top text-muted small">
                    <div>
                      Total Factura: <strong>${MoneyUtil.format(f.totalCents)}</strong> | Pagos Anteriores: <strong>${MoneyUtil.format(f.cobrosAnterioresCents || 0)}</strong>
                    </div>
                    <button class="btn btn-sm ${isSelected ? 'btn-success' : 'btn-outline-primary'} py-0 px-2">
                      ${isSelected ? '✓ Seleccionada' : 'Cargar para Cobro'}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  /** Bind de Eventos Odoo POS */
  bindPOSEvents(container) {
    // 1. Botón de Nuevo Pedido (F2)
    const btnNuevo = container.querySelector('#bar-btn-nuevo');
    if (btnNuevo) btnNuevo.addEventListener('click', () => this.handleActionNuevo());

    // 2. Botón Guardar / En Espera
    const btnGuardar = container.querySelector('#bar-btn-guardar-borrador');
    if (btnGuardar) btnGuardar.addEventListener('click', () => this.handleActionGuardarBorrador());

    // 3. Botón Ver Borradores
    const btnVerBorradores = container.querySelector('#bar-btn-ver-borradores');
    if (btnVerBorradores) btnVerBorradores.addEventListener('click', () => this.handleActionVerBorradores());

    // 3.1 Botón Emitir Proforma / Cotización
    const btnEmitirProforma = container.querySelector('#bar-btn-emitir-proforma');
    if (btnEmitirProforma) btnEmitirProforma.addEventListener('click', () => this.handleEmitirProforma());

    // 4. Modos A / B
    const tabModoNueva = container.querySelector('#tab-modo-nueva');
    const tabModoExistente = container.querySelector('#tab-modo-existente');
    if (tabModoNueva) {
      tabModoNueva.addEventListener('click', () => {
        this.posDraft.modo = 'NUEVA_FACTURA';
        this.posDraft.facturaExistenteSeleccionada = null;
        this.renderCurrentView();
      });
    }
    if (tabModoExistente) {
      tabModoExistente.addEventListener('click', () => {
        this.posDraft.modo = 'COBRAR_EXISTENTE';
        const pending = this.posDraft.ciudadano ? DataService.obtenerFacturasPendientes(this.state, this.posDraft.ciudadano.id) : [];
        if (pending.length > 0) {
          this.posDraft.facturaExistenteSeleccionada = pending[0];
          this.loadPendingInvoiceIntoDraft(pending[0]);
        }
        this.renderCurrentView();
      });
    }

    // 5. Botones de Carga de Escenarios Rápidos SRI
    container.querySelectorAll('.btn-load-scenario').forEach(btn => {
      btn.addEventListener('click', () => {
        const sc = btn.getAttribute('data-scenario');
        this.loadDemoScenario(sc);
      });
    });

    // 6. Selector de Cliente (Abre modal)
    const btnAbrirCliente = container.querySelector('#btn-abrir-selector-cliente');
    if (btnAbrirCliente) {
      btnAbrirCliente.addEventListener('click', () => {
        this.openCitizenModal();
      });
    }

    const btnModoBCliente = container.querySelector('#btn-modo-b-asignar-cliente');
    if (btnModoBCliente) {
      btnModoBCliente.addEventListener('click', () => {
        this.openCitizenModal();
      });
    }

    const btnCambiarCliente = container.querySelector('#btn-cambiar-ciudadano');
    if (btnCambiarCliente) {
      btnCambiarCliente.addEventListener('click', () => {
        this.posDraft.ciudadano = null;
        this.posDraft.facturaExistenteSeleccionada = null;
        this.renderCurrentView();
      });
    }

    // 7. Click en Tarjetas de Productos (Agrega al carrito Odoo)
    container.querySelectorAll('.odoo-product-card').forEach(card => {
      card.addEventListener('click', () => {
        const code = card.getAttribute('data-concept-code');
        const c = this.state.conceptos.find(con => con.codigo === code);
        if (c) {
          this.addConceptToDraftItems(c);
          this.renderCurrentView();
        }
      });
    });

    // 8. Click en Facturas Pendientes (Modo B)
    container.querySelectorAll('[data-pending-fac-id]').forEach(card => {
      card.addEventListener('click', () => {
        const facId = card.getAttribute('data-pending-fac-id');
        const fac = this.state.facturasPendientes.find(f => f.id === facId);
        if (fac) {
          this.posDraft.facturaExistenteSeleccionada = fac;
          this.loadPendingInvoiceIntoDraft(fac);
          this.renderCurrentView();
        }
      });
    });

    // 9. Pastillas de Categorías (Filtrar)
    container.querySelectorAll('.odoo-category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cat = pill.getAttribute('data-cat');
        this.posDraft.selectedCategory = cat;
        this.renderCurrentView();
      });
    });

    // 10. Búsqueda en Catálogo
    const inputSearch = container.querySelector('#input-catalog-search');
    if (inputSearch) {
      inputSearch.addEventListener('input', (e) => {
        this.posDraft.catalogSearchQuery = e.target.value;
        const grid = container.querySelector('#odoo-products-grid');
        if (grid) {
          grid.innerHTML = this.renderOdooProductCards();
          // Rebind clicks en las nuevas tarjetas
          grid.querySelectorAll('.odoo-product-card').forEach(card => {
            card.addEventListener('click', () => {
              const code = card.getAttribute('data-concept-code');
              const c = this.state.conceptos.find(con => con.codigo === code);
              if (c) {
                this.addConceptToDraftItems(c);
                this.renderCurrentView();
              }
            });
          });
        }
      });
    }

    // 11. Selección de Línea en la Orden (para el Numpad)
    container.querySelectorAll('.odoo-orderline').forEach(line => {
      line.addEventListener('click', (e) => {
        // Si no hizo clic en los botones de acción rápida
        if (!e.target.closest('button')) {
          const idx = parseInt(line.getAttribute('data-line-index'));
          this.posDraft.selectedLineIndex = idx;
          this.posDraft.numpadBuffer = '';
          this.renderCurrentView();
        }
      });
    });

    // 12. Controles de cantidad (+/-) y eliminar en las líneas
    container.querySelectorAll('.btn-minus-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'));
        if (this.posDraft.items[index] && this.posDraft.items[index].cantidad > 1) {
          this.posDraft.items[index].cantidad--;
          this.recalculateLine(this.posDraft.items[index]);
          this.renderCurrentView();
        }
      });
    });

    container.querySelectorAll('.btn-plus-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'));
        if (this.posDraft.items[index] && this.posDraft.items[index].cantidad < 99) {
          this.posDraft.items[index].cantidad++;
          this.recalculateLine(this.posDraft.items[index]);
          this.renderCurrentView();
        }
      });
    });

    container.querySelectorAll('.btn-remove-line').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'));
        this.posDraft.items.splice(index, 1);
        if (this.posDraft.selectedLineIndex >= this.posDraft.items.length) {
          this.posDraft.selectedLineIndex = Math.max(0, this.posDraft.items.length - 1);
        }
        this.renderCurrentView();
      });
    });

    // 13. Eventos del Teclado Odoo (Numpad)
    container.querySelectorAll('.btn-numpad-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.posDraft.numpadMode = mode;
        this.posDraft.numpadBuffer = '';
        this.renderCurrentView();
      });
    });

    container.querySelectorAll('.btn-numpad-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        this.handleNumpadInput(key);
      });
    });

    const btnBackspace = container.querySelector('#btn-numpad-backspace');
    if (btnBackspace) {
      btnBackspace.addEventListener('click', () => {
        this.handleNumpadBackspace();
      });
    }

    // 14. Botón Principal de Liquidación / Cobro
    const btnCheckout = container.querySelector('#btn-checkout-final');
    if (btnCheckout) {
      btnCheckout.addEventListener('click', () => {
        this.handleOpenConfirmCheckout();
      });
    }

    // 15. Toggle Acordeón Presupuestario
    const btnBudget = container.querySelector('#btn-toggle-budget-accordion');
    if (btnBudget) {
      btnBudget.addEventListener('click', () => {
        this.posDraft.budgetAccordionOpen = !this.posDraft.budgetAccordionOpen;
        this.renderCurrentView();
      });
    }
  },

  /** Maneja las teclas numéricas del Numpad Odoo */
  handleNumpadInput(key) {
    if (this.posDraft.items.length === 0) return;
    const item = this.posDraft.items[this.posDraft.selectedLineIndex];
    if (!item) return;

    if (key === '+/-') {
      return;
    }

    this.posDraft.numpadBuffer = (this.posDraft.numpadBuffer || '') + key;
    const numVal = parseFloat(this.posDraft.numpadBuffer);

    if (this.posDraft.numpadMode === 'qty') {
      const q = Math.max(1, Math.min(999, parseInt(this.posDraft.numpadBuffer) || 1));
      item.cantidad = q;
    } else if (this.posDraft.numpadMode === 'disc') {
      const discPct = Math.min(100, Math.max(0, numVal || 0));
      item.rebajaAutorizadaCents = Math.round((item.tarifaCents * discPct) / 100);
    } else if (this.posDraft.numpadMode === 'price') {
      if (!isNaN(numVal) && numVal >= 0) {
        item.tarifaCents = MoneyUtil.toCents(numVal);
      }
    }

    this.recalculateLine(item);
    this.renderCurrentView();
  },

  /** Maneja el retroceso del Numpad Odoo */
  handleNumpadBackspace() {
    if (this.posDraft.items.length === 0) return;
    const item = this.posDraft.items[this.posDraft.selectedLineIndex];
    if (!item) return;

    if (this.posDraft.numpadBuffer && this.posDraft.numpadBuffer.length > 0) {
      this.posDraft.numpadBuffer = this.posDraft.numpadBuffer.slice(0, -1);
      const numVal = parseFloat(this.posDraft.numpadBuffer);
      if (this.posDraft.numpadMode === 'qty') {
        item.cantidad = isNaN(numVal) || numVal < 1 ? 1 : parseInt(numVal);
      } else if (this.posDraft.numpadMode === 'disc') {
        const discPct = isNaN(numVal) ? 0 : Math.min(100, Math.max(0, numVal));
        item.rebajaAutorizadaCents = Math.round((item.tarifaCents * discPct) / 100);
      }
    } else {
      // Si el buffer estaba vacío, elimina la línea seleccionada
      this.posDraft.items.splice(this.posDraft.selectedLineIndex, 1);
      this.posDraft.selectedLineIndex = Math.max(0, this.posDraft.items.length - 1);
    }

    if (item) this.recalculateLine(item);
    this.renderCurrentView();
  },

  /** Modal de Selección Rápida de Ciudadanos Odoo */
  openCitizenModal() {
    this.renderCitizenModalResults('');
    this.openModal('modal-select-citizen');
    setTimeout(() => {
      const input = document.getElementById('citizen-modal-search');
      if (input) {
        input.value = '';
        input.focus();
      }
    }, 150);
  },

  renderCitizenModalResults(query) {
    const list = document.getElementById('citizen-modal-results-list');
    if (!list) return;

    const matches = DataService.buscarCiudadanos(this.state, query);
    if (matches.length === 0) {
      list.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-person-x fs-3 mb-2 d-block"></i>
          No se encontró ningún ciudadano con ese número de identificación o nombre.
        </div>
      `;
      return;
    }

    list.innerHTML = matches.map(c => `
      <div class="d-flex align-items-center justify-content-between p-2 mb-1 rounded border bg-white citizen-modal-item" data-id="${c.id}" style="cursor: pointer; transition: all 0.15s ease;">
        <div class="d-flex align-items-center gap-2">
          <div class="customer-icon" style="width: 32px; height: 32px; font-size: 0.75rem;">
            ${c.nombre.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div class="fw-bold small text-dark">${c.nombre}</div>
            <div class="text-muted" style="font-size: 0.7rem;">${c.tipoIdentificacion}: <span class="font-mono fw-bold">${c.identificacion}</span> • ${c.tipoContribuyente}</div>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-primary py-0 px-2 fw-bold" style="font-size: 0.75rem;">
          Seleccionar
        </button>
      </div>
    `).join('');

    list.querySelectorAll('.citizen-modal-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const c = this.state.ciudadanos.find(ci => ci.id === id);
        if (c) {
          this.posDraft.ciudadano = c;
          this.closeModal('modal-select-citizen');
          
          // Si el ciudadano tiene facturas pendientes, sugerir Modo B
          const pending = DataService.obtenerFacturasPendientes(this.state, c.id);
          if (pending.length > 0) {
            this.posDraft.modo = 'COBRAR_EXISTENTE';
            this.posDraft.facturaExistenteSeleccionada = pending[0];
            this.loadPendingInvoiceIntoDraft(pending[0]);
          }
          this.renderCurrentView();
          this.showToast(`Contribuyente asignado: ${c.nombre}`, 'success');
        }
      });
    });
  },

  /** Carga de escenarios ficticios para demostración instantánea */
  loadDemoScenario(scenarioKey) {
    this.posDraftReset();

    if (scenarioKey === 'TARIFA_0') {
      this.posDraft.ciudadano = this.state.ciudadanos[0]; // María Elena Morales
      this.posDraft.modo = 'NUEVA_FACTURA';
      const c1 = this.state.conceptos.find(c => c.codigo === 'CON-001'); // Certificado No Adeudar
      const c2 = this.state.conceptos.find(c => c.codigo === 'CON-006'); // Rodaje y Movilidad
      if (c1) this.addConceptToDraftItems(c1);
      if (c2) this.addConceptToDraftItems(c2);
      this.showToast('Escenario cargado: Operación completa con tarifa IVA 0%.', 'info');
    } else if (scenarioKey === 'GRAVADA_IVA') {
      this.posDraft.ciudadano = this.state.ciudadanos[1]; // Constructora Andina
      this.posDraft.modo = 'NUEVA_FACTURA';
      const c3 = this.state.conceptos.find(c => c.codigo === 'CON-003'); // Inspección Técnica Ambiental
      if (c3) this.addConceptToDraftItems(c3);
      this.showToast('Escenario cargado: Operación gravada con tarifa IVA 15%.', 'info');
    } else if (scenarioKey === 'TRATAMIENTOS_COMBINADOS') {
      this.posDraft.ciudadano = this.state.ciudadanos[2]; // Carlos Patricio Mendoza
      this.posDraft.modo = 'NUEVA_FACTURA';
      const c1 = this.state.conceptos.find(c => c.codigo === 'CON-001'); // Tarifa 0% ($5)
      const c7 = this.state.conceptos.find(c => c.codigo === 'CON-007'); // Gravado 15% ($80 + $12)
      const c5 = this.state.conceptos.find(c => c.codigo === 'CON-005'); // Exento IVA ($8)
      const c4 = this.state.conceptos.find(c => c.codigo === 'CON-004'); // No Objeto ($12.50)
      if (c1) this.addConceptToDraftItems(c1);
      if (c7) this.addConceptToDraftItems(c7);
      if (c5) this.addConceptToDraftItems(c5);
      if (c4) this.addConceptToDraftItems(c4);
      this.showToast('Escenario cargado: 4 tratamientos tributarios combinados.', 'info');
    } else if (scenarioKey === 'COBRO_ANTERIOR_RETENCION') {
      this.posDraft.ciudadano = this.state.ciudadanos[1]; // Constructora Andina
      this.posDraft.modo = 'COBRAR_EXISTENTE';
      const fac = this.state.facturasPendientes.find(f => f.id === 'FAC-001-001-0000819');
      if (fac) {
        this.posDraft.facturaExistenteSeleccionada = fac;
        this.loadPendingInvoiceIntoDraft(fac);
      }
      this.showToast('Escenario cargado: Factura con cobro previo ($30) y retención en fuente ($13.75).', 'info');
    } else if (scenarioKey === 'EXONERACION_AUTORIZADA') {
      this.posDraft.ciudadano = this.state.ciudadanos[3]; // Luis Chimbo (Tercera Edad)
      this.posDraft.modo = 'NUEVA_FACTURA';
      const c8 = this.state.conceptos.find(c => c.codigo === 'CON-008'); // Tasa 50% Exoneración
      if (c8) this.addConceptToDraftItems(c8);
      this.showToast('Escenario cargado: Concepto con 50% de exoneración legal autorizada.', 'info');
    }

    this.renderCurrentView();
  },

  getPendingInvoicesCount() {
    if (!this.posDraft.ciudadano) return 0;
    return DataService.obtenerFacturasPendientes(this.state, this.posDraft.ciudadano.id).length;
  },

  /** Agrega concepto a la tabla en Modo A */
  addConceptToDraftItems(concepto) {
    const existing = this.posDraft.items.find(i => i.codigo === concepto.codigo);
    if (existing) {
      existing.cantidad++;
      this.recalculateLine(existing);
      this.posDraft.selectedLineIndex = this.posDraft.items.indexOf(existing);
    } else {
      const item = {
        codigo: concepto.codigo,
        nombre: concepto.nombre,
        referenciaObligacion: concepto.referenciaObligacion || `OBL-${Date.now().toString().slice(-4)}`,
        periodo: concepto.periodo || '2026',
        cantidad: 1,
        tarifaCents: concepto.tarifaCents,
        valorBrutoCents: concepto.tarifaCents,
        rebajaAutorizadaCents: concepto.rebajaAutorizadaCents || 0,
        motivoExoneracion: concepto.motivoExoneracion || null,
        baseImponibleCents: Math.max(0, concepto.tarifaCents - (concepto.rebajaAutorizadaCents || 0)),
        tratamientoTributario: concepto.tratamientoTributario || 'IVA_0',
        porcentajeIva: concepto.tratamientoTributario === 'IVA_15' ? 15 : 0,
        impuestoCalculadoCents: 0,
        partidaPresupuestaria: concepto.partidaPresupuestaria || '13.01.08.01 Tasas y Derechos',
        cuentaContable: concepto.cuentaContable || '6.1.3.01 Ingresos por Derechos',
        unidadResponsable: concepto.unidadResponsable || 'Dirección Financiera'
      };
      this.recalculateLine(item);
      this.posDraft.items.push(item);
      this.posDraft.selectedLineIndex = this.posDraft.items.length - 1;
    }
    this.posDraft.numpadBuffer = '';
  },

  /** Carga factura existente al detalle en Modo B */
  loadPendingInvoiceIntoDraft(factura) {
    if (factura.items && Array.isArray(factura.items)) {
      this.posDraft.items = JSON.parse(JSON.stringify(factura.items));
    } else {
      this.posDraft.items = [{
        codigo: factura.conceptoCodigo || 'CON-999',
        nombre: factura.conceptoNombre,
        referenciaObligacion: factura.referenciaObligacion,
        periodo: factura.periodo || '2026',
        cantidad: 1,
        tarifaCents: factura.totalCents,
        valorBrutoCents: factura.totalCents,
        rebajaAutorizadaCents: 0,
        baseImponibleCents: factura.baseIva15Cents || factura.baseIva0Cents || factura.totalCents,
        tratamientoTributario: factura.baseIva15Cents > 0 ? 'IVA_15' : 'IVA_0',
        porcentajeIva: factura.baseIva15Cents > 0 ? 15 : 0,
        impuestoCalculadoCents: factura.iva15Cents || 0,
        totalLineaCents: factura.totalCents,
        partidaPresupuestaria: '13.01.08.04 Servicios Técnicos',
        cuentaContable: '6.1.3.04 Ingresos por Peritajes',
        unidadResponsable: 'Dirección de Control'
      }];
    }
    this.posDraft.cobrosAnterioresCents = factura.cobrosAnterioresCents || 0;
    this.posDraft.anticiposAplicadosCents = factura.anticiposAplicadosCents || 0;
    this.posDraft.retencionesAplicadasCents = factura.retencionesAplicadasCents || 0;
    this.posDraft.selectedLineIndex = 0;
    this.posDraft.numpadBuffer = '';
  },

  /** Recalcula una línea individual en centavos enteros */
  recalculateLine(item) {
    const cantidad = item.cantidad || 1;
    const tarifa = item.tarifaCents || 0;
    const bruto = cantidad * tarifa;
    const rebaja = (item.rebajaAutorizadaCents || 0) * cantidad;
    const base = Math.max(0, bruto - rebaja);

    let lineIva = 0;
    if (item.tratamientoTributario === 'IVA_15') {
      lineIva = Math.round(base * 15 / 100);
    }

    item.valorBrutoCents = bruto;
    item.rebajasCalculadasCents = rebaja;
    item.baseImponibleCents = base;
    item.impuestoCalculadoCents = lineIva;
    item.totalLineaCents = base + lineIva;
  },

  /** Cálculo total del documento financiero */
  calculateTotals() {
    let subtotalBrutoCents = 0;
    let rebajasTotalCents = 0;
    let baseIva0Cents = 0;
    let baseIva15Cents = 0;
    let baseExentoCents = 0;
    let baseNoObjetoCents = 0;
    let iva15Cents = 0;

    this.posDraft.items.forEach(it => {
      this.recalculateLine(it);
      subtotalBrutoCents += it.valorBrutoCents;
      rebajasTotalCents += it.rebajasCalculadasCents;

      if (it.tratamientoTributario === 'IVA_0') baseIva0Cents += it.baseImponibleCents;
      else if (it.tratamientoTributario === 'IVA_15') {
        baseIva15Cents += it.baseImponibleCents;
        iva15Cents += it.impuestoCalculadoCents;
      } else if (it.tratamientoTributario === 'EXENTO') baseExentoCents += it.baseImponibleCents;
      else if (it.tratamientoTributario === 'NO_OBJETO') baseNoObjetoCents += it.baseImponibleCents;
    });

    const subtotalNetoCents = Math.max(0, subtotalBrutoCents - rebajasTotalCents);
    const totalDocumentoCents = subtotalNetoCents + iva15Cents;

    const totalDeduccionesCents = (this.posDraft.cobrosAnterioresCents || 0) +
                                 (this.posDraft.anticiposAplicadosCents || 0) +
                                 (this.posDraft.retencionesAplicadasCents || 0);

    const saldoPendienteCents = Math.max(0, totalDocumentoCents - totalDeduccionesCents);
    
    let valorARecaudarCents = saldoPendienteCents;
    if (this.posDraft.valorARecaudarCustomCents !== null && this.posDraft.valorARecaudarCustomCents < saldoPendienteCents) {
      valorARecaudarCents = this.posDraft.valorARecaudarCustomCents;
    }

    const saldoPosteriorCents = Math.max(0, saldoPendienteCents - valorARecaudarCents);

    return {
      subtotalBrutoCents,
      rebajasTotalCents,
      subtotalNetoCents,
      baseIva0Cents,
      baseIva15Cents,
      baseExentoCents,
      baseNoObjetoCents,
      iva15Cents,
      otrosImpuestosCents: 0,
      totalDocumentoCents,
      cobrosAnterioresCents: this.posDraft.cobrosAnterioresCents || 0,
      anticiposAplicadosCents: this.posDraft.anticiposAplicadosCents || 0,
      retencionesAplicadasCents: this.posDraft.retencionesAplicadasCents || 0,
      totalDeduccionesCents,
      saldoPendienteCents,
      valorARecaudarCents,
      saldoPosteriorCents
    };
  },

  /** Filas del Acordeón Presupuestario y Contable */
  renderBudgetAccordionRows() {
    if (this.posDraft.items.length === 0) {
      return `<tr><td colspan="6" class="text-center text-muted small py-2">No hay conceptos en la liquidación.</td></tr>`;
    }

    return this.posDraft.items.map(it => `
      <tr>
        <td class="fw-bold">${it.nombre}</td>
        <td class="font-mono">${it.partidaPresupuestaria || '13.01.08.01 Tasas Generales'}</td>
        <td class="font-mono">${it.cuentaContable || '6.1.3.01 Ingresos Administrativos'}</td>
        <td>${it.unidadResponsable || 'Dirección Financiera'}</td>
        <td class="text-center"><span class="badge bg-success">En Espera Cobro</span></td>
        <td class="text-center"><span class="badge bg-primary">Devengado</span></td>
      </tr>
    `).join('');
  },

  handleActionNuevo() {
    this.posDraftReset();
    this.renderCurrentView();
    this.showToast('Nueva orden Odoo iniciada.', 'info');
  },

  posDraftReset() {
    this.posDraft.ciudadano = null;
    this.posDraft.modo = 'NUEVA_FACTURA';
    this.posDraft.facturaExistenteSeleccionada = null;
    this.posDraft.items = [];
    this.posDraft.selectedLineIndex = 0;
    this.posDraft.numpadBuffer = '';
    this.posDraft.cobrosAnterioresCents = 0;
    this.posDraft.anticiposAplicadosCents = 0;
    this.posDraft.retencionesAplicadasCents = 0;
    this.posDraft.valorARecaudarCustomCents = null;
    this.posDraft.efectivoRecibidoInput = '';
    this.posDraft.referenciaPago = '';
    this.posDraft.transferenciaVerificada = true;
    this.posDraft.tarjetaConfirmada = true;
    this.posDraft.isProcessing = false;
    this.posDraft.proformaOrigenId = null;
  },

  handleActionGuardarBorrador() {
    if (!this.posDraft.ciudadano && this.posDraft.items.length === 0) {
      this.showToast('No hay datos en la orden para poner en espera.', 'warning');
      return;
    }

    const totals = this.calculateTotals();
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const draftId = `BOR-${Date.now().toString(36).toUpperCase()}`;

    const draft = {
      id: draftId,
      fecha: dateStr,
      ciudadano: this.posDraft.ciudadano,
      items: JSON.parse(JSON.stringify(this.posDraft.items)),
      modo: this.posDraft.modo,
      facturaExistenteSeleccionada: this.posDraft.facturaExistenteSeleccionada,
      cobrosAnterioresCents: this.posDraft.cobrosAnterioresCents,
      retencionesAplicadasCents: this.posDraft.retencionesAplicadasCents,
      totalCents: totals.valorARecaudarCents
    };

    if (!this.state.borradores) this.state.borradores = [];
    this.state.borradores.unshift(draft);
    DataService.saveState(this.state);

    this.showToast(`Orden guardada en espera: ${draftId}`, 'success');
    this.posDraftReset();
    this.renderCurrentView();
  },

  handleActionVerBorradores() {
    const list = document.getElementById('drafts-list-body');
    if (!list) return;

    const borradores = this.state.borradores || [];
    if (borradores.length === 0) {
      list.innerHTML = `
        <div class="text-center py-4 text-muted small">
          <i class="bi bi-inbox fs-3 mb-2 d-block"></i>
          No hay órdenes o borradores en espera guardados.
        </div>
      `;
    } else {
      list.innerHTML = borradores.map((d, index) => `
        <div class="card p-3 mb-2 border shadow-sm">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <span class="badge bg-secondary font-mono">${d.id}</span>
              <h6 class="fw-bold mb-0 mt-1">${d.ciudadano ? d.ciudadano.nombre : 'Sin contribuyente asignado'}</h6>
              <small class="text-muted">${d.fecha} • ${d.items.length} concepto(s)</small>
            </div>
            <div class="text-end">
              <span class="fw-bold fs-5 font-mono text-success">${MoneyUtil.format(d.totalCents)}</span>
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2 pt-2 border-top">
            <button class="btn btn-sm btn-outline-danger btn-eliminar-borrador" data-idx="${index}">
              <i class="bi bi-trash"></i> Descartar
            </button>
            <button class="btn btn-sm btn-primary btn-cargar-borrador" data-idx="${index}" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
              <i class="bi bi-arrow-clockwise"></i> Recuperar al POS
            </button>
          </div>
        </div>
      `).join('');

      list.querySelectorAll('.btn-cargar-borrador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          const d = this.state.borradores[idx];
          if (d) {
            this.posDraft.ciudadano = d.ciudadano;
            this.posDraft.modo = d.modo || 'NUEVA_FACTURA';
            this.posDraft.facturaExistenteSeleccionada = d.facturaExistenteSeleccionada;
            this.posDraft.items = d.items;
            this.posDraft.cobrosAnterioresCents = d.cobrosAnterioresCents || 0;
            this.posDraft.retencionesAplicadasCents = d.retencionesAplicadasCents || 0;
            this.posDraft.selectedLineIndex = 0;
            this.state.borradores.splice(idx, 1);
            DataService.saveState(this.state);
            this.closeModal('modal-drafts');
            this.renderCurrentView();
            this.showToast(`Borrador ${d.id} cargado con éxito.`, 'success');
          }
        });
      });

      list.querySelectorAll('.btn-eliminar-borrador').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'));
          this.state.borradores.splice(idx, 1);
          DataService.saveState(this.state);
          this.handleActionVerBorradores();
          this.showToast('Borrador descartado.', 'info');
        });
      });
    }

    this.openModal('modal-drafts');
  },

  // ===========================================================================
  // 4. CONFIRMACIÓN Y PAGO FINAL ODOO (PAYMENT FLOW)
  // ===========================================================================

  handleOpenConfirmCheckout() {
    if (!this.posDraft.ciudadano) {
      this.showToast('Asigne primero un contribuyente para liquidar la orden.', 'warning');
      this.openCitizenModal();
      return;
    }

    if (this.posDraft.items.length === 0) {
      this.showToast('La orden está vacía. Agregue conceptos antes de cobrar.', 'error');
      return;
    }

    const totals = this.calculateTotals();
    const modalBody = document.getElementById('modal-confirm-body');
    const actionLabel = document.getElementById('btn-confirm-action-label');
    if (!modalBody) return;

    const isNueva = this.posDraft.modo === 'NUEVA_FACTURA';
    actionLabel.textContent = isNueva ? 'Validar, Facturar y Cobrar' : 'Validar y Asentar Cobro';

    // Si el efectivo recibido estaba vacío, pre-llenar con el monto exacto
    if (!this.posDraft.efectivoRecibidoInput || this.posDraft.efectivoRecibidoInput === '') {
      this.posDraft.efectivoRecibidoInput = MoneyUtil.fromCents(totals.valorARecaudarCents).toFixed(2);
    }

    modalBody.innerHTML = `
      <div class="pay-tender-header mb-3">
        <div>
          <span class="tender-total-label">Total a Recaudar</span>
          <div class="small opacity-75">Moneda de curso legal: USD ($)</div>
        </div>
        <div class="tender-total-val" id="pay-modal-total-tender">
          ${MoneyUtil.format(totals.valorARecaudarCents)}
        </div>
      </div>

      <!-- Selector de Medios de Pago Odoo Pills -->
      <label class="form-label fw-bold text-muted small mb-1">Medio de Recaudación Oficial:</label>
      <div class="odoo-pay-methods-pills">
        <div class="btn-pay-method-pill ${this.posDraft.metodoPago === 'EFECTIVO' ? 'active' : ''}" data-pay-target="EFECTIVO">
          <i class="bi bi-cash-stack fs-4"></i>
          <span>Efectivo Físico</span>
        </div>
        <div class="btn-pay-method-pill ${this.posDraft.metodoPago === 'TRANSFERENCIA' ? 'active' : ''}" data-pay-target="TRANSFERENCIA">
          <i class="bi bi-bank fs-4"></i>
          <span>Transferencia BCE</span>
        </div>
        <div class="btn-pay-method-pill ${this.posDraft.metodoPago === 'TARJETA' ? 'active' : ''}" data-pay-target="TARJETA">
          <i class="bi bi-credit-card-2-front fs-4"></i>
          <span>Tarjeta / POS</span>
        </div>
      </div>

      <!-- Campos Dinámicos según Método -->
      <div id="odoo-pay-method-body" class="p-3 border rounded bg-white">
        ${this.renderPayMethodSpecificInputsOdoo(totals)}
      </div>

      <div class="mt-3 p-2 rounded bg-light border text-muted" style="font-size: 0.72rem;">
        <strong>Contribuyente:</strong> ${this.posDraft.ciudadano.nombre} (${this.posDraft.ciudadano.tipoIdentificacion}: ${this.posDraft.ciudadano.identificacion})<br>
        <strong>Conceptos:</strong> ${this.posDraft.items.map(i => `${i.nombre} (x${i.cantidad})`).join(' • ')}
      </div>
    `;

    // Bindings de cambio de método de pago en el modal
    modalBody.querySelectorAll('[data-pay-target]').forEach(pill => {
      pill.addEventListener('click', () => {
        const target = pill.getAttribute('data-pay-target');
        this.posDraft.metodoPago = target;
        this.handleOpenConfirmCheckout();
      });
    });

    // Bindings de efectivo y botones rápidos
    const cashInput = modalBody.querySelector('#modal-cash-received-input');
    if (cashInput) {
      cashInput.addEventListener('input', (e) => {
        this.posDraft.efectivoRecibidoInput = e.target.value;
        this.updateModalChangeDue(totals);
      });
    }

    modalBody.querySelectorAll('.btn-quick-cash').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-cash-val');
        if (val === 'EXACT') {
          this.posDraft.efectivoRecibidoInput = MoneyUtil.fromCents(totals.valorARecaudarCents).toFixed(2);
        } else {
          this.posDraft.efectivoRecibidoInput = parseFloat(val).toFixed(2);
        }
        if (cashInput) cashInput.value = this.posDraft.efectivoRecibidoInput;
        this.updateModalChangeDue(totals);
      });
    });

    // Inputs de transferencia y tarjeta
    const refInput = modalBody.querySelector('#modal-pay-ref-input');
    if (refInput) {
      refInput.addEventListener('input', (e) => {
        this.posDraft.referenciaPago = e.target.value;
      });
    }

    this.openModal('modal-confirm-checkout');
  },

  renderPayMethodSpecificInputsOdoo(totals) {
    const metodo = this.posDraft.metodoPago;

    if (metodo === 'EFECTIVO') {
      const cashCents = MoneyUtil.toCents(this.posDraft.efectivoRecibidoInput);
      const cambioCents = Math.max(0, cashCents - totals.valorARecaudarCents);

      return `
        <div>
          <label class="form-label fw-bold text-dark small mb-1">Monto en Efectivo Recibido (USD):</label>
          <div class="input-group">
            <span class="input-group-text fw-bold">$</span>
            <input type="number" id="modal-cash-received-input" step="0.01" min="0" value="${this.posDraft.efectivoRecibidoInput || ''}" class="form-control font-mono fw-bold fs-5 text-dark" placeholder="0.00" autofocus>
          </div>

          <div class="cash-quick-denoms">
            <button type="button" class="btn-quick-cash" data-cash-val="EXACT">Monto Exacto</button>
            <button type="button" class="btn-quick-cash" data-cash-val="5">$5.00</button>
            <button type="button" class="btn-quick-cash" data-cash-val="10">$10.00</button>
            <button type="button" class="btn-quick-cash" data-cash-val="20">$20.00</button>
            <button type="button" class="btn-quick-cash" data-cash-val="50">$50.00</button>
            <button type="button" class="btn-quick-cash" data-cash-val="100">$100.00</button>
          </div>

          <div class="change-due-box">
            <span class="change-due-lbl">Cambio / Vuelto a Entregar:</span>
            <span class="change-due-val" id="modal-change-due-val">${MoneyUtil.format(cambioCents)}</span>
          </div>
        </div>
      `;
    } else if (metodo === 'TRANSFERENCIA') {
      return `
        <div>
          <div class="mb-2">
            <label class="form-label fw-bold text-muted small">Cuenta Institucional Destino:</label>
            <input type="text" value="${this.posDraft.cuentaInstitucionalDestino}" readonly class="form-control form-control-sm bg-light font-mono">
          </div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold text-muted small">Banco Emisor:</label>
              <select class="form-select form-select-sm" id="modal-transfer-bank">
                <option value="Banco Pichincha" selected>Banco Pichincha</option>
                <option value="Banco del Pacífico">Banco del Pacífico</option>
                <option value="Banco Guayaquil">Banco Guayaquil</option>
                <option value="Produbanco">Produbanco</option>
                <option value="BanEcuador B.P.">BanEcuador B.P.</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-bold text-dark small">N° Referencia / Comprobante *</label>
              <input type="text" id="modal-pay-ref-input" value="${this.posDraft.referenciaPago || ''}" class="form-control form-control-sm font-mono fw-bold" placeholder="TR-9041285" required>
            </div>
          </div>
          <div class="form-check form-switch mt-2">
            <input class="form-check-input" type="checkbox" id="chk-bce-verif" ${this.posDraft.transferenciaVerificada ? 'checked' : ''}>
            <label class="form-check-label small" for="chk-bce-verif">Transferencia verificada en línea en Sistema SPI-BCE</label>
          </div>
        </div>
      `;
    } else {
      return `
        <div>
          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="form-label fw-bold text-muted small">Tipo de Tarjeta:</label>
              <select class="form-select form-select-sm">
                <option value="Visa Débito" selected>Visa Débito</option>
                <option value="Mastercard Débito">Mastercard Débito</option>
                <option value="Visa Crédito">Visa Crédito</option>
                <option value="Mastercard Crédito">Mastercard Crédito</option>
              </select>
            </div>
            <div class="col-6">
              <label class="form-label fw-bold text-dark small">N° Lote / Voucher *</label>
              <input type="text" id="modal-pay-ref-input" value="${this.posDraft.referenciaPago || ''}" class="form-control form-control-sm font-mono fw-bold" placeholder="VOU-00842" required>
            </div>
          </div>
          <div class="form-check form-switch mt-2">
            <input class="form-check-input" type="checkbox" id="chk-tarjeta-conf" ${this.posDraft.tarjetaConfirmada ? 'checked' : ''}>
            <label class="form-check-label small" for="chk-tarjeta-conf">Transacción aprobada por procesador (Datafast / Medianet)</label>
          </div>
        </div>
      `;
    }
  },

  updateModalChangeDue(totals) {
    const cashCents = MoneyUtil.toCents(this.posDraft.efectivoRecibidoInput);
    const cambioCents = Math.max(0, cashCents - totals.valorARecaudarCents);
    const el = document.getElementById('modal-change-due-val');
    if (el) el.textContent = MoneyUtil.format(cambioCents);
  },

  executeFinalCheckout() {
    if (this.posDraft.isProcessing) return;
    this.posDraft.isProcessing = true;

    const totals = this.calculateTotals();
    const metodo = this.posDraft.metodoPago;

    // Validación de efectivo
    if (metodo === 'EFECTIVO') {
      const cashCents = MoneyUtil.toCents(this.posDraft.efectivoRecibidoInput);
      if (cashCents < totals.valorARecaudarCents) {
        this.showToast(`El efectivo recibido (${MoneyUtil.format(cashCents)}) es menor al valor a recaudar.`, 'error');
        this.posDraft.isProcessing = false;
        return;
      }
    } else {
      if (!this.posDraft.referenciaPago || this.posDraft.referenciaPago.trim() === '') {
        this.showToast('Debe ingresar el número de referencia, comprobante o voucher bancario.', 'warning');
        this.posDraft.isProcessing = false;
        return;
      }
    }

    const btn = document.getElementById('btn-confirm-final-action');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Procesando...`;
    }

    setTimeout(() => {
      try {
        const now = new Date();
        const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
        const caja = this.state.cajas[0];
        const nextNum = 822 + this.state.cobros.length;
        const recId = `REC-2026-${String(nextNum).padStart(5, '0')}`;

        let facturaId = '';
        const isNueva = this.posDraft.modo === 'NUEVA_FACTURA';

        if (isNueva) {
          facturaId = `FAC-${caja.puntoEmision}-${String(nextNum).padStart(7, '0')}`;
          this.state.facturas.unshift({
            id: facturaId,
            ciudadanoId: this.posDraft.ciudadano.id,
            fecha: dateStr,
            items: JSON.parse(JSON.stringify(this.posDraft.items)),
            subtotalBrutoCents: totals.subtotalBrutoCents,
            rebajasTotalCents: totals.rebajasTotalCents,
            subtotalNetoCents: totals.subtotalNetoCents,
            baseIva0Cents: totals.baseIva0Cents,
            baseIva15Cents: totals.baseIva15Cents,
            baseExentoCents: totals.baseExentoCents,
            baseNoObjetoCents: totals.baseNoObjetoCents,
            iva15Cents: totals.iva15Cents,
            totalDocumentoCents: totals.totalDocumentoCents,
            cajaId: caja.id,
            cobroId: recId
          });
        } else {
          const fExistente = this.posDraft.facturaExistenteSeleccionada;
          facturaId = fExistente.id;
          fExistente.cobrosAnterioresCents = (fExistente.cobrosAnterioresCents || 0) + totals.valorARecaudarCents;
          fExistente.saldoPendienteCents = totals.saldoPosteriorCents;
          if (totals.saldoPosteriorCents === 0) {
            fExistente.estado = 'COBRADO';
            fExistente.cobroId = recId;
          } else {
            fExistente.estado = 'PAGO_PARCIAL';
          }
        }

        const cashCents = MoneyUtil.toCents(this.posDraft.efectivoRecibidoInput);
        const cambioCents = metodo === 'EFECTIVO' ? Math.max(0, cashCents - totals.valorARecaudarCents) : 0;

        const cobro = {
          id: recId,
          facturaId: facturaId,
          fecha: dateStr,
          ciudadanoId: this.posDraft.ciudadano.id,
          ciudadanoNombre: this.posDraft.ciudadano.nombre,
          ciudadanoIdentificacion: this.posDraft.ciudadano.identificacion,
          metodoPago: metodo,
          efectivoRecibidoCents: cashCents,
          cambioEntregadoCents: cambioCents,
          referenciaPago: this.posDraft.referenciaPago || null,
          bancoEntidad: metodo === 'TRANSFERENCIA' ? this.posDraft.bancoSeleccionado : (metodo === 'TARJETA' ? 'Datafast' : null),
          transferenciaVerificada: this.posDraft.transferenciaVerificada,
          tarjetaConfirmada: this.posDraft.tarjetaConfirmada,
          subtotal0Cents: totals.baseIva0Cents + totals.baseExentoCents + totals.baseNoObjetoCents,
          subtotalIvaCents: totals.baseIva15Cents,
          ivaCents: totals.iva15Cents,
          totalCents: totals.valorARecaudarCents,
          cajaId: caja.id,
          cajeroNombre: caja.cajeroAsignado,
          cierreId: null,
          estadoCobro: 'COBRADO',
          estadoDeposito: metodo === 'EFECTIVO' ? 'PENDIENTE' : 'CONCILIADO',
          estadoContable: 'ASENTADO',
          items: JSON.parse(JSON.stringify(this.posDraft.items))
        };

        this.state.cobros.unshift(cobro);

        // Si la venta provino de una Proforma / Cotización, marcarla como Facturada
        if (this.posDraft.proformaOrigenId) {
          const prof = (this.state.proformas || []).find(p => p.id === this.posDraft.proformaOrigenId);
          if (prof) {
            prof.estado = 'FACTURADA';
            prof.facturaGeneradaId = facturaId;
            prof.cobroGeneradoId = recId;
          }
        }

        DataService.saveState(this.state);

        // Sincronización transparente con Odoo 19 Backend (si está activo)
        if (typeof OdooBackendService !== 'undefined') {
          OdooBackendService.syncOrder(cobro).then(res => {
            if (res && res.success && !res.simulated) {
              console.log('✓ Orden sincronizada con Odoo 19 Backend:', res);
            }
          }).catch(e => console.warn('Sync Odoo backend:', e));
        }

        this.closeModal('modal-confirm-checkout');
        this.renderTicketModal(cobro);
        this.openModal('modal-ticket');
        this.showToast(`Cobro registrado con éxito: ${recId}`, 'success');

        this.posDraftReset();
        this.renderCurrentView();
      } catch (err) {
        console.error('Error durante liquidación:', err);
        this.showToast('Ocurrió un error al registrar el cobro.', 'error');
        this.posDraft.isProcessing = false;
        if (btn) btn.disabled = false;
      }
    }, 350);
  },

  /** Renderiza el comprobante impreso oficial tipo ticket */
  renderTicketModal(cobro) {
    const paper = document.getElementById('official-ticket-paper');
    if (!paper) return;

    let formaPagoTexto = cobro.metodoPago;
    if (cobro.metodoPago === 'TRANSFERENCIA') {
      formaPagoTexto = `Transferencia (${cobro.bancoEntidad || 'BCE'}) Ref: ${cobro.referenciaPago}`;
    } else if (cobro.metodoPago === 'TARJETA') {
      formaPagoTexto = `Tarjeta / Voucher: ${cobro.referenciaPago}`;
    }

    paper.innerHTML = `
      <div class="ticket-header-block">
        <div class="ticket-entity-title">GOBIERNO AUTÓNOMO DESCENTRALIZADO</div>
        <div class="ticket-sub-entity">DIRECCIÓN FINANCIERA • VENTANILLA DE RECAUDACIÓN</div>
        <span class="ticket-doc-type">COMPROBANTE OFICIAL DE RECAUDACIÓN</span>
        <div class="font-mono small mt-1 fw-bold">${cobro.id}</div>
        <div class="text-danger fw-bold small" style="font-size: 0.65rem;">DEMOSTRACIÓN — SIN VALIDEZ TRIBUTARIA (SRI)</div>
      </div>

      <div class="mb-2">
        <div class="ticket-line-row"><span>Fecha/Hora:</span><span class="font-mono">${cobro.fecha}</span></div>
        <div class="ticket-line-row"><span>Caja:</span><span>Caja 01 (001-001)</span></div>
        <div class="ticket-line-row"><span>Cajero:</span><span>${cobro.cajeroNombre}</span></div>
        <div class="ticket-line-row"><span>N° Factura:</span><span class="font-mono fw-bold">${cobro.facturaId}</span></div>
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="mb-2">
        <div class="fw-bold">CONTRIBUYENTE:</div>
        <div>${cobro.ciudadanoNombre}</div>
        <div>Identificación: <span class="font-mono fw-bold">${cobro.ciudadanoIdentificacion}</span></div>
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="mb-2">
        <div class="fw-bold mb-1">DETALLE DE CONCEPTOS:</div>
        ${(cobro.items || []).map(it => `
          <div class="mb-1">
            <div class="fw-bold">${it.nombre}</div>
            <div class="ticket-line-row text-muted" style="font-size: 0.7rem;">
              <span>${it.cantidad} x ${MoneyUtil.format(it.tarifaCents)}</span>
              <span class="font-mono text-dark fw-bold">${MoneyUtil.format(it.totalLineaCents)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="mb-2">
        <div class="ticket-line-row"><span>Subtotal Tarifa 0%:</span><span class="font-mono">${MoneyUtil.format(cobro.subtotal0Cents)}</span></div>
        <div class="ticket-line-row"><span>Subtotal IVA 15%:</span><span class="font-mono">${MoneyUtil.format(cobro.subtotalIvaCents)}</span></div>
        <div class="ticket-line-row"><span>IVA 15%:</span><span class="font-mono">${MoneyUtil.format(cobro.ivaCents)}</span></div>
        <div class="ticket-divider-double"></div>
        <div class="ticket-total-large">
          <span>TOTAL PAGADO:</span>
          <span class="font-mono text-dark">${MoneyUtil.format(cobro.totalCents)}</span>
        </div>
        <div class="ticket-divider-double"></div>
      </div>

      <div class="mb-2">
        <div class="fw-bold">FORMA DE PAGO:</div>
        <div>${formaPagoTexto}</div>
        ${cobro.metodoPago === 'EFECTIVO' ? `
          <div class="ticket-line-row text-muted">
            <span>Efectivo Recibido:</span>
            <span class="font-mono">${MoneyUtil.format(cobro.efectivoRecibidoCents)}</span>
          </div>
          <div class="ticket-line-row fw-bold">
            <span>Cambio Entregado:</span>
            <span class="font-mono">${MoneyUtil.format(cobro.cambioEntregadoCents)}</span>
          </div>
        ` : ''}
      </div>

      <div class="ticket-barcode-sim font-mono">
        *${cobro.id}*
      </div>
      <div class="text-center text-muted" style="font-size: 0.65rem;">
        Firma Autorizada • Recaudación Ventanilla Odoo POS
      </div>
    `;
  },

  // ===========================================================================
  // 4.1 FLUJO DE PROFORMAS Y COTIZACIONES PREVIAS (COTIZACIÓN -> FACTURA)
  // ===========================================================================

  /** Genera una proforma a partir del carrito y contribuyente actual */
  handleEmitirProforma() {
    if (!this.posDraft.ciudadano) {
      this.showToast('Seleccione primero al contribuyente para emitir la proforma.', 'warning');
      this.openCitizenModal();
      return;
    }

    if (!this.posDraft.items || this.posDraft.items.length === 0) {
      this.showToast('Agregue al menos un concepto o trámite al carrito para cotizar.', 'warning');
      return;
    }

    const totals = this.calculateTotals();
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 15);
    const expDateStr = expDate.toISOString().split('T')[0];
    
    const count = (this.state.proformas || []).length + 1;
    const profId = `PROF-2026-${String(count + 12).padStart(5, '0')}`;

    const nuevaProforma = {
      id: profId,
      fechaEmision: dateStr,
      fechaVencimiento: expDateStr,
      ciudadanoId: this.posDraft.ciudadano.id,
      ciudadanoNombre: this.posDraft.ciudadano.nombre,
      ciudadanoIdentificacion: this.posDraft.ciudadano.identificacion,
      ciudadanoCorreo: this.posDraft.ciudadano.correo || '',
      ciudadanoDireccion: this.posDraft.ciudadano.direccion || '',
      items: JSON.parse(JSON.stringify(this.posDraft.items)),
      subtotalBrutoCents: totals.subtotalBrutoCents,
      rebajasTotalCents: totals.rebajasTotalCents,
      subtotalNetoCents: totals.subtotalNetoCents,
      baseIva0Cents: totals.baseIva0Cents,
      baseIva15Cents: totals.baseIva15Cents,
      baseExentoCents: totals.baseExentoCents,
      baseNoObjetoCents: totals.baseNoObjetoCents,
      iva15Cents: totals.iva15Cents,
      totalCents: totals.totalDocumentoCents,
      estado: 'VIGENTE',
      facturaGeneradaId: null,
      cobroGeneradoId: null,
      observacion: 'Cotización institucional emitida en ventanilla POS. Tarifas y partidas vigentes por 15 días calendario.'
    };

    if (!this.state.proformas) this.state.proformas = [];
    this.state.proformas.unshift(nuevaProforma);
    DataService.saveState(this.state);

    // Sincronización transparente con Odoo 19 Backend (si está activo)
    if (typeof OdooBackendService !== 'undefined') {
      OdooBackendService.syncProforma(nuevaProforma).then(res => {
        if (res && res.success && !res.simulated) {
          console.log('✓ Proforma sincronizada con Odoo 19 Backend:', res);
        }
      }).catch(e => console.warn('Sync Odoo proforma:', e));
    }

    this.renderProformaModal(nuevaProforma);
    this.openModal('modal-proforma-ticket');
    this.showToast(`Proforma oficial ${profId} generada con éxito.`, 'success');
  },

  /** Renderiza la hoja de proforma / cotización imprimible */
  renderProformaModal(proforma) {
    const paper = document.getElementById('proforma-ticket-paper');
    if (!paper) return;

    const btnConvertir = document.getElementById('btn-proforma-convertir-directo');
    if (btnConvertir) {
      btnConvertir.setAttribute('data-proforma-id', proforma.id);
      if (proforma.estado === 'FACTURADA') {
        btnConvertir.disabled = true;
        btnConvertir.innerHTML = `<i class="bi bi-check-circle-fill"></i> Ya Facturada (${proforma.facturaGeneradaId || 'FAC'})`;
        btnConvertir.className = 'btn btn-sm btn-secondary fw-bold';
      } else {
        btnConvertir.disabled = false;
        btnConvertir.innerHTML = `<i class="bi bi-arrow-right-circle"></i> Facturar y Cobrar`;
        btnConvertir.className = 'btn btn-sm text-white fw-bold';
        btnConvertir.style.background = 'var(--odoo-secondary)';
      }
    }

    paper.innerHTML = `
      <div class="ticket-header-box">
        <div class="ticket-rep-title">REPÚBLICA DEL ECUADOR</div>
        <div class="ticket-entity-title">GOBIERNO AUTÓNOMO DESCENTRALIZADO INSTITUCIONAL</div>
        <div class="ticket-entity-sub">DIRECCIÓN FINANCIERA • VENTANILLA DE RECAUDACIONES</div>
        <div class="ticket-ruc-sim">RUC: 1760001230001 • MATRIZ QUITO</div>
      </div>

      <div class="ticket-divider-double"></div>

      <div class="text-center my-2 p-1 bg-white border border-info rounded">
        <div class="fw-bold text-primary" style="font-size: 0.95rem; letter-spacing: 0.5px;">PROFORMA / COTIZACIÓN PREVIA</div>
        <div class="font-mono fw-bold text-dark fs-6">${proforma.id}</div>
        <div class="badge bg-danger text-white py-1 px-2 mt-1" style="font-size: 0.65rem;">
          DOCUMENTO INFORMATIVO — NO VÁLIDO PARA PAGO FISCAL
        </div>
      </div>

      <div class="ticket-meta-block">
        <div class="ticket-line-row">
          <span>Fecha de Emisión:</span>
          <span class="font-mono">${proforma.fechaEmision}</span>
        </div>
        <div class="ticket-line-row fw-bold text-primary">
          <span>Válida Hasta:</span>
          <span class="font-mono">${proforma.fechaVencimiento} (15 días)</span>
        </div>
        <div class="ticket-line-row">
          <span>Estado de Cotización:</span>
          <span class="badge ${proforma.estado === 'VIGENTE' ? 'bg-info text-dark' : 'bg-success text-white'}">${proforma.estado}</span>
        </div>
        ${proforma.facturaGeneradaId ? `
          <div class="ticket-line-row text-success fw-bold">
            <span>Factura Asociada:</span>
            <span class="font-mono">${proforma.facturaGeneradaId}</span>
          </div>
        ` : ''}
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="ticket-citizen-block">
        <div class="ticket-line-row">
          <span>Contribuyente:</span>
          <span class="fw-bold">${proforma.ciudadanoNombre}</span>
        </div>
        <div class="ticket-line-row">
          <span>Cédula / RUC:</span>
          <span class="font-mono fw-bold">${proforma.ciudadanoIdentificacion}</span>
        </div>
        ${proforma.ciudadanoCorreo ? `
          <div class="ticket-line-row">
            <span>Correo:</span>
            <span>${proforma.ciudadanoCorreo}</span>
          </div>
        ` : ''}
        ${proforma.ciudadanoDireccion ? `
          <div class="ticket-line-row">
            <span>Dirección:</span>
            <span>${proforma.ciudadanoDireccion}</span>
          </div>
        ` : ''}
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="mb-2">
        <div class="fw-bold mb-1" style="font-size: 0.72rem;">DETALLE DE CONCEPTOS Y TRÁMITES COTIZADOS:</div>
        ${(proforma.items || []).map(it => `
          <div class="mb-2 pb-1 border-bottom border-light">
            <div class="fw-bold">${it.nombre}</div>
            <div class="ticket-line-row text-muted" style="font-size: 0.68rem;">
              <span>Régimen: <strong class="text-dark">${it.tratamientoTributario}</strong> • Cant: ${it.cantidad} x ${MoneyUtil.format(it.tarifaCents)}</span>
              <span class="font-mono text-dark fw-bold">${MoneyUtil.format(it.totalLineaCents)}</span>
            </div>
            ${it.rebajaAutorizadaCents > 0 ? `
              <div class="text-success small" style="font-size: 0.65rem;">
                ↳ Exoneración / Rebaja: -${MoneyUtil.format(it.rebajaAutorizadaCents)}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <div class="ticket-divider-dash"></div>

      <div class="mb-2">
        <div class="ticket-line-row"><span>Subtotal Bruto:</span><span class="font-mono">${MoneyUtil.format(proforma.subtotalBrutoCents)}</span></div>
        ${proforma.rebajasTotalCents > 0 ? `
          <div class="ticket-line-row text-success"><span>Rebajas / Exoneraciones:</span><span class="font-mono">-${MoneyUtil.format(proforma.rebajasTotalCents)}</span></div>
        ` : ''}
        <div class="ticket-line-row"><span>Base Imponible IVA 0%:</span><span class="font-mono">${MoneyUtil.format(proforma.baseIva0Cents)}</span></div>
        <div class="ticket-line-row"><span>Base Imponible IVA 15%:</span><span class="font-mono">${MoneyUtil.format(proforma.baseIva15Cents)}</span></div>
        ${proforma.baseExentoCents > 0 ? `
          <div class="ticket-line-row"><span>Base Exenta de IVA:</span><span class="font-mono">${MoneyUtil.format(proforma.baseExentoCents)}</span></div>
        ` : ''}
        ${proforma.baseNoObjetoCents > 0 ? `
          <div class="ticket-line-row"><span>No Objeto de IVA:</span><span class="font-mono">${MoneyUtil.format(proforma.baseNoObjetoCents)}</span></div>
        ` : ''}
        <div class="ticket-line-row"><span>IVA 15% Calculado:</span><span class="font-mono">${MoneyUtil.format(proforma.iva15Cents)}</span></div>
        
        <div class="ticket-divider-double"></div>
        <div class="ticket-total-large">
          <span>VALOR TOTAL COTIZADO:</span>
          <span class="font-mono text-primary">${MoneyUtil.format(proforma.totalCents)}</span>
        </div>
        <div class="ticket-divider-double"></div>
      </div>

      <div class="p-2 rounded bg-light border small text-muted mb-2" style="font-size: 0.68rem; line-height: 1.3;">
        <div><strong>Partidas Presupuestarias y Cuentas:</strong></div>
        ${(proforma.items || []).map(it => `
          <div>• ${it.codigo}: Partida <code>${it.partidaPresupuestaria?.split(' ')[0] || '13.01.08'}</code> | Cta. <code>${it.cuentaContable?.split(' ')[0] || '6.1.3'}</code></div>
        `).join('')}
      </div>

      <div class="ticket-barcode-sim font-mono">
        *${proforma.id}*
      </div>
      <div class="text-center text-muted" style="font-size: 0.65rem;">
        Para facturar y pagar esta cotización, indique este código en ventanilla o ingrese su identificación.
      </div>
    `;
  },

  /** Carga los datos de una proforma existente en el carrito del POS para facturar */
  handleConvertirProformaAFactura(proformaId) {
    const proforma = (this.state.proformas || []).find(p => p.id === proformaId);
    if (!proforma) {
      this.showToast('Proforma no encontrada.', 'error');
      return;
    }

    if (proforma.estado === 'FACTURADA') {
      this.showToast(`Esta proforma ya fue facturada bajo el comprobante ${proforma.facturaGeneradaId || 'existente'}.`, 'warning');
      return;
    }

    // Limpiar carrito e inyectar proforma
    this.posDraftReset();

    const ciudadano = this.state.ciudadanos.find(c => c.id === proforma.ciudadanoId) || {
      id: proforma.ciudadanoId,
      nombre: proforma.ciudadanoNombre,
      identificacion: proforma.ciudadanoIdentificacion,
      correo: proforma.ciudadanoCorreo,
      direccion: proforma.ciudadanoDireccion,
      tipoIdentificacion: proforma.ciudadanoIdentificacion.length === 13 ? 'RUC' : 'Cédula',
      tipoContribuyente: 'Persona Natural'
    };

    this.posDraft.ciudadano = ciudadano;
    this.posDraft.modo = 'NUEVA_FACTURA';
    this.posDraft.items = JSON.parse(JSON.stringify(proforma.items));
    this.posDraft.proformaOrigenId = proforma.id;
    this.posDraft.selectedLineIndex = 0;

    // Cambiar a la vista del Punto de Venta
    this.currentView = 'pos';
    this.updateHeaderDisplay();
    this.renderSidebarNavigation();
    this.renderCurrentView();

    this.showToast(`Proforma ${proforma.id} cargada exitosamente. Haga clic en 'Cobrar (F4)' para emitir la factura.`, 'success');
  },

  /** Renderiza la vista de listado y gestión de Proformas / Cotizaciones */
  renderViewProformas(container) {
    const proformas = this.state.proformas || [];
    const totalCount = proformas.length;
    const vigentesCount = proformas.filter(p => p.estado === 'VIGENTE').length;
    const facturadasCount = proformas.filter(p => p.estado === 'FACTURADA').length;

    container.innerHTML = `
      <div class="odoo-view-container">
        <!-- Control Panel Odoo -->
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-file-earmark-spreadsheet text-info fs-5"></i>
            <div>
              <span class="fw-bold">Proformas y Cotizaciones de Ventanilla</span>
              <div class="text-muted" style="font-size: 0.72rem;">Emisión de presupuestos previos y conversión directa a facturas de cobro</div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-primary fw-bold" id="btn-nueva-proforma-pos" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
              <i class="bi bi-plus-circle"></i> Cotizar Nueva en POS
            </button>
          </div>
        </div>

        <!-- Tarjetas Resumen Odoo -->
        <div class="odoo-stat-cards mb-3">
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <span class="stat-lbl">Total Cotizaciones</span>
              <span class="stat-val text-dark">${totalCount}</span>
            </div>
            <i class="bi bi-file-earmark-text stat-icon text-secondary"></i>
          </div>
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <span class="stat-lbl">Proformas Vigentes</span>
              <span class="stat-val text-primary">${vigentesCount}</span>
            </div>
            <i class="bi bi-clock-history stat-icon text-primary"></i>
          </div>
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <span class="stat-lbl">Convertidas a Factura</span>
              <span class="stat-val text-success">${facturadasCount}</span>
            </div>
            <i class="bi bi-check2-circle stat-icon text-success"></i>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 bg-white p-2 border rounded shadow-sm">
          <div class="odoo-search-wrap" style="max-width: 380px;">
            <i class="bi bi-search search-icon"></i>
            <input type="text" id="proformas-filter-search" class="odoo-search-input" placeholder="Buscar por N° Proforma, Cédula o Nombre...">
          </div>
          <div class="btn-group btn-group-sm" role="group" id="proformas-filter-status">
            <button type="button" class="btn btn-outline-secondary active" data-filter="ALL">Todas (${totalCount})</button>
            <button type="button" class="btn btn-outline-primary" data-filter="VIGENTE">Vigentes (${vigentesCount})</button>
            <button type="button" class="btn btn-outline-success" data-filter="FACTURADA">Facturadas (${facturadasCount})</button>
          </div>
        </div>

        <!-- Tabla Odoo de Proformas -->
        <div class="odoo-table-wrap">
          <table class="odoo-table" id="table-proformas-list">
            <thead>
              <tr>
                <th>N° Proforma</th>
                <th>Fecha Emisión</th>
                <th>Válida Hasta</th>
                <th>Contribuyente</th>
                <th>Trámites Cotizados</th>
                <th style="text-align: right;">Total Cotizado</th>
                <th style="text-align: center;">Estado</th>
                <th>Factura Generada</th>
                <th style="text-align: center;">Acciones</th>
              </tr>
            </thead>
            <tbody id="proformas-table-body">
              ${this.renderProformasTableRows(proformas)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Eventos de la vista
    const btnNewPos = container.querySelector('#btn-nueva-proforma-pos');
    if (btnNewPos) {
      btnNewPos.addEventListener('click', () => {
        this.currentView = 'pos';
        this.updateHeaderDisplay();
        this.renderSidebarNavigation();
        this.renderCurrentView();
      });
    }

    const searchInput = container.querySelector('#proformas-filter-search');
    const statusBtns = container.querySelectorAll('#proformas-filter-status button');
    let activeFilter = 'ALL';

    const filterProformas = () => {
      const q = (searchInput?.value || '').toLowerCase().trim();
      const filtered = (this.state.proformas || []).filter(p => {
        const matchStatus = activeFilter === 'ALL' || p.estado === activeFilter;
        const matchText = !q || 
          p.id.toLowerCase().includes(q) ||
          p.ciudadanoNombre.toLowerCase().includes(q) ||
          p.ciudadanoIdentificacion.toLowerCase().includes(q);
        return matchStatus && matchText;
      });

      const tbody = container.querySelector('#proformas-table-body');
      if (tbody) {
        tbody.innerHTML = this.renderProformasTableRows(filtered);
        this.bindProformasTableEvents(container);
      }
    };

    if (searchInput) {
      searchInput.addEventListener('input', filterProformas);
    }

    statusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        statusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter');
        filterProformas();
      });
    });

    this.bindProformasTableEvents(container);
  },

  /** Genera las filas HTML para la tabla de proformas */
  renderProformasTableRows(proformas) {
    if (!proformas || proformas.length === 0) {
      return `<tr><td colspan="9" class="text-center py-4 text-muted">No se encontraron proformas registradas con ese criterio.</td></tr>`;
    }

    return proformas.map(p => {
      const isVigente = p.estado === 'VIGENTE';
      const itemsList = (p.items || []).map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

      return `
        <tr>
          <td class="font-mono fw-bold text-primary">${p.id}</td>
          <td class="font-mono small">${p.fechaEmision}</td>
          <td class="font-mono small ${isVigente ? 'text-dark fw-bold' : 'text-muted'}">${p.fechaVencimiento}</td>
          <td>
            <div class="fw-bold">${p.ciudadanoNombre}</div>
            <small class="text-muted font-mono">${p.ciudadanoIdentificacion}</small>
          </td>
          <td style="max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsList}">
            <span class="badge bg-light text-dark border me-1">${(p.items || []).length} ítems</span>
            <small class="text-muted">${itemsList}</small>
          </td>
          <td style="text-align: right;" class="font-mono fw-bold text-dark fs-6">
            ${MoneyUtil.format(p.totalCents)}
          </td>
          <td style="text-align: center;">
            <span class="badge ${isVigente ? 'bg-primary' : (p.estado === 'FACTURADA' ? 'bg-success' : 'bg-secondary')}">
              ${p.estado}
            </span>
          </td>
          <td>
            ${p.facturaGeneradaId ? `
              <span class="badge bg-light text-success border font-mono">
                <i class="bi bi-file-earmark-check"></i> ${p.facturaGeneradaId}
              </span>
            ` : '<span class="text-muted small">Pendiente</span>'}
          </td>
          <td style="text-align: center;">
            <div class="d-flex align-items-center justify-content-center gap-1">
              <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-ver-proforma" data-id="${p.id}" title="Ver e Imprimir Proforma">
                <i class="bi bi-eye"></i> Ver
              </button>
              ${isVigente ? `
                <button class="btn btn-sm text-white py-0 px-2 btn-convertir-proforma fw-bold" data-id="${p.id}" style="background: var(--odoo-secondary);" title="Cargar y cobrar en el POS">
                  <i class="bi bi-arrow-right-circle"></i> Facturar
                </button>
              ` : `
                <button class="btn btn-sm btn-outline-success py-0 px-2" disabled title="Ya facturada">
                  <i class="bi bi-check-all"></i> Facturada
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  /** Bind de eventos en los botones de acción de la tabla de proformas */
  bindProformasTableEvents(container) {
    container.querySelectorAll('.btn-ver-proforma').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const p = (this.state.proformas || []).find(prof => prof.id === id);
        if (p) {
          this.renderProformaModal(p);
          this.openModal('modal-proforma-ticket');
        }
      });
    });

    container.querySelectorAll('.btn-convertir-proforma').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.handleConvertirProformaAFactura(id);
      });
    });
  },

  // ===========================================================================
  // 5. MÓDULOS DE ADMINISTRACIÓN: FACTURACIÓN, TESORERÍA, CONTABILIDAD, CAJA
  // ===========================================================================

  renderViewComprobantes(container) {
    const cobros = this.state.cobros;

    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-receipt text-secondary"></i>
            <span>Comprobantes de Recaudación y Facturas</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-success fw-bold" id="btn-export-csv">
              <i class="bi bi-file-earmark-excel"></i> Exportar para Excel
            </button>
            <button class="btn btn-sm btn-primary fw-bold" id="btn-go-to-pos" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
              <i class="bi bi-plus-circle"></i> Nuevo Cobro en POS
            </button>
          </div>
        </div>

        <div class="odoo-table-wrap">
          <table class="odoo-table">
            <thead>
              <tr>
                <th>Comprobante</th>
                <th>Factura</th>
                <th>Fecha y Hora</th>
                <th>Contribuyente</th>
                <th>Medio de Pago</th>
                <th style="text-align: right;">Total Recaudado</th>
                <th style="text-align: center;">Estado</th>
                <th style="text-align: center;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${cobros.length === 0 ? `
                <tr><td colspan="8" class="text-center py-4 text-muted">No existen comprobantes registrados.</td></tr>
              ` : cobros.map(c => `
                <tr>
                  <td class="font-mono fw-bold">${c.id}</td>
                  <td class="font-mono text-muted">${c.facturaId}</td>
                  <td>${c.fecha}</td>
                  <td>
                    <div class="fw-bold">${c.ciudadanoNombre}</div>
                    <small class="text-muted font-mono">${c.ciudadanoIdentificacion}</small>
                  </td>
                  <td><span class="badge bg-light text-dark border">${c.metodoPago}</span></td>
                  <td style="text-align: right;" class="font-mono fw-bold text-success">${MoneyUtil.format(c.totalCents)}</td>
                  <td style="text-align: center;">
                    <span class="badge ${c.estadoCobro === 'COBRADO' ? 'bg-success' : 'bg-danger'}">${c.estadoCobro}</span>
                  </td>
                  <td style="text-align: center;">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2 btn-ver-ticket-row" data-id="${c.id}">
                      <i class="bi bi-printer"></i> Ticket
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const btnGoPos = container.querySelector('#btn-go-to-pos');
    if (btnGoPos) {
      btnGoPos.addEventListener('click', () => {
        this.currentView = 'pos';
        this.updateHeaderDisplay();
        this.renderSidebarNavigation();
        this.renderCurrentView();
      });
    }

    const btnExport = container.querySelector('#btn-export-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        this.exportToCSV();
      });
    }

    container.querySelectorAll('.btn-ver-ticket-row').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cobro = this.state.cobros.find(c => c.id === id);
        if (cobro) {
          this.renderTicketModal(cobro);
          this.openModal('modal-ticket');
        }
      });
    });
  },

  renderViewApertura(container) {
    const caja = this.state.cajas[0];
    const isAbierta = caja && caja.estado === 'ABIERTA';

    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-box-arrow-in-right text-secondary"></i>
            <span>Apertura de Turno y Control de Caja</span>
          </div>
        </div>

        <div class="card p-4 mx-auto border shadow-sm" style="max-width: 600px; background: #FFFFFF;">
          <h5 class="fw-bold mb-3 text-dark">Estado Operativo de la Caja de Ventanilla</h5>
          <div class="p-3 mb-3 rounded border ${isAbierta ? 'bg-light text-success border-success' : 'bg-light text-danger border-danger'}">
            <div class="d-flex align-items-center gap-2 fw-bold fs-6">
              <i class="bi bi-${isAbierta ? 'check-circle' : 'lock'}-fill"></i>
              <span>Caja ${caja.nombre} — Estado: ${caja.estado}</span>
            </div>
            <div class="small mt-1 text-muted">
              Punto de Emisión: <strong>${caja.puntoEmision}</strong> • Cajero Asignado: <strong>${caja.cajeroAsignado}</strong>
            </div>
          </div>

          ${isAbierta ? `
            <div class="small text-muted mb-4">
              Fecha de Apertura: <strong class="font-mono">${caja.fechaApertura}</strong><br>
              Fondo de Sencillo Inicial: <strong class="font-mono text-dark fs-6">${MoneyUtil.format(caja.fondoInicialCents)}</strong><br>
              Observación: <em>${caja.observacionApertura || 'Sin observaciones'}</em>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-danger fw-bold" id="btn-ir-cierre-caja">
                <i class="bi bi-door-closed"></i> Proceder al Arqueo y Cierre de Caja
              </button>
              <button class="btn btn-primary fw-bold" id="btn-ir-pos-abierto" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
                <i class="bi bi-shop"></i> Ir al Punto de Venta (POS)
              </button>
            </div>
          ` : `
            <p class="small text-muted mb-3">La caja se encuentra cerrada. Ingrese el fondo de sencillo para comenzar a recaudar.</p>
            <button class="btn btn-primary fw-bold" id="btn-abrir-caja-act" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
              <i class="bi bi-unlock"></i> Efectuar Apertura de Caja
            </button>
          `}
        </div>
      </div>
    `;

    const btnAbrir = container.querySelector('#btn-abrir-caja-act');
    if (btnAbrir) {
      btnAbrir.addEventListener('click', () => {
        this.openModalApertura();
      });
    }

    const btnGoPos = container.querySelector('#btn-ir-pos-abierto');
    if (btnGoPos) {
      btnGoPos.addEventListener('click', () => {
        this.currentView = 'pos';
        this.updateHeaderDisplay();
        this.renderSidebarNavigation();
        this.renderCurrentView();
      });
    }

    const btnCierre = container.querySelector('#btn-ir-cierre-caja');
    if (btnCierre) {
      btnCierre.addEventListener('click', () => {
        this.currentView = 'cierre';
        this.updateHeaderDisplay();
        this.renderSidebarNavigation();
        this.renderCurrentView();
      });
    }
  },

  openModalApertura() {
    const caja = this.state.cajas[0];
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 19);

    const fHora = document.getElementById('ap-fecha-hora');
    if (fHora) fHora.value = dateStr;

    this.openModal('modal-apertura');
  },

  handleConfirmApertura() {
    const inputFondo = document.getElementById('ap-fondo-inicial');
    const inputObs = document.getElementById('ap-obs');
    const fondoCents = MoneyUtil.toCents(inputFondo ? inputFondo.value : 50);

    const caja = this.state.cajas[0];
    caja.estado = 'ABIERTA';
    caja.fondoInicialCents = fondoCents;
    caja.fechaApertura = new Date().toISOString().replace('T', ' ').substring(0, 19);
    caja.observacionApertura = inputObs ? inputObs.value : '';

    DataService.saveState(this.state);
    this.closeModal('modal-apertura');
    this.updateHeaderDisplay();
    this.renderCurrentView();
    this.showToast('Apertura de Caja realizada con éxito.', 'success');
  },

  renderViewCierre(container) {
    const caja = this.state.cajas[0];
    const cobrosHoy = this.state.cobros.filter(c => !c.cierreId);

    let totalEfectivoCents = 0;
    let totalTransfCents = 0;
    let totalTarjetaCents = 0;

    cobrosHoy.forEach(c => {
      if (c.metodoPago === 'EFECTIVO') totalEfectivoCents += c.totalCents;
      else if (c.metodoPago === 'TRANSFERENCIA') totalTransfCents += c.totalCents;
      else if (c.metodoPago === 'TARJETA') totalTarjetaCents += c.totalCents;
    });

    const totalCobradoCents = totalEfectivoCents + totalTransfCents + totalTarjetaCents;
    const efectivoEsperadoCents = (caja.fondoInicialCents || 0) + totalEfectivoCents;

    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-door-closed text-secondary"></i>
            <span>Arqueo y Cierre Diario de Caja (Jornada)</span>
          </div>
        </div>

        <div class="row g-3">
          <div class="col-lg-7">
            <div class="card p-3 border shadow-sm bg-white mb-3">
              <h6 class="fw-bold mb-3 text-dark">Resumen de Recaudación del Turno</h6>
              <div class="table-responsive">
                <table class="table table-sm table-bordered small">
                  <thead class="table-light">
                    <tr>
                      <th>Forma de Recaudación</th>
                      <th class="text-center">N° Operaciones</th>
                      <th class="text-end">Total Recaudado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Efectivo Físico en Ventanilla</td>
                      <td class="text-center">${cobrosHoy.filter(c => c.metodoPago === 'EFECTIVO').length}</td>
                      <td class="text-end font-mono fw-bold">${MoneyUtil.format(totalEfectivoCents)}</td>
                    </tr>
                    <tr>
                      <td>Transferencias Bancarias SPI-BCE</td>
                      <td class="text-center">${cobrosHoy.filter(c => c.metodoPago === 'TRANSFERENCIA').length}</td>
                      <td class="text-end font-mono fw-bold">${MoneyUtil.format(totalTransfCents)}</td>
                    </tr>
                    <tr>
                      <td>Tarjetas de Débito y Crédito (POS)</td>
                      <td class="text-center">${cobrosHoy.filter(c => c.metodoPago === 'TARJETA').length}</td>
                      <td class="text-end font-mono fw-bold">${MoneyUtil.format(totalTarjetaCents)}</td>
                    </tr>
                    <tr class="table-light fw-bold">
                      <td>TOTAL RECAUDADO EN EL TURNO</td>
                      <td class="text-center">${cobrosHoy.length}</td>
                      <td class="text-end font-mono text-success">${MoneyUtil.format(totalCobradoCents)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card p-3 border shadow-sm bg-white">
              <h6 class="fw-bold mb-2 text-dark">Arqueo de Efectivo Físico</h6>
              <div class="p-2 mb-2 rounded bg-light border small">
                Fondo de Sencillo Inicial: <strong>${MoneyUtil.format(caja.fondoInicialCents)}</strong><br>
                Efectivo Recaudado: <strong>${MoneyUtil.format(totalEfectivoCents)}</strong><br>
                <div class="border-top mt-1 pt-1 fw-bold text-dark">
                  Efectivo Total Esperado en Gaveta: <span class="font-mono text-primary fs-6">${MoneyUtil.format(efectivoEsperadoCents)}</span>
                </div>
              </div>

              <div class="mb-3">
                <label for="cierre-arqueo-input" class="form-label small fw-bold text-dark">Efectivo Físico Contado *</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" id="cierre-arqueo-input" step="0.01" value="${MoneyUtil.fromCents(efectivoEsperadoCents).toFixed(2)}" class="form-control font-mono fw-bold fs-5">
                </div>
              </div>

              <div class="mb-3">
                <label for="cierre-obs-input" class="form-label small fw-bold text-muted">Observación de Cierre</label>
                <textarea id="cierre-obs-input" rows="2" class="form-control form-control-sm" placeholder="Sin novedades, valores cuadrados para entrega a Tesorería."></textarea>
              </div>

              <button class="btn btn-danger fw-bold w-100" id="btn-submit-cierre">
                <i class="bi bi-lock-fill"></i> Cerrar Caja y Entregar Arqueo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const btnSubmit = container.querySelector('#btn-submit-cierre');
    if (btnSubmit) {
      btnSubmit.addEventListener('click', () => {
        this.handleConfirmCierre(efectivoEsperadoCents, totalCobradoCents);
      });
    }
  },

  handleConfirmCierre(esperadoCents, cobradoCents) {
    const inputContado = document.getElementById('cierre-arqueo-input');
    const inputObs = document.getElementById('cierre-obs-input');
    const contadoCents = MoneyUtil.toCents(inputContado ? inputContado.value : esperadoCents);
    const diferenciaCents = contadoCents - esperadoCents;

    const caja = this.state.cajas[0];
    const cierreId = `CIE-2026-${String(Date.now()).slice(-5)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const cierre = {
      id: cierreId,
      cajaId: caja.id,
      cajeroNombre: caja.cajeroAsignado,
      fechaHora: dateStr,
      fondoInicialCents: caja.fondoInicialCents,
      totalCobradoCents: cobradoCents,
      efectivoEsperadoCents: esperadoCents,
      efectivoContadoCents: contadoCents,
      diferenciaCents: diferenciaCents,
      observacion: inputObs ? inputObs.value : '',
      estado: 'RECIBIDO_EN_TESORERIA'
    };

    if (!this.state.cierres) this.state.cierres = [];
    this.state.cierres.unshift(cierre);

    // Marcar cobros del turno
    this.state.cobros.forEach(c => {
      if (!c.cierreId) c.cierreId = cierreId;
    });

    caja.estado = 'CERRADA';
    DataService.saveState(this.state);

    this.showToast(`Cierre de caja ${cierreId} completado. Entregado a Tesorería.`, 'success');
    this.updateHeaderDisplay();
    this.renderCurrentView();
  },

  renderViewTesoreriaCierres(container) {
    const cierres = this.state.cierres || [];

    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-bank text-secondary"></i>
            <span>Tesorería — Cierres de Caja Recibidos</span>
          </div>
          <button class="btn btn-sm btn-primary fw-bold" id="btn-open-deposito-modal" style="background: var(--odoo-primary); border-color: var(--odoo-primary);">
            <i class="bi bi-plus-circle"></i> Registrar Depósito Bancario
          </button>
        </div>

        <div class="odoo-stat-cards mb-3">
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <div class="stat-title">Cierres Recibidos</div>
              <div class="stat-value">${cierres.length}</div>
            </div>
            <div class="stat-icon-badge stat-icon-purple"><i class="bi bi-folder-check"></i></div>
          </div>
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <div class="stat-title">Total Arqueado (USD)</div>
              <div class="stat-value">${MoneyUtil.format(cierres.reduce((acc, c) => acc + (c.totalCobradoCents || 0), 0))}</div>
            </div>
            <div class="stat-icon-badge stat-icon-teal"><i class="bi bi-cash-coin"></i></div>
          </div>
          <div class="odoo-stat-card">
            <div class="stat-card-left">
              <div class="stat-title">Depósitos Conciliados</div>
              <div class="stat-value">${(this.state.depositosBancarios || []).length}</div>
            </div>
            <div class="stat-icon-badge stat-icon-amber"><i class="bi bi-bank"></i></div>
          </div>
        </div>

        <div class="odoo-table-wrap">
          <table class="odoo-table">
            <thead>
              <tr>
                <th>N° Cierre</th>
                <th>Fecha y Hora</th>
                <th>Cajero</th>
                <th style="text-align: right;">Total Cobrado</th>
                <th style="text-align: right;">Efectivo Gaveta</th>
                <th style="text-align: right;">Diferencia</th>
                <th style="text-align: center;">Estado</th>
              </tr>
            </thead>
            <tbody>
              ${cierres.length === 0 ? `
                <tr><td colspan="7" class="text-center py-4 text-muted">Aún no se han registrado cierres de turno en esta jornada.</td></tr>
              ` : cierres.map(c => `
                <tr>
                  <td class="font-mono fw-bold">${c.id}</td>
                  <td>${c.fechaHora}</td>
                  <td>${c.cajeroNombre}</td>
                  <td style="text-align: right;" class="font-mono">${MoneyUtil.format(c.totalCobradoCents)}</td>
                  <td style="text-align: right;" class="font-mono fw-bold">${MoneyUtil.format(c.efectivoContadoCents)}</td>
                  <td style="text-align: right;" class="font-mono ${c.diferenciaCents === 0 ? 'text-success' : 'text-danger'}">
                    ${MoneyUtil.format(c.diferenciaCents)}
                  </td>
                  <td style="text-align: center;"><span class="badge bg-success">${c.estado}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const btnDep = container.querySelector('#btn-open-deposito-modal');
    if (btnDep) {
      btnDep.addEventListener('click', () => {
        this.openModal('modal-deposito');
      });
    }
  },

  handleSubmitDeposito() {
    const inputBanco = document.getElementById('dep-banco-sel');
    const inputPapeleta = document.getElementById('dep-papeleta-num');
    const inputMonto = document.getElementById('dep-monto-val');
    const inputObs = document.getElementById('dep-obs-val');

    if (!inputPapeleta || !inputPapeleta.value.trim()) {
      this.showToast('Debe ingresar el número de papeleta de depósito bancario.', 'warning');
      return;
    }

    const montoCents = MoneyUtil.toCents(inputMonto ? inputMonto.value : 0);
    if (montoCents <= 0) {
      this.showToast('El monto a depositar debe ser mayor a 0.', 'warning');
      return;
    }

    const depId = `DEP-2026-${String(Date.now()).slice(-5)}`;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const deposito = {
      id: depId,
      cierreId: null,
      fechaHora: dateStr,
      banco: inputBanco.value,
      numeroPapeleta: inputPapeleta.value,
      montoCents: montoCents,
      usuarioResponsable: 'Dra. Carmen Velasteguí',
      estado: 'CONCILIADO',
      observacion: inputObs ? inputObs.value : ''
    };

    if (!this.state.depositosBancarios) this.state.depositosBancarios = [];
    this.state.depositosBancarios.unshift(deposito);
    DataService.saveState(this.state);

    // Sincronización con Odoo 19 Backend (si está activo)
    if (typeof OdooBackendService !== 'undefined') {
      OdooBackendService.syncDeposit(deposito).then(res => {
        if (res && res.success && !res.simulated) {
          console.log('✓ Depósito bancario sincronizado con Odoo 19 Backend:', res);
        }
      }).catch(e => console.warn('Sync Odoo deposit:', e));
    }

    this.closeModal('modal-deposito');
    this.showToast(`Depósito bancario ${depId} registrado y conciliado con éxito.`, 'success');
    this.renderCurrentView();
  },

  renderViewTesoreriaDepositos(container) {
    this.renderViewTesoreriaCierres(container);
  },

  renderViewTesoreriaReversiones(container) {
    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-arrow-repeat text-secondary"></i>
            <span>Tesorería — Solicitudes de Reversión Formal</span>
          </div>
        </div>
        <div class="card p-4 text-center border shadow-sm bg-white">
          <i class="bi bi-shield-check fs-2 text-success mb-2"></i>
          <h6 class="fw-bold text-dark">Sin Reversiones Pendientes</h6>
          <p class="small text-muted mb-0">Todas las operaciones de ventanilla han sido conciliadas satisfactoriamente.</p>
        </div>
      </div>
    `;
  },

  renderViewTesoreriaReporte(container) {
    this.renderViewComprobantes(container);
  },

  renderViewContabilidadAuditoria(container) {
    container.innerHTML = `
      <div class="odoo-view-container">
        <div class="odoo-control-panel">
          <div class="odoo-breadcrumb">
            <i class="bi bi-journal-check text-secondary"></i>
            <span>Contabilidad — Auditoría y Asientos Contables</span>
          </div>
          <button class="btn btn-sm btn-outline-success fw-bold" id="btn-export-contable">
            <i class="bi bi-file-earmark-excel"></i> Exportar Libro Diario
          </button>
        </div>

        <div class="odoo-table-wrap">
          <table class="odoo-table">
            <thead>
              <tr>
                <th>Cuenta Contable</th>
                <th>Denominación Oficial</th>
                <th>Naturaleza</th>
                <th style="text-align: right;">Debe (Débito)</th>
                <th style="text-align: right;">Haber (Crédito)</th>
                <th style="text-align: center;">Trazabilidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-mono fw-bold">1.1.1.01</td>
                <td>Caja Recaudadora Ventanilla (Efectivo)</td>
                <td>Deudora</td>
                <td style="text-align: right;" class="font-mono fw-bold text-success">$505.00</td>
                <td style="text-align: right;" class="font-mono text-muted">$0.00</td>
                <td style="text-align: center;"><span class="badge bg-success">Automático POS</span></td>
              </tr>
              <tr>
                <td class="font-mono fw-bold">1.1.1.03</td>
                <td>Bancos — Cuenta Rotativa Recaudadora BCE</td>
                <td>Deudora</td>
                <td style="text-align: right;" class="font-mono fw-bold text-success">$2,500.00</td>
                <td style="text-align: right;" class="font-mono text-muted">$0.00</td>
                <td style="text-align: center;"><span class="badge bg-success">Conciliado SPI</span></td>
              </tr>
              <tr>
                <td class="font-mono fw-bold">2.1.3.01</td>
                <td>Retenciones y Tasas por Liquidar al SRI</td>
                <td>Acreedora</td>
                <td style="text-align: right;" class="font-mono text-muted">$0.00</td>
                <td style="text-align: right;" class="font-mono fw-bold text-danger">$180.00</td>
                <td style="text-align: center;"><span class="badge bg-primary">Fiscal SRI</span></td>
              </tr>
              <tr>
                <td class="font-mono fw-bold">6.1.3.01</td>
                <td>Ingresos por Tasas y Derechos Administrativos</td>
                <td>Acreedora</td>
                <td style="text-align: right;" class="font-mono text-muted">$0.00</td>
                <td style="text-align: right;" class="font-mono fw-bold text-dark">$2,825.00</td>
                <td style="text-align: center;"><span class="badge bg-secondary">Devengado</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    const btnExp = container.querySelector('#btn-export-contable');
    if (btnExp) {
      btnExp.addEventListener('click', () => {
        this.exportToCSV();
      });
    }
  },

  renderViewContabilidadAsientos(container) {
    this.renderViewContabilidadAuditoria(container);
  },

  /** Exportación completa a CSV con formato compatible con Microsoft Excel (UTF-8 BOM) */
  exportToCSV() {
    const cobros = this.state.cobros;

    const headers = [
      'Nro_Comprobante',
      'Nro_Factura',
      'Fecha_Hora',
      'Identificacion_Ciudadano',
      'Nombre_Ciudadano',
      'Forma_Pago',
      'Referencia_Pago',
      'Banco_Entidad',
      'Subtotal_Tarifa_0_USD',
      'Subtotal_IVA_USD',
      'IVA_USD',
      'Total_Recaudado_USD',
      'Estado_Cobro',
      'Estado_Deposito',
      'Estado_Contable'
    ];

    const rows = cobros.map(c => [
      `"${c.id}"`,
      `"${c.facturaId}"`,
      `"${c.fecha}"`,
      `"${c.ciudadanoIdentificacion}"`,
      `"${c.ciudadanoNombre.replace(/"/g, '""')}"`,
      `"${c.metodoPago}"`,
      `"${c.referenciaPago || ''}"`,
      `"${c.bancoEntidad || ''}"`,
      MoneyUtil.fromCents(c.subtotal0Cents).toFixed(2),
      MoneyUtil.fromCents(c.subtotalIvaCents).toFixed(2),
      MoneyUtil.fromCents(c.ivaCents).toFixed(2),
      MoneyUtil.fromCents(c.totalCents).toFixed(2),
      `"${c.estadoCobro}"`,
      `"${c.estadoDeposito}"`,
      `"${c.estadoContable}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recaudacion_Odoo_POS_Ecuador_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast('Archivo CSV generado y descargado para Excel.', 'success');
  },

  // ===========================================================================
  // 6. UTILIDADES DE INTERFAZ: MODALES Y TOASTS
  // ===========================================================================

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  },

  showToast(msg, type = 'info') {
    const stack = document.getElementById('toast-stack');
    if (!stack) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${type}`;

    let icon = '<i class="bi bi-info-circle-fill text-primary"></i>';
    if (type === 'success') icon = '<i class="bi bi-check-circle-fill text-success"></i>';
    else if (type === 'error') icon = '<i class="bi bi-exclamation-octagon-fill text-danger"></i>';
    else if (type === 'warning') icon = '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';

    toast.innerHTML = `
      <span style="font-size: 1.15rem; line-height: 1;">${icon}</span>
      <span style="flex: 1; font-weight: 500;">${msg}</span>
    `;

    stack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, 3800);
  }
};

// Arrancar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  POSApp.init();
});
