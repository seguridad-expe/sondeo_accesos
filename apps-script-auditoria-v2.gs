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
// (el iframe carga esta respuesta después del submit)
// ============================================================
function doGet(e) {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html><html><body>
      <script>
        // Notifica a la ventana padre que el envío fue exitoso
        try { window.top.postMessage('FORM_OK', '*'); } catch(e) {}
        try { window.parent.postMessage('FORM_OK', '*'); } catch(e) {}
      </script>
    </body></html>
  `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// doPost — recibe datos del formulario
// Acepta dos formatos:
//   1. Form POST clásico: e.parameter.payload (JSON string)
//   2. fetch JSON:        e.postData.contents  (JSON string)
// ============================================================
function doPost(e) {
  try {
    // ── Parsear datos (soporta ambos formatos) ──────────────
    let raw = '';

    if (e.parameter && e.parameter.payload) {
      // Enviado por el form/iframe (campo hidden "payload")
      raw = e.parameter.payload;
    } else if (e.postData && e.postData.contents) {
      // Enviado por fetch/XHR como JSON body
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
        '',  // líder responsable no aplica en corporativo
        '',  // tipo de cuenta no aplica
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

    // ── Respuesta HTML (para el iframe) ─────────────────────
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html><html><body>
      <script>
        try { window.top.postMessage('FORM_OK', '*'); } catch(e) {}
        try { window.parent.postMessage('FORM_OK', '*'); } catch(e) {}
      </script>
      </body></html>
    `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch (err) {
    console.error('doPost error:', err.message, err.stack);
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

// ============================================================
// getOrCreate
// ============================================================
function getOrCreate(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    range.setBackground('#0d1b2e');
    range.setFontColor('#2de8b0');
    range.setFontWeight('bold');
    range.setFontFamily('Courier New');
    range.setFontSize(10);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

// ============================================================
// testScript — prueba manual desde el editor
// ============================================================
function testScript() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        referencia: 'AUD-TEST003',
        seccion1: {
          documento: '9876543210', nombreCompleto: 'Test Usuario',
          correo: 'test@experimentality.co', cargo: 'QA',
          area: 'Tecnología', lider: 'Sebastian Cuervo Aransazo',
          asignadoProyectos: 'Sí'
        },
        seccion2_detalles: [
          { nombre: 'VTEX', clienteAsociado: 'Experimentality',
            proyectoAsociado: 'E-commerce', rol: 'Admin', mfa: 'Sí' }
        ],
        seccion3_detalles: [
          { nombre: 'AWS', nombreCliente: 'Cliente X', proyecto: 'Infra',
            rol: 'Developer', liderResponsable: 'Karen Johana Reyes Rivera',
            tipoCuenta: 'Individual', mfa: 'No' }
        ],
        seccion4_seguridad: {
          mismaContrasena: 'No', compartidoCredenciales: 'No',
          accesosSobrantes: 'No', cualesAccesos: '', appsPersonales: 'Sí'
        },
        declaracionAceptada: true
      })
    }
  };
  doPost(testData);
  Logger.log('Test ejecutado — revisa las hojas del Sheet.');
}
