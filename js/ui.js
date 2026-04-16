// ============================================================
// ui.js — Interfaz: navegación, progreso, resumen, líderes
// ============================================================
// Nota: se usa concatenación de strings en lugar de template
// literals para evitar problemas de escape en atributos HTML.
// ============================================================

const UI = (() => {

  async function loadView(name, targetId) {
    const container = document.getElementById(targetId || 'formContent');
    if (!container) return;

    // Antes de destruir la vista actual, guardamos los datos
    if (State.currentSection) {
      _saveFieldData(State.currentSection);
    }

    const html = Templates[name];
    if (!html) {
      console.error('Error: Template not found:', name);
      return;
    }

    container.innerHTML = html;
    _initView(name);
    _restoreFieldData(name);

    // Siempre arriba al cambiar de vista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _initView(name) {
    if (name === 'form-shell') {
      const badge = document.getElementById('userBadge');
      if (badge && State.googleUser) {
        document.getElementById('userAvatar').src = State.googleUser.picture;
        document.getElementById('userName').textContent = State.googleUser.name;
        badge.style.display = 'flex';
      }
    }

    if (name === 'section1') {
      poblarSelectCargo('cargo', State.formData['cargo']);
      poblarSelectArea('area', State.formData['area']);
      poblarSelectLider('lider', State.formData['lider']);

      // Auto-completar si es la primera vez
      if (State.googleUser) {
        const nom = document.getElementById('nombreCompleto');
        if (nom && !nom.value) nom.value = State.googleUser.name;
        const mail = document.getElementById('correo');
        if (mail && !mail.value) mail.value = State.googleUser.email;
      }
    }

    if (name === 'section2') {
      renderAppTable('corp');
    }

    if (name === 'section3') {
      Apps.bindCheckboxGroup('appClient', 'clientAppDetails', true);
    }

    if (name === 'section5') {
      buildSummary();
      checkDeclaration();
    }
  }

  // ── Persistencia de Datos (Core SPA) ─────────────────────

  function _saveFieldData(sectionName) {
    const container = document.getElementById('formContent');
    if (!container) return;

    // Guardamos todos los inputs actuales en State.formData
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(el => {
      if (el.type === 'radio') {
        if (el.checked) State.formData[el.name] = el.value;
      } else if (el.type === 'checkbox') {
        // Para checkboxes (especialmente los de apps), guardamos un array
        const results = Array.from(container.querySelectorAll(`input[name="${el.name}"]:checked`)).map(c => c.value);
        State.formData[el.name] = results;
      } else {
        if (el.id) State.formData[el.id] = el.value;
      }
    });
  }

  function _restoreFieldData(sectionName) {
    const container = document.getElementById('formContent');
    if (!container) return;

    // 1. Restaurar checkboxes principales primero (Secciones 2 y 3)
    // Esto es CRÍTICO para que Apps.js pueda disparar la creación de tarjetas
    if (sectionName === 'section2') {
      renderAppTable('corp');
    }
    if (sectionName === 'section3') {
      const name = 'appClient';
      const savedValues = State.formData[name] || [];
      savedValues.forEach(val => {
        const cb = container.querySelector(`input[name="${name}"][value="${val}"]`);
        if (cb) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change'));
        }
      });
    }

    // 2. Restaurar el resto de campos (incluyendo los generados en las tarjetas)
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(el => {
      // Radios
      if (el.type === 'radio') {
        if (State.formData[el.name] === el.value) el.checked = true;
      }
      // Checkboxes (ya manejados arriba para disparar eventos, pero por seguridad)
      else if (el.type === 'checkbox') {
        const saved = State.formData[el.name] || [];
        if (Array.isArray(saved) && saved.includes(el.value)) el.checked = true;
      }
      // Inputs de texto, select, etc.
      else if (el.id && State.formData[el.id] !== undefined) {
        el.value = State.formData[el.id];
        // Si es un selector de empresa y dice "OTRO", disparar lógica
        if (el.id.endsWith('_empresa')) {
          Apps.setOtroVisibility(el.id.replace('_empresa', ''));
        }
      }
    });

    // Actualizar progreso
    if (sectionName.startsWith('section')) {
      const n = parseInt(sectionName.replace('section', ''));
      updateProgress(n);
      renderDots();
    }
  }

  // ── Helpers de Selects ───────────────────────────────────

  function buildLideresOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un líder...</option>';
    return placeholder + LIDERES.map(l => `<option value="${l}" ${l === selectedValue ? 'selected' : ''}>${l}</option>`).join('');
  }

  function buildCargosOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un cargo...</option>';
    return placeholder + CARGOS.map(c => `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`).join('');
  }

  function buildAreasOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un área...</option>';
    return placeholder + AREAS.map(a => `<option value="${a}" ${a === selectedValue ? 'selected' : ''}>${a}</option>`).join('');
  }

  function buildClientesOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un cliente...</option>';
    return placeholder + CLIENTES.map(c => `<option value="${c}" ${c === selectedValue ? 'selected' : ''}>${c}</option>`).join('');
  }

  function buildProyectosOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un proyecto...</option>';
    return placeholder + PROYECTOS.map(p => `<option value="${p}" ${p === selectedValue ? 'selected' : ''}>${p}</option>`).join('');
  }

  function buildAplicacionesOptions(selectedValue) {
    const placeholder = '<option value="" disabled ' + (!selectedValue ? 'selected' : '') + '>Selecciona un aplicativo...</option>';
    return placeholder + APLICACIONES.map(a => `<option value="${a}" ${a === selectedValue ? 'selected' : ''}>${a}</option>`).join('');
  }

  function poblarSelectLider(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildLideresOptions(val); }
  function poblarSelectCargo(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildCargosOptions(val); }
  function poblarSelectArea(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildAreasOptions(val); }
  function poblarSelectProyecto(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildProyectosOptions(val); }

  // ── Navegación y Progreso ───────────────────────────────

  function renderDots() {
    for (let s = 1; s <= CONFIG.TOTAL_SECTIONS; s++) {
      const el = document.getElementById('dots' + s);
      if (!el) continue;
      el.innerHTML = '';
      for (let i = 1; i <= CONFIG.TOTAL_SECTIONS; i++) {
        const d = document.createElement('div');
        d.className = 'step-dot' + (i === State.currentSection ? ' active' : i < State.currentSection ? ' done' : '');
        el.appendChild(d);
      }
    }
  }

  function updateProgress(section) {
    const fill = document.getElementById('progressFill'), pctLabel = document.getElementById('progressPct'), label = document.getElementById('progressLabel');
    if (!fill) return;
    const pct = Math.round(((section - 1) / CONFIG.TOTAL_SECTIONS) * 100);
    fill.style.width = pct + '%';
    pctLabel.textContent = pct + '%';
    label.textContent = 'SECCIÓN ' + section + ' DE ' + CONFIG.TOTAL_SECTIONS;

    // Mostrar intro solo en Sección 1
    const intro = document.getElementById('formIntro');
    if (intro) intro.style.display = (section === 1) ? 'block' : 'none';
  }

  function showSection(n) {
    State.currentSection = n;
    loadView('section' + n, 'formContent');
  }

  // goNext — el botón "Continuar" llama esta función.
  // Validation.validateSection(n) valida todos los campos
  // de la sección actual antes de avanzar.
  function goNext(n) {
    if (!Validation.validateSection(n)) return;
    showSection(n + 1);
  }

  function goPrev(n) {
    showSection(n - 1);
  }

  // ── Resumen (Confirmación) ──────────────────────────────

  function buildSummary() {
    const box = document.getElementById('summaryBox');
    if (!box) return;

    const v = (id) => State.formData[id] || '—';
    const list = (name) => (State.formData[name] || []).join(', ') || 'Ninguno';

    box.innerHTML = `
      <div style="margin-bottom:15px;">
        <span style="color:var(--cyan);font-weight:700;">[ EMPLEADO ]</span><br>
        Nombre: ${v('nombreCompleto')} | Doc: ${v('documento')}<br>
        Correo: ${v('correo')} | Cargo: ${v('cargo')} | Área: ${v('area')}<br>
        Líder: ${v('lider')} | Asignado Proy: ${v('asignadoProyectos')}
      </div>
      
      <div style="margin-bottom:15px;">
        <span style="color:var(--cyan);font-weight:700;">[ APPS SELECCIONADAS ]</span><br>
        Corporativas: ${(State.formData.appCorpRows || []).map(r => r.app).join(', ') || 'Ninguno'}<br>
        Clientes: ${(State.formData.appClientRows || []).map(r => r.app).join(', ') || 'Ninguno'}
      </div>

      <div style="margin-bottom:15px;">
        <span style="color:var(--cyan);font-weight:700;">[ SEGURIDAD ]</span><br>
        Misma contraseña: ${v('mismaContrasena')} | Compartió creds: ${v('compartidoCredenciales')}<br>
        Accesos sobrantes: ${v('accesosSobrantes')} | Apps personales: ${v('appsPersonales')}
      </div>
      
      <p style="font-size:10px;color:var(--white-muted);line-height:1.4;">
        * Nota: Los detalles específicos de cada aplicativo (clientes, roles, mfa) han sido registrados correctamente para el informe final.
      </p>
    `;
  }

  function checkDeclaration() {
    const btn = document.getElementById('submitBtn');
    const cb = document.getElementById('declaracion');
    if (btn && cb) btn.disabled = !cb.checked;
  }

  // ── Gestión de Modal y Tablas de Aplicativos ──────────────

  function openAppModal(prefix) {
    const modal = document.getElementById('appModal');
    const leaderSelect = document.getElementById('modalLeader');
    const projectSelect = document.getElementById('modalProject');
    const appSelect = document.getElementById('modalAppNameSelect');
    const prefixInput = document.getElementById('modalPrefix');
    const modalTitle = document.getElementById('modalTitle');

    if (prefixInput) prefixInput.value = prefix;
    if (leaderSelect) leaderSelect.innerHTML = buildLideresOptions();
    if (projectSelect) projectSelect.innerHTML = buildProyectosOptions();
    if (appSelect) appSelect.innerHTML = buildAplicacionesOptions();
    
    // Poblar cliente select si es client
    const clientSelect = document.getElementById('modalClient');
    if (clientSelect) clientSelect.innerHTML = buildClientesOptions();

    // Toggle secciones basadas en prefix
    const isClient = prefix === 'client';
    const clientSection = document.getElementById('modalClientSection');
    const accountSection = document.getElementById('modalAccountTypeSection');
    
    if (clientSection) clientSection.style.display = isClient ? 'block' : 'none';
    if (accountSection) accountSection.style.display = isClient ? 'block' : 'none';

    if (modalTitle) {
      modalTitle.textContent = isClient ? 'Nuevo Aplicativo de Cliente' : 'Nuevo Aplicativo Corporativo';
    }

    // Limpiar campos
    ['modalAppNameSelect', 'modalAppName', 'modalProject', 'modalProjectManual', 'modalClient', 'modalClientManual', 'modalRole'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    
    // Resetear radios
    document.querySelectorAll('input[name="modalMFA"]').forEach(rb => rb.checked = false);
    document.querySelectorAll('input[name="modalAccountType"]').forEach(rb => rb.checked = false);

    // Ocultar campos manuales por defecto
    ['modalAppNameManualContainer', 'modalProjectManualContainer', 'modalClientManualContainer'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    if (modal) modal.classList.add('active');
  }

  function toggleModalAppNameManual() {
    const sel = document.getElementById('modalAppNameSelect');
    const container = document.getElementById('modalAppNameManualContainer');
    if (sel && container) {
      container.style.display = (sel.value === 'OTRO') ? 'block' : 'none';
    }
  }

  function toggleModalProjectManual() {
    const sel = document.getElementById('modalProject');
    const container = document.getElementById('modalProjectManualContainer');
    if (sel && container) {
      container.style.display = (sel.value === 'OTRO') ? 'block' : 'none';
    }
  }

  function toggleModalClientManual() {
    const sel = document.getElementById('modalClient');
    const container = document.getElementById('modalClientManualContainer');
    if (sel && container) {
      container.style.display = (sel.value === 'OTRO') ? 'block' : 'none';
    }
  }

  function closeAppModal() {
    const modal = document.getElementById('appModal');
    if (modal) modal.classList.remove('active');
  }

  function saveAppFromModal() {
    const prefix = document.getElementById('modalPrefix').value;
    const appSelect = document.getElementById('modalAppNameSelect').value;
    let app = appSelect;
    if (appSelect === 'OTRO') {
      app = document.getElementById('modalAppName').value;
    }

    const projectSelect = document.getElementById('modalProject').value;
    let project = projectSelect;
    if (projectSelect === 'OTRO') {
      project = document.getElementById('modalProjectManual').value;
    }

    const rol = document.getElementById('modalRole').value;
    const lider = document.getElementById('modalLeader').value;
    
    const mfaChecked = document.querySelector('input[name="modalMFA"]:checked');
    const mfa = mfaChecked ? mfaChecked.value : '';

    // Datos extra para clientes
    let empresa = 'EXPERIMENTALITY';
    let cuenta = '';
    if (prefix === 'client') {
      const clientSelect = document.getElementById('modalClient').value;
      empresa = clientSelect;
      if (clientSelect === 'OTRO') {
        empresa = document.getElementById('modalClientManual').value;
      }
      const accChecked = document.querySelector('input[name="modalAccountType"]:checked');
      cuenta = accChecked ? accChecked.value : '';
    }

    if (!app || !project || !rol || !lider || !mfa || (prefix === 'client' && (!empresa || !cuenta))) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const row = { 
      app, project, rol, lider, mfa, empresa, cuenta, 
      tipo: prefix === 'corp' ? 'Corporativo' : 'Cliente' 
    };
    
    const key = prefix === 'corp' ? 'appCorpRows' : 'appClientRows';
    if (!State.formData[key]) State.formData[key] = [];
    State.formData[key].push(row);

    closeAppModal();
    renderAppTable(prefix);
  }

  function renderAppTable(prefix) {
    const key = prefix === 'corp' ? 'appCorpRows' : 'appClientRows';
    const container = document.getElementById(`${prefix}AppTableContainer`);
    const body = document.getElementById(`${prefix}AppTableBody`);
    const data = State.formData[key] || [];

    if (!container || !body) return;

    if (data.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    body.innerHTML = data.map((row, idx) => `
      <tr>
        <td>${row.app}</td>
        ${prefix === 'client' ? `<td>${row.empresa}</td>` : ''}
        <td>${row.project}</td>
        <td>${row.rol}</td>
        <td>${row.lider}</td>
        ${prefix === 'client' ? `<td>${row.cuenta}</td>` : ''}
        <td><span class="badge" style="background:${row.mfa === 'Si' ? 'rgba(0,184,122,0.1)' : 'rgba(255,71,87,0.1)'}; color:${row.mfa === 'Si' ? '#00b87a' : '#ff4757'};">${row.mfa}</span></td>
        <td>
          <button class="btn-delete" onclick="UI.deleteAppEntry('${prefix}', ${idx})">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  function deleteAppEntry(prefix, index) {
    const key = prefix === 'corp' ? 'appCorpRows' : 'appClientRows';
    if (State.formData[key]) {
      State.formData[key].splice(index, 1);
      renderAppTable(prefix);
    }
  }

  return {
    loadView, buildLideresOptions, poblarSelectLider, poblarSelectCargo, poblarSelectArea,
    repoblarLideresEnCards: () => { }, // Obsoleto en este modelo
    buildClientesOptions, renderDots, updateProgress, showSection, goNext, goPrev,
    toggleSobrantes: (show) => {
      const el = document.getElementById('sobrantesContainer');
      if (el) el.style.display = show ? 'block' : 'none';
    },
    checkDeclaration,
    openAppModal, toggleModalAppNameManual, toggleModalProjectManual, toggleModalClientManual, closeAppModal, saveAppFromModal, renderAppTable, deleteAppEntry
  };

})();
