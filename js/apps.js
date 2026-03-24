const Apps = (() => {

  function bindCheckboxGroup(name, containerId, isClient) {
    document.querySelectorAll(`input[name="${name}"]`).forEach(cb => {
      cb.addEventListener('change', () => _buildCards(name, containerId, isClient));
    });
  }

  // ── Helpers Internos (Deben estar definidos para ser llamados) ──────

  function _renderAddBtn(container, prefix, isClient) {
    const btnHtml = `
      <div style="margin-top:24px; text-align:center;">
        <button type="button" class="btn btn-ghost" style="width:100%; font-size:12px; border: 1px dashed var(--border);" onclick="Apps.addCustomApp('${prefix}', ${isClient})">
          + Agregar otro aplicativo (No listado arriba)
        </button>
      </div>`;
    container.insertAdjacentHTML('beforeend', btnHtml);
  }

  function _rowHTML(prefix, safe, rowIdx, isClient) {
    const uid = `${prefix}_${safe}_r${rowIdx}`;
    const rowLabel = isClient ? `PROYECTO ${rowIdx + 1}` : 'ACCESO';
    
    const deleteBtn = rowIdx > 0
      ? `<button type="button" onclick="Apps.removeClientRow('${prefix}','${safe}',${rowIdx})" class="btn-ghost" style="color:var(--red);padding:4px 8px;font-size:11px;float:right;">✕ Eliminar</button>` 
      : '';

    const liderField = `
      <div class="mini-field">
        <div class="mini-label">LÍDER RESPONSABLE <span class="required">*</span></div>
        <select id="${uid}_lider" class="form-select" style="padding:8px 32px 8px 10px; font-size:12px;">
          ${UI.buildLideresOptions()}
        </select>
      </div>`;

    const clientSelect = `
      <div class="mini-field">
        <div class="mini-label">EMPRESA / CLIENTE <span class="required">*</span></div>
        <select id="${uid}_empresa" class="form-select" style="padding:8px 32px 8px 10px; font-size:12px;" onchange="Apps.setOtroVisibility('${uid}')">
          ${UI.buildClientesOptions(isClient ? '' : 'EXPERIMENTALITY')}
        </select>
      </div>
      <div class="mini-field" id="otro_container_${uid}" style="display:none;">
        <div class="mini-label">NOMBRE DE LA EMPRESA <span class="required">*</span></div>
        <input type="text" id="${uid}_nombre_otro" placeholder="Escribe el nombre">
      </div>`;

    const commonFields = `
      ${clientSelect}
      <div class="mini-field">
        <div class="mini-label">PROYECTO <span class="required">*</span></div>
        <input type="text" id="${uid}_proyecto" placeholder="Nombre proyecto">
      </div>
      <div class="mini-field">
        <div class="mini-label">ROL / ACCESO <span class="required">*</span></div>
        <input type="text" id="${uid}_rol" placeholder="Ej. Developer">
      </div>
      ${liderField}`;

    const accountAndMfa = isClient ? `
      <div class="mini-field">
        <div class="mini-label">TIPO DE CUENTA <span class="required">*</span></div>
        <div class="mini-option-group">
          <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Individual"> Ind.</label>
          <label class="mini-option"><input type="radio" name="${uid}_cuenta" value="Compartida"> Comp.</label>
        </div>
      </div>` : '';

    return `
      <div class="client-row" id="row_${uid}" style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:10px;font-family:'IBM Plex Mono',monospace;color:var(--cyan);">${rowLabel}</span>
          ${deleteBtn}
        </div>
        ${commonFields}
        ${accountAndMfa}
        <div class="mini-field">
          <div class="mini-label">¿MFA / 2FA HABILITADO? <span class="required">*</span></div>
          <div class="mini-option-group">
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="Si"> Sí</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No"> No</label>
            <label class="mini-option"><input type="radio" name="${uid}_mfa" value="No sabe"> ?</label>
          </div>
        </div>
      </div>`;
  }

  function _cardHTML(prefix, app, isClient, isCustom = false) {
    const safe = app.replace(/\s+/g, '_');
    const key = `${prefix}_${safe}`;
    if (!State.rowCounts[key]) State.rowCounts[key] = 1;

    let rowsHtml = '';
    for (let i = 0; i < State.rowCounts[key]; i++)
      rowsHtml += _rowHTML(prefix, safe, i, isClient);

    const nameDisplay = isCustom
      ? `<input type="text" id="customname_${key}" placeholder="Nombre app" 
            style="background:transparent;border:none;border-bottom:1px solid rgba(45,232,176,0.3);color:var(--cyan);font-weight:600;outline:none;">`
      : app;

    const deleteBtn = isCustom
      ? `<button type="button" onclick="Apps.removeCustomApp('${prefix}','${safe}')" class="btn-ghost" style="padding:4px 8px;font-size:11px;">✕ Quitar</button>` 
      : '';

    const addBtn = isClient ? `
      <button type="button" onclick="Apps.addClientRow('${prefix}','${safe}',true)" class="btn-ghost" style="width:100%;font-size:12px;margin-top:8px;">
        + Agregar otro cliente
      </button>` : '';

    return `
      <div class="app-detail-card" id="appcard_${key}" style="margin-bottom:16px;">
        <div class="app-detail-card-title" style="display:flex;justify-content:space-between;align-items:center;">
          <span>${nameDisplay}</span>${deleteBtn}
        </div>
        <div id="rows_${key}">${rowsHtml}</div>
        ${addBtn}
      </div>`;
  }

  function _buildCards(name, containerId, isClient) {
    const prefix = isClient ? 'client' : 'corp';
    const container = document.getElementById(containerId);
    if (!container) return;

    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)]
      .map(c => c.value);
    
    const hasCustom = Object.keys(State.rowCounts).some(k => k.startsWith(`${prefix}_custom`));

    // Si no hay nada seleccionado, vaciamos y ponemos el botón de "Agregar otro"
    if (!checked.length && !hasCustom) {
      container.innerHTML = '';
      _renderAddBtn(container, prefix, isClient);
      return;
    }

    container.innerHTML = `<div class="app-detail-title">DETALLE POR APLICATIVO</div>`;
    checked.forEach(app => container.insertAdjacentHTML('beforeend', _cardHTML(prefix, app, isClient)));

    // Re-renderizar custom cards preservadas
    Object.keys(State.rowCounts)
      .filter(k => k.startsWith(`${prefix}_custom`))
      .forEach(key => {
        const safe = key.replace(`${prefix}_`, '');
        if (!document.getElementById(`appcard_${key}`)) {
          container.insertAdjacentHTML('beforeend', _cardHTML(prefix, safe, isClient, true));
        }
      });

    // Añadir el botón de "Agregar otro" al final
    _renderAddBtn(container, prefix, isClient);
  }

  // ── Gestión dinámica (Expuesto en el REPL) ──────────────────

  function setOtroVisibility(uid) {
    const sel = document.getElementById(`${uid}_empresa`);
    const container = document.getElementById(`otro_container_${uid}`);
    if (sel && container) {
      container.style.display = (sel.value === 'OTRO') ? 'block' : 'none';
    }
  }

  function addClientRow(prefix, safe, isClient) {
    const key = `${prefix}_${safe}`;
    const count = State.rowCounts[key] || 1;
    State.rowCounts[key] = count + 1;
    const container = document.getElementById(`rows_${key}`);
    if (container) {
      container.insertAdjacentHTML('beforeend', _rowHTML(prefix, safe, count, isClient));
    }
  }

  function removeClientRow(prefix, safe, rowIdx) {
    const el = document.getElementById(`row_${prefix}_${safe}_r${rowIdx}`);
    if (el) el.remove();
  }

  function addCustomApp(prefix, isClient) {
    State.customAppCounter++;
    const safe = `custom_app_${State.customAppCounter}`;
    const key = `${prefix}_${safe}`;
    State.rowCounts[key] = 1;

    const containerId = (prefix === 'corp') ? 'corpAppDetails' : 'clientAppDetails';
    const container = document.getElementById(containerId);
    if (!container) return;

    // Buscamos el div que contiene el botón de "Agregar otro" para insertar ANTES
    const btnRow = container.querySelector('div[style*="text-align:center"]');
    if (btnRow) {
      btnRow.insertAdjacentHTML('beforebegin', _cardHTML(prefix, safe, isClient, true));
    } else {
      container.insertAdjacentHTML('beforeend', _cardHTML(prefix, safe, isClient, true));
    }
  }

  function removeCustomApp(prefix, safe) {
    const card = document.getElementById(`appcard_${prefix}_${safe}`);
    if (card) card.remove();
    delete State.rowCounts[`${prefix}_${safe}`];
  }

  function gatherDetails(name, isClient) {
    const prefix = isClient ? 'client' : 'corp';
    const results = [];
    const checked = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(c => c.value);

    // Las custom apps tienen llaves como "corp_custom_app_1"
    const customAppKeys = Object.keys(State.rowCounts).filter(k => k.startsWith(`${prefix}_custom_app_`));

    const collect = (safe, appName) => {
      const key = `${prefix}_${safe}`;
      for (let i = 0; i < 50; i++) {
        const uid = `${prefix}_${safe}_r${i}`;
        const row = document.getElementById(`row_${uid}`);
        if (!row) continue;

        const gv = s => { const el = document.getElementById(`${uid}_${s}`); return el ? el.value : ''; };
        const rv = s => { const el = row.querySelector(`input[name="${uid}_${s}"]:checked`); return el ? el.value : ''; };

        let empresa = gv('empresa');
        if (empresa === 'OTRO') empresa = gv('nombre_otro');

        results.push({
          app: appName, empresa, proyecto: gv('proyecto'), rol: gv('rol'), lider: gv('lider'), 
          cuenta: rv('cuenta'), mfa: rv('mfa'), tipo: isClient ? 'Cliente' : 'Corporativo'
        });
      }
    };

    checked.forEach(app => collect(app.replace(/\s+/g, '_'), app));
    customAppKeys.forEach(key => {
      const safe = key.replace(`${prefix}_`, '');
      const el = document.getElementById(`customname_${key}`);
      collect(safe, el ? el.value : 'App Personalizada');
    });
    
    return results;
  }

  return { bindCheckboxGroup, addClientRow, removeClientRow, addCustomApp, removeCustomApp, gatherDetails, setOtroVisibility };
})();
