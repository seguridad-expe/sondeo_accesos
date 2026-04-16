const CONFIG = Object.freeze({
  // Leídas desde env.js (no hardcodeadas aquí)
  GOOGLE_CLIENT_ID: ENV.GOOGLE_CLIENT_ID,
  APPS_SCRIPT_URL: ENV.APPS_SCRIPT_URL,
  ALLOWED_DOMAIN: ENV.ALLOWED_DOMAIN,
  // Constantes de la app (no sensibles, sí van en repo)
  TOTAL_SECTIONS: 5,
});
// ── Lista de líderes ──────────────────────────────────────
const LIDERES = Object.freeze([
  'Amairany Yepez Gómez',
  'Camilo Velasquez Restrepo',
  'Johan Stivens Carmona Giraldo',
  'Juan Jose Martinez Velasquez',
  'Juliana Quiroz Upegui',
  'July Andrea Cardenas Montaño',
  'Karen Johanna Reyes Rivera',
  'Leon Dario Arango Amaya',
  'Maria Isabel Gomez Londoño',
  'Saúl Naranjo Romero',
  'Sebastian Cuervo Aransazo',
  'Veronica Espinosa Artunduaga',
  'Victoria Eugenia Loaiza Pérez',
  'Yilmer Moreno Salas',
]);

// ── Lista de cargos ────────────────────────────────────────
const CARGOS = Object.freeze([
  'Analista de Soporte',
  'Analista Funcional e commerce',
  'Aprendiz de Desarrollo de Software',
  'Aprendiz de Diseño Gráfico',
  'Arquitecto de Datos',
  'Auxiliar Contable',
  'CEO',
  'Científico de Datos',
  'Country Manager México',
  'Country Manager Spain',
  'Culture & People Specialist',
  'Custumer Surces',
  'Data Analyst',
  'Data Engineer',
  'Delivery Manager',
  'Digital Marketing Specialist',
  'Director de Producto',
  'Director of Experience',
  'Diseñadora Gráfica Publicitaria',
  'Engineering Director',
  'Financial & Administrative Director',
  'Functional Specialist',
  'Operations Director',
  'Practicante de Desarrollo de Software',
  'Presales & Functional Specialist',
  'QA Analyst',
  'Sale Developmen Representative',
  'Scrum Master Delivery Manager',
  'Software Developer',
  'UX | UI Creative',
  'UX | UI Creative Chapter Lead',
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

// ── Lista de proyectos ────────────────────────────────────────
const PROYECTOS = Object.freeze([
  'EXPERIMENTALITY',
  'TANAGER',
  'SURA',
  'SOLLA',
  'EXITO',
  'GRUPO NUTRESA',
  'SURAMERICANA',
  'BANCO DE BOGOTÁ',
  'ALKOSTO',
  'PIDEKY ESCALA',
  'OTRO'
]);

// ── Lista de aplicaciones ─────────────────────────────────────
const APLICACIONES = Object.freeze([
  'VTEX',
  'GOOGLE',
  'MICROSOFT',
  'SLACK',
  'JIRA',
  'CONFLUENCE',
  'GITHUB',
  'GITLAB',
  'OTRO'
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
