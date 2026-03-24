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
      Apps.bindCheckboxGroup('appCorp', 'corpAppDetails', false);
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
    if (sectionName === 'section2' || sectionName === 'section3') {
      const name = sectionName === 'section2' ? 'appCorp' : 'appClient';
      const savedValues = State.formData[name] || [];
      savedValues.forEach(val => {
        const cb = container.querySelector(`input[name="${name}"][value="${val}"]`);
        if (cb) {
          cb.checked = true;
          // Disparamos manualmente el cambio para que Apps cree las tarjetas
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

  function poblarSelectLider(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildLideresOptions(val); }
  function poblarSelectCargo(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildCargosOptions(val); }
  function poblarSelectArea(id, val) { const el = document.getElementById(id); if (el) el.innerHTML = buildAreasOptions(val); }

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
        Corporativas: ${list('appCorp')}<br>
        Clientes: ${list('appClient')}
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

  return {
    loadView, buildLideresOptions, poblarSelectLider, poblarSelectCargo, poblarSelectArea,
    repoblarLideresEnCards: () => { }, // Obsoleto en este modelo
    buildClientesOptions, renderDots, updateProgress, showSection, goNext, goPrev,
    toggleSobrantes: (show) => {
      const el = document.getElementById('sobrantesContainer');
      if (el) el.style.display = show ? 'block' : 'none';
    },
    checkDeclaration
  };

})();
