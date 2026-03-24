const CONFIG = Object.freeze({
  // Leídas desde env.js (no hardcodeadas aquí)
  GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
  APPS_SCRIPT_URL: ENV.APPS_SCRIPT_URL,
  ALLOWED_DOMAIN: ENV.ALLOWED_DOMAIN,
  // Constantes de la app (no sensibles, sí van en repo)
  TOTAL_SECTIONS: 5,
});

// ── Lista de líderes ──────────────────────────────────────
// Para agregar o quitar líderes, edita este array y haz push.
const LIDERES = Object.freeze([
  'Sebastian Cuervo Aransazo',
  'Karen Johana Reyes Rivera',
  'Johan Stivens Carmona Giraldo',
  'Maria Isabel Gomez Londoño',
]);

// ── Lista de cargos ────────────────────────────────────────
const CARGOS = Object.freeze([
  'Practicante Developer',
  'Practicante QA',
  'Practicante Frontend',
  'Practicante UI/UX',
  'Desarrollador Junior',
  'Desarrollador Senior',
  'Desarrollador Master',
  'Líder Técnico / Tech Lead',
  'Arquitecto de Software',
  'Analista de QA / Testing',
  'Diseñador UI/UX',
  'Analista de Datos / Analítica',
  'Desarrollador VTEX',
  'Product Owner / Product Manager',
  'Scrum Master / Project Manager',
  'Nómina / Contabilidad',
  'GGHH / Talento Humano',
  'Director de Tecnología',
  'Director Administrativo',
]);

// ── Lista de áreas ─────────────────────────────────────────
const AREAS = Object.freeze([
  'Tecnología / TI',
  'Operaciones',
  'Gestión Humana / RRHH',
  'Administración',
  'Finanzas / Contabilidad',
  'Comercial / Ventas',
  'Marketing',
  'Diseño / UX',
  'Soporte Técnico',
  'Calidad / QA',
  'Analítica de Datos',
  'Legal / Auditoría',
]);

// ── Lista de clientes ────────────────────────────────────────
const CLIENTES = Object.freeze([
  'EXPERIMENTALITY',
  'SURA',
  'SOLLA',
  'EXITO',
  'GRUPO NUTRESA',
  'SURAMERICANA',
  'BANCO DE BOGOTÁ',
  'ALKOSTO',
  'OTRO',
]);

// ── Estado global de la aplicación ───────────────────────
// Mutable en runtime, nunca expuesto fuera de los módulos.
const State = {
  currentSection: 1,
  formData: {},
  googleUser: null,
  rowCounts: {},
  customAppCounter: 0,
};
