const SPREADSHEET_ID    = "178IKM9oD_LLQbs1ahWQZrC-ylE8M_Iq-7GA1eMW-eYA";
const HOJA_EMPLEADOS    = "Empleados";
const HOJA_APLICACIONES = "Aplicaciones";
const HOJA_CUESTIONARIO = "Cuestionario";

const CAB_EMPLEADOS = [
  "Cedula", "Timestamp", "Referencia",
  "Nombre Completo", "Correo Corporativo",
  "Cargo", "Área", "Líder Inmediato", "Asignado a Proyectos"
];

const CAB_APLICACIONES = [
  "Cedula", "Timestamp", "Referencia",
  "Nombre Empleado", "Correo",
  "Tipo",
  "Aplicativo",
  "Cliente Asociado",
  "Proyecto",
  "Rol / Tipo de Acceso",
  "Líder Responsable",
  "Tipo de Cuenta",
  "MFA / 2FA"
];

const CAB_CUESTIONARIO = [
  "Cedula", "Timestamp", "Referencia",
  "Nombre Completo", "Correo",
  "¿Misma contraseña en varios sistemas?",
  "¿Compartió credenciales?",
  "¿Tiene accesos que ya no debería tener?",
  "¿Cuáles accesos sobrantes?",
  "¿Apps corporativas en dispositivo personal?",
  "Declaración Aceptada"
];

const CAB_LIDERES = [
  "Nombre Líder", "Correo", "Cargo", "Área", "Activo"
];

// ============================================================
// doGet — sirve la página de confirmación post-envío
// ============================================================
function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html><html><body>
      <script>
        try { window.top.postMessage('FORM_OK', '*'); } catch(e) {}
        try { window.parent.postMessage('FORM_OK', '*'); } catch(e) {}
      </script>
    </body></html>
  `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// doPost — ENTRY POINT REQUERIDO POR GOOGLE APPS SCRIPT
// ============================================================
function doPost(e) {
  return procesarSondeo(e);
}

// ============================================================
// procesarSondeo — recibe y guarda los datos
// ============================================================
function procesarSondeo(e) {
  try {
    let raw = '';
    if (e.parameter && e.parameter.payload) {
      raw = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      raw = e.postData.contents;
    }

    if (!raw) throw new Error('Sin datos recibidos');

    const data = JSON.parse(raw);
    const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ts   = data.timestamp  || new Date().toISOString();
    const ref  = data.referencia || ('AUD-' + Date.now().toString(36).toUpperCase());
    const s1   = data.seccion1   || {};
    const s4   = data.seccion4_seguridad || {};

    const cedula = (s1.documento      || '').trim();
    const nombre = (s1.nombreCompleto || '').trim();
    const correo = (s1.correo         || '').trim();

    // ── 1. HOJA EMPLEADOS ───────────────────────────────────
    const hEmp = getOrCreate(ss, HOJA_EMPLEADOS, CAB_EMPLEADOS);
    hEmp.appendRow([
      cedula, ts, ref, nombre, correo,
      s1.cargo || '', s1.area || '',
      s1.lider || '', s1.asignadoProyectos || ''
    ]);

    // ── 2. HOJA APLICACIONES ────────────────────────────────
    const hApp = getOrCreate(ss, HOJA_APLICACIONES, CAB_APLICACIONES);

    (data.seccion2_detalles || []).forEach(app => {
      hApp.appendRow([
        cedula, ts, ref, nombre, correo,
        'Corporativo',
        app.nombre           || '',
        app.clienteAsociado  || 'Experimentality',
        app.proyectoAsociado || '',
        app.rol              || '',
        app.liderResponsable || '', // Ahora incluye el líder capturado
        '',  // tipo de cuenta
        app.mfa              || ''
      ]);
    });

    (data.seccion3_detalles || []).forEach(app => {
      hApp.appendRow([
        cedula, ts, ref, nombre, correo,
        'Cliente',
        app.nombre           || '',
        app.nombreCliente    || '',
        app.proyecto         || '',
        app.rol              || '',
        app.liderResponsable || '',
        app.tipoCuenta       || '',
        app.mfa              || ''
      ]);
    });

    // ── 3. HOJA CUESTIONARIO ────────────────────────────────
    const hQst = getOrCreate(ss, HOJA_CUESTIONARIO, CAB_CUESTIONARIO);
    hQst.appendRow([
      cedula, ts, ref, nombre, correo,
      s4.mismaContrasena          || '',
      s4.compartidoCredenciales   || '',
      s4.accesosSobrantes         || '',
      s4.cualesAccesos            || '',
      s4.appsPersonales           || '',
      data.declaracionAceptada ? 'Sí' : 'No'
    ]);

    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html><html><body>
      <script>
        try { window.top.postMessage('FORM_OK', '*'); } catch(e) {}
        try { window.parent.postMessage('FORM_OK', '*'); } catch(e) {}
      </script>
      </body></html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    console.error('procesarSondeo error:', err.message);
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html><html><body>
      <script>
        try { window.top.postMessage('FORM_ERROR:${err.message}', '*'); } catch(e) {}
        try { window.parent.postMessage('FORM_ERROR:${err.message}', '*'); } catch(e) {}
      </script>
      </body></html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

function getOrCreate(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground('#0d1b2e');
    range.setFontColor('#2de8b0');
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        referencia: 'AUD-TEST-PROD',
        seccion1: {
          documento: '000', nombreCompleto: 'Prod Test',
          correo: 'test@experimentality.co', cargo: 'Dev', area: 'Tech', lider: 'Lider Test', asignadoProyectos: 'No'
        },
        seccion2_detalles: [{ nombre: 'VTEX', proyectoAsociado: 'Test', rol: 'Admin', liderResponsable: 'Saúl Naranjo', mfa: 'Sí' }],
        seccion3_detalles: [],
        seccion4_seguridad: {},
        declaracionAceptada: true
      })
    }
  };
  procesarSondeo(testData);
}
