const Submit = (() => {

  const SCRIPT_URL = ENV.APPS_SCRIPT_URL;

  function send() {
    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Enviando...';
    }

    const payload = _buildPayload();
    
    // Método Form + Hidden Input + Iframe para evitar errores de CORS y recibir confirmación
    _sendViaIframe(payload);
  }

  function _buildPayload() {
    const ref = 'AUD-' + Date.now().toString(36).toUpperCase();
    const ts  = new Date().toISOString();

    const g = id => State.formData[id] || '';

    // Mapeo Sección 1: Empleado
    const seccion1 = {
      documento: g('documento'),
      nombreCompleto: g('nombreCompleto'),
      correo: g('correo'),
      cargo: g('cargo'),
      area: g('area'),
      lider: g('lider'),
      asignadoProyectos: g('asignadoProyectos')
    };

    // Mapeo Sección 2: Aplicativos Corporativos
    const s2_raw = Apps.gatherDetails('appCorp', false);
    const seccion2_detalles = s2_raw.map(app => ({
      nombre: app.app,
      clienteAsociado: 'EXPERIMENTALITY',
      proyectoAsociado: app.proyecto,
      rol: app.rol,
      mfa: app.mfa
    }));

    // Mapeo Sección 3: Aplicativos Clientes
    const s3_raw = Apps.gatherDetails('appClient', true);
    const seccion3_detalles = s3_raw.map(app => ({
      nombre: app.app,
      nombreCliente: app.empresa, // Apps.js ya maneja el mapeo de "OTRO"
      proyecto: app.proyecto,
      rol: app.rol,
      liderResponsable: app.lider,
      tipoCuenta: app.cuenta,
      mfa: app.mfa
    }));

    // Mapeo Sección 4: Cuestionario de Seguridad
    const seccion4_seguridad = {
      mismaContrasena: g('mismaContrasena'),
      compartidoCredenciales: g('compartidoCredenciales'),
      accesosSobrantes: g('accesosSobrantes'),
      cualesAccesos: g('cualesAccesos'),
      appsPersonales: g('appsPersonales')
    };

    return {
      timestamp: ts,
      referencia: ref,
      seccion1,
      seccion2_detalles,
      seccion3_detalles,
      seccion4_seguridad,
      declaracionAceptada: document.getElementById('declaracion')?.checked || false
    };
  }

  function _sendViaIframe(payload) {
    // 1. Crear el iframe oculto
    let iframe = document.getElementById('submit_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'submit_iframe';
      iframe.name = 'submit_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // 2. Crear el formulario oculto
    let form = document.getElementById('submit_form');
    if (form) form.remove(); // Limpiar si existe previo
    
    form = document.createElement('form');
    form.id = 'submit_form';
    form.method = 'POST';
    form.action = SCRIPT_URL;
    form.target = 'submit_iframe';
    form.style.display = 'none';
    
    const input = document.createElement('input');
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.appendChild(input);
    
    document.body.appendChild(form);

    // 3. Listener para la respuesta del Apps Script (FORM_OK)
    const handler = (event) => {
      if (typeof event.data === 'string' && event.data.startsWith('FORM_OK')) {
        window.removeEventListener('message', handler);
        _onSuccess(payload.referencia);
      } else if (typeof event.data === 'string' && event.data.startsWith('FORM_ERROR')) {
        window.removeEventListener('message', handler);
        _onError(event.data.split(':')[1]);
      }
    };
    window.addEventListener('message', handler);

    // 4. Enviar!
    form.submit();

    // Timeout de seguridad en caso de que el postMessage no llegue
    setTimeout(() => {
      window.removeEventListener('message', handler);
      // Podríamos fallar o simplemente forzar el éxito si nada ha pasado.
      // Por ahora confiamos en el postMessage del script de Google.
    }, 15000);
  }

  function _onSuccess(ref) {
    UI.loadView('success');
    const refSpan = document.getElementById('refCode');
    if (refSpan) refSpan.textContent = 'REF: ' + ref;
    
    // Limpiar estado
    Object.keys(State.formData).forEach(k => delete State.formData[k]);
    State.rowCounts = {};
  }

  function _onError(msg) {
    alert('Error al enviar el formulario: ' + (msg || 'Error de conexión'));
    const btn = document.getElementById('submitBtn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Reintentar Envío';
    }
  }

  function download() {
    const payload = _buildPayload();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "auditoria_" + payload.referencia + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  return { send, download };
})();
