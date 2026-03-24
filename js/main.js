document.addEventListener('DOMContentLoaded', async () => {
  // --- MODO DESARROLLO (SALTAR LOGIN) ---
  // Revertir esto para pasar al modo de producción con login de Google.
  // State.googleUser = {
  //   name: 'Usuario de Pruebas',
  //   email: 'test@experimentality.co',
  //   picture: 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png'
  // };

  // Skip Login: Cargamos el Shell principal en el div #app directamente
  await UI.loadView('login', 'app'); // Comentado para local
  await UI.loadView('form-shell', 'app');

  // Iniciamos la sección 1 dentro del div #formContent del Shell
  UI.showSection(1);
});

// ── Bridge: navegación ──────────────────────────────────────
function goNext(n) { UI.goNext(n); }
function goPrev(n) { UI.goPrev(n); }

// ── Bridge: UI ─────────────────────────────────────────────
function toggleSobrantes(show) { UI.toggleSobrantes(show); }
function checkDeclaration() { UI.checkDeclaration(); }

// ── Bridge: apps dinámicos ──────────────────────────────────
function addClientRow(prefix, safe, isClient) { Apps.addClientRow(prefix, safe, isClient); }
function removeClientRow(prefix, safe, rowIdx) { Apps.removeClientRow(prefix, safe, rowIdx); }
function addCustomApp(prefix, isClient) { Apps.addCustomApp(prefix, isClient); }
function removeCustomApp(prefix, safe) { Apps.removeCustomApp(prefix, safe); }

// ── Bridge: submit ──────────────────────────────────────────
function submitForm() { Submit.send(); }
function downloadResponses() { Submit.download(); }

// ── Bridge: auth ────────────────────────────────────────────
function initGoogleSignIn() { Auth.signIn(); }
function signOut() { Auth.signOut(); }
