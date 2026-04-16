document.addEventListener('DOMContentLoaded', async () => {
  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' || 
                  window.location.protocol === 'file:';

  if (isLocal) {
    // Autologin para facilitar pruebas locales
    State.googleUser = { 
      name: 'Tester Local', 
      email: 'tester.local@experimentality.co', 
      picture: 'https://ui-avatars.com/api/?name=Tester+Local&background=0ea5a0&color=fff' 
    };
    await UI.loadView('form-shell', 'app');
    await UI.loadView('section1', 'formContent');
  } else {
    // Producción: requerir Google Sign-In
    await UI.loadView('login', 'app');
  }
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
