const Templates = {
  login: `
    <div id="loginScreen">
      <div class="login-card">
        <div style="margin-bottom: 24px;">
          <img src="https://experimentalityes.vtexassets.com/assets/vtex.file-manager-graphql/images/7d7cb0e0-c390-432b-9b37-f00839262b5c___89a2f9ff4738f9a736d2319142ceeda9.png" alt="Experimentality Logo" style="width: 140px; height: auto;">
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#f0f4ff;margin-bottom:8px;">Acceso Restringido</h2>
        <p style="font-size:13px;color:var(--white-dim);line-height:1.6;margin-bottom:20px;">Este formulario es exclusivo para empleados de Experimentality. Inicia sesión con tu cuenta corporativa para continuar.</p>
        <div style="display:inline-flex;align-items:center;gap:6px;background:var(--cyan-dim);border:1px solid var(--border);border-radius:100px;padding:5px 14px;font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--cyan);margin-bottom:28px;">
          <span style="width:6px;height:6px;background:var(--cyan);border-radius:50%;display:inline-block;"></span>
          Solo cuentas @experimentality.co
        </div>
        <br>
        <button id="googleSignInBtn" onclick="initGoogleSignIn()">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google">
          Iniciar sesión con Google
        </button>
        <div id="loginError" style="display:none;margin-top:16px;background:rgba(255,71,87,0.1);border:1px solid rgba(255,71,87,0.3);border-radius:8px;padding:10px 14px;font-size:12px;color:#ff6b78;font-family:'IBM Plex Mono',monospace;line-height:1.5;white-space:pre-line;"></div>
        <p style="margin-top:24px;font-size:11px;color:var(--white-muted);font-family:'IBM Plex Mono',monospace;line-height:1.6;">Al iniciar sesión aceptas que tu identidad<br>quedará registrada en esta auditoría.</p>
      </div>
    </div>
  `,

  'form-shell': `
    <header class="app-header">
      <div class="header-banner-wrap">
        <img src="img/header.png" alt="Header Banner" class="header-banner">
      </div>
      <div id="userBadge" class="user-badge" style="display:none;">
        <img id="userAvatar" src="" alt="Avatar">
        <div class="user-meta">
          <span id="userName" class="user-name"></span>
          <button onclick="signOut()" class="sign-out-btn">Cerrar sesión</button>
        </div>
      </div>
    </header>

    <div class="container" style="padding-top: 20px;">
      <!-- Introducción solo visible en S1 -->
      <div id="formIntro" style="display:none; margin-bottom:32px; text-align:center;">
        <div class="header-badge"><span>Auditoría de Seguridad · Confidencial</span></div>
        <h1 style="font-size: clamp(24px, 5vw, 36px); font-weight: 700; color: var(--white); margin-bottom: 12px; letter-spacing: -0.02em;">Sondeo de Validación de <span style="color:var(--cyan)">Accesos</span></h1>
        <p style="font-size: 15px; line-height: 1.7; color: var(--white-dim); max-width: 700px; margin: 0 auto;">
          El objetivo de este sondeo es garantizar que cada integrante del equipo cuente con los permisos adecuados para desempeñar su labor de forma segura y eficiente.
          Su participación es fundamental para cumplir con los estándares de ciberseguridad corporativa.
        </p>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-info">
          <span class="progress-label" id="progressLabel">SECCIÓN 1 DE 5</span>
          <span class="progress-pct" id="progressPct">0%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>
      </div>
      
      <div id="formContent"></div>
    </div>

    <!-- Modal Global para agregar aplicativos -->
    <div id="appModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="modalTitle">Nuevo Aplicativo</h3>
          <button class="modal-close" onclick="UI.closeAppModal()">&times;</button>
        </div>
        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <input type="hidden" id="modalPrefix">
          
          <div id="modalClientSection" class="field" style="display:none;">
            <label class="field-label">Empresa / Cliente <span class="required">*</span></label>
            <select id="modalClient" class="form-select" onchange="UI.toggleModalClientManual()"></select>
            <div id="modalClientManualContainer" style="display:none; margin-top:10px;">
              <input type="text" id="modalClientManual" placeholder="Escribe el nombre de la empresa">
            </div>
          </div>

          <div class="field">
            <label class="field-label">Nombre del Aplicativo <span class="required">*</span></label>
            <select id="modalAppNameSelect" class="form-select" onchange="UI.toggleModalAppNameManual()"></select>
            <div id="modalAppNameManualContainer" style="display:none; margin-top:10px;">
              <input type="text" id="modalAppName" placeholder="Escribe el nombre del aplicativo">
            </div>
          </div>
          
          <div class="field">
            <label class="field-label">Proyecto <span class="required">*</span></label>
            <select id="modalProject" class="form-select" onchange="UI.toggleModalProjectManual()"></select>
            <div id="modalProjectManualContainer" style="display:none; margin-top:10px;">
              <input type="text" id="modalProjectManual" placeholder="Escribe el nombre del proyecto">
            </div>
          </div>

          <div class="field">
            <label class="field-label">Rol / Acceso <span class="required">*</span></label>
            <input type="text" id="modalRole" placeholder="Ej. Administrador, Visualizador">
          </div>

          <div class="field">
            <label class="field-label">Líder Responsable <span class="required">*</span></label>
            <select id="modalLeader" class="form-select"></select>
          </div>

          <div id="modalAccountTypeSection" class="field" style="display:none;">
            <label class="field-label">Tipo de Cuenta <span class="required">*</span></label>
            <div class="option-group inline">
              <label class="option-item"><input type="radio" name="modalAccountType" value="Individual"><span>Individual</span></label>
              <label class="option-item"><input type="radio" name="modalAccountType" value="Compartida"><span>Compartida</span></label>
            </div>
          </div>

          <div class="field">
            <label class="field-label">¿MFA Habilitado? <span class="required">*</span></label>
            <div class="option-group inline">
              <label class="option-item"><input type="radio" name="modalMFA" value="Si"><span>Sí</span></label>
              <label class="option-item"><input type="radio" name="modalMFA" value="No"><span>No</span></label>
              <label class="option-item"><input type="radio" name="modalMFA" value="No sabe"><span>No sabe</span></label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="UI.closeAppModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="UI.saveAppFromModal()">Agregar</button>
        </div>
      </div>
    </div>
  `,

  section1: `
    <div class="section-card active" id="section1">
      <div class="section-header">
        <div class="section-number">01</div>
        <div class="section-title-wrap"><h2>Información del Empleado</h2><p>Identificación y ubicación</p></div>
      </div>
      <div class="section-body">
        <div class="two-col">
          <div class="field">
            <label class="field-label">Nombre completo <span class="required">*</span></label>
            <input type="text" id="nombreCompleto" required disabled>
          </div>
          <div class="field">
            <label class="field-label">Documento de identidad <span class="required">*</span></label>
            <input type="number" id="documento" required>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Correo corporativo <span class="required">*</span></label>
          <input type="email" id="correo" required disabled>
        </div>
        <div class="two-col">
          <div class="field">
            <label class="field-label">Cargo <span class="required">*</span></label>
            <select id="cargo" class="form-select"></select>
          </div>
          <div class="field">
            <label class="field-label">Área <span class="required">*</span></label>
            <select id="area" class="form-select"></select>
          </div>
        </div>
        <div class="field">
          <label class="field-label">Líder inmediato <span class="required">*</span></label>
          <select id="lider" class="form-select"></select>
        </div>
        <div class="field">
          <label class="field-label">¿Actualmente se encuentra asignado a proyectos? <span class="required">*</span></label>
          <div class="option-group inline">
            <label class="option-item"><input type="radio" name="asignadoProyectos" value="Si"><span>Sí</span></label>
            <label class="option-item"><input type="radio" name="asignadoProyectos" value="No"><span>No</span></label>
          </div>
        </div>
      </div>
      <div class="nav-buttons">
        <div class="step-dots" id="dots1"></div>
        <button class="btn btn-primary" onclick="goNext(1)">
          Continuar
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `,

  section2: `
    <div class="section-card active fullscreen-view" id="section2">
      <div class="section-header">
        <div class="section-number">02</div>
        <div class="section-title-wrap"><h2>Aplicativos Corporativos</h2><p>Acceso a herramientas de la empresa</p></div>
      </div>
      <div class="section-body">
        <div class="field">
          <label class="field-label">¿A cuáles aplicativos de Experimentality tienes acceso? <span class="badge">Registro por aplicativo</span></label>
          <button type="button" class="btn btn-ghost" style="width:100%; justify-content:center; border-style:dashed;" onclick="UI.openAppModal('corp')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar Aplicativo Corporativo
          </button>
        </div>
        
        <div id="corpAppTableContainer" class="app-table-container" style="display:none; margin-top:20px;">
          <div class="app-detail-title">APLICATIVOS REGISTRADOS</div>
          <table class="app-table">
            <thead>
              <tr>
                <th>Aplicativo</th>
                <th>Proyecto</th>
                <th>Rol</th>
                <th>Líder</th>
                <th>MFA</th>
                <th style="width:40px;"></th>
              </tr>
            </thead>
            <tbody id="corpAppTableBody"></tbody>
          </table>
        </div>
      </div>

      <div class="nav-buttons">
        <button class="btn btn-ghost" onclick="goPrev(2)">Anterior</button>
        <div class="step-dots" id="dots2"></div>
        <button class="btn btn-primary" onclick="goNext(2)">Continuar</button>
      </div>
    </div>
  `,

  section3: `
    <div class="section-card active fullscreen-view" id="section3">
      <div class="section-header">
        <div class="section-number">03</div>
        <div class="section-title-wrap"><h2>Aplicativos del Cliente</h2><p>Acceso a herramientas del cliente</p></div>
      </div>
      <div class="section-body">
        <div class="field">
          <label class="field-label">¿A cuáles aplicativos del cliente tiene acceso? <span class="badge">Registro por aplicativo</span></label>
          <button type="button" class="btn btn-ghost" style="width:100%; justify-content:center; border-style:dashed;" onclick="UI.openAppModal('client')">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:8px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar Aplicativo de Cliente
          </button>
        </div>
        
        <div id="clientAppTableContainer" class="app-table-container" style="display:none; margin-top:20px;">
          <div class="app-detail-title">APLICATIVOS DE CLIENTE REGISTRADOS</div>
          <table class="app-table">
            <thead>
              <tr>
                <th>Aplicativo</th>
                <th>Cliente</th>
                <th>Proyecto</th>
                <th>Rol</th>
                <th>Líder Responsable</th>
                <th>Cuenta</th>
                <th>MFA</th>
                <th style="width:40px;"></th>
              </tr>
            </thead>
            <tbody id="clientAppTableBody"></tbody>
          </table>
        </div>
      </div>

      <div class="nav-buttons">
        <button class="btn btn-ghost" onclick="goPrev(3)">Anterior</button>
        <div class="step-dots" id="dots3"></div>
        <button class="btn btn-primary" onclick="goNext(3)">Continuar</button>
      </div>
    </div>
  `,

  section4: `
    <div class="section-card active" id="section4">
      <div class="section-header">
        <div class="section-number">04</div>
        <div class="section-title-wrap"><h2>Buenas Prácticas</h2><p>Seguridad de la información</p></div>
      </div>
      <div class="section-body">
        <div class="field">
          <label class="field-label">¿Utiliza la misma contraseña en más de un sistema?</label>
          <div class="option-group inline">
            <label class="option-item"><input type="radio" name="mismaContrasena" value="Si"><span>Sí</span></label>
            <label class="option-item"><input type="radio" name="mismaContrasena" value="No"><span>No</span></label>
          </div>
        </div>
        <div class="field">
          <label class="field-label">¿Ha compartido credenciales?</label>
          <div class="option-group inline">
            <label class="option-item"><input type="radio" name="compartidoCredenciales" value="Si"><span>Sí</span></label>
            <label class="option-item"><input type="radio" name="compartidoCredenciales" value="No"><span>No</span></label>
          </div>
        </div>
        <div class="field">
          <label class="field-label">¿Considera que tiene acceso a sistemas que ya no necesita por su labor actual?</label>
          <div class="option-group inline">
            <label class="option-item"><input type="radio" name="accesosSobrantes" value="Si" onclick="toggleSobrantes(true)"><span>Sí</span></label>
            <label class="option-item"><input type="radio" name="accesosSobrantes" value="No" onclick="toggleSobrantes(false)"><span>No</span></label>
          </div>
        </div>
        <div class="field" id="sobrantesContainer" style="display:none;">
          <label class="field-label">¿A cuáles aplicativos o carpetas ya no debería tener acceso?</label>
          <textarea id="cualesAccesos" placeholder="Ej. Carpeta PROYECTO X, Acceso a Azure Dev..."></textarea>
        </div>
        <div class="field">
          <label class="field-label">¿Utiliza aplicaciones personales para el almacenamiento o envío de información corporativa?</label>
          <div class="option-group inline">
            <label class="option-item"><input type="radio" name="appsPersonales" value="Si"><span>Sí</span></label>
            <label class="option-item"><input type="radio" name="appsPersonales" value="No"><span>No</span></label>
          </div>
        </div>
      </div>
      <div class="nav-buttons">
        <button class="btn btn-ghost" onclick="goPrev(4)">Anterior</button>
        <div class="step-dots" id="dots4"></div>
        <button class="btn btn-primary" onclick="goNext(4)">Continuar</button>
      </div>
    </div>
  `,

  section5: `
    <div class="section-card active" id="section5">
      <div class="section-header">
        <div class="section-number">05</div>
        <div class="section-title-wrap"><h2>Confirmación</h2><p>Resumen y envío</p></div>
      </div>
      <div class="section-body">
        <div id="summaryBox" style="background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:10px; padding:20px; font-family:'IBM Plex Mono',monospace; font-size:12px; line-height:1.7; margin-bottom:24px;"></div>
        <div class="declaration-box">
          <input type="checkbox" id="declaracion" onchange="checkDeclaration()">
          <p class="declaration-text">Confirmo que la información suministrada es veraz y corresponde a los accesos que actualmente poseo.</p>
        </div>
      </div>
      <div class="nav-buttons">
        <button class="btn btn- ghost" onclick="goPrev(5)">Anterior</button>
        <button class="btn btn-success" id="submitBtn" onclick="submitForm()" disabled>Enviar Formulario</button>
      </div>
    </div>
  `,

  success: `
    <div class="success-screen show" id="successScreen">
      <div class="success-icon">✓</div>
      <h2>¡Formulario enviado!</h2>
      <p>Tu auditoría ha sido registrada con éxito.</p>
      <div class="ref-code" id="refCode"></div>
      <br><br>
      <button class="btn btn-ghost" onclick="downloadResponses()">Descargar respuestas (JSON)</button>
    </div>
  `
};
