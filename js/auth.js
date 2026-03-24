const Auth = (() => {

  function init() {
    // El botón llama a signIn() directamente
  }

  function signIn() {
    const btn = document.getElementById('googleSignInBtn');
    btn.style.opacity = '0.7';
    btn.style.pointerEvents = 'none';
    btn.textContent = 'Conectando con Google...';

    if (typeof google === 'undefined') {
      _showError('No se pudo cargar Google Sign-In. Verifica tu conexión.');
      _resetBtn();
      return;
    }

    let timeoutId = setTimeout(() => {
      _showError('La conexión con Google tardó demasiado. Por favor, intenta de nuevo.');
      _resetBtn();
    }, 45000); // 45 segundos de timeout

    const client = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: (tokenResponse) => {
        clearTimeout(timeoutId);
        if (tokenResponse.error) {
          _showError('Error al autenticar: ' + (tokenResponse.error_description || tokenResponse.error));
          _resetBtn();
          return;
        }
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: 'Bearer ' + tokenResponse.access_token },
        })
          .then(r => r.json())
          .then(profile => _handleProfile(profile))
          .catch((err) => { 
            console.error('UserInfo Fetch Error:', err);
            _showError('No se pudo obtener el perfil. Intenta de nuevo.'); 
            _resetBtn(); 
          });
      },
      error_callback: (err) => {
        clearTimeout(timeoutId);
        console.error('GSI Error:', err);
        _showError('Error de Google Sign-In: ' + (err.message || 'Error de conexión'));
        _resetBtn();
      }
    });

    client.requestAccessToken({ prompt: 'select_account' });
  }

  async function _handleProfile(profile) {
    const email = (profile.email || '').toLowerCase();
    const domain = email.split('@')[1] || '';

    if (domain !== CONFIG.ALLOWED_DOMAIN) {
      _showError(
        `❌ Acceso denegado.\n\nSolo cuentas @${CONFIG.ALLOWED_DOMAIN} pueden acceder.\nCorreo detectado: ${email}`
      );
      _resetBtn();
      return;
    }

    State.googleUser = profile;

    // Cargar el shell del formulario y luego la primera sección
    await UI.loadView('form-shell', 'app');
    await UI.loadView('section1', 'formContent');
  }

  function signOut() {
    State.googleUser = null;
    UI.loadView('login', 'app');
  }

  function _showError(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.style.display = 'block';
    el.style.whiteSpace = 'pre-line';
  }

  function _resetBtn() {
    const btn = document.getElementById('googleSignInBtn');
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    btn.innerHTML = `
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" height="20" alt="Google">
      Iniciar sesión con Google`;
  }

  return { init, signIn, signOut };
})();
