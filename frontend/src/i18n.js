const LANG_KEY = 'mlpg_lang';

const translations = {
  appTitle: { it: 'MLPG Tutor', en: 'MLPG Tutor' },
  login: { it: 'Accedi', en: 'Login' },
  register: { it: 'Registrati', en: 'Register' },
  username: { it: 'Username', en: 'Username' },
  password: { it: 'Password', en: 'Password' },
  newPath: { it: 'Nuovo Percorso', en: 'New Path' },
  myPaths: { it: 'I Miei Percorsi', en: 'My Paths' },
  dashboard: { it: 'Dashboard', en: 'Dashboard' },
  topic: { it: 'Argomento', en: 'Topic' },
  level: { it: 'Livello', en: 'Level' },
  base: { it: 'Base', en: 'Basic' },
  intermediate: { it: 'Intermedio', en: 'Intermediate' },
  advanced: { it: 'Avanzato', en: 'Advanced' },
  yourName: { it: 'Il tuo nome', en: 'Your name' },
  generate: { it: 'Genera Percorso', en: 'Generate Path' },
  generating: { it: 'Generazione in corso...', en: 'Generating...' },
  exercise: { it: 'Esercizio', en: 'Exercise' },
  yourSolution: { it: 'La tua soluzione', en: 'Your solution' },
  submit: { it: 'Invia Risposta', en: 'Submit Answer' },
  evaluating: { it: 'Valutazione in corso...', en: 'Evaluating...' },
  correct: { it: 'Corretta', en: 'Correct' },
  partial: { it: 'Parziale', en: 'Partial' },
  wrong: { it: 'Sbagliata', en: 'Wrong' },
  hint: { it: 'Suggerimento', en: 'Hint' },
  archived: { it: 'Archiviato', en: 'Archived' },
  completed: { it: 'Completato', en: 'Completed' },
  pending: { it: 'In corso', en: 'Pending' },
  needClarification: { it: 'Hai bisogno di chiarimenti?', en: 'Need clarification?' },
  yourDoubt: { it: 'Descrivi il tuo dubbio', en: 'Describe your doubt' },
  askClarification: { it: 'Chiedi chiarimento', en: 'Ask for clarification' },
  finalSummary: { it: 'Riepilogo Finale', en: 'Final Summary' },
  strengths: { it: 'Punti di Forza', en: 'Strengths' },
  improvements: { it: 'Punti da Migliorare', en: 'Areas for Improvement' },
  diary: { it: 'Diario di Bordo', en: 'Logbook' },
  close: { it: 'Chiudi', en: 'Close' },
  history: { it: 'Storico Sessioni', en: 'Session History' },
  noHistory: { it: 'Nessuna sessione passata.', en: 'No past sessions.' },
  xp: { it: 'XP', en: 'XP' },
  level: { it: 'Livello', en: 'Level' },
  badges: { it: 'Badge', en: 'Badges' },
  streak: { it: 'Streak', en: 'Streak' },
  logout: { it: 'Esci', en: 'Logout' },
  loading: { it: 'Caricamento...', en: 'Loading...' },
  error: { it: 'Errore', en: 'Error' },
  leaderboard: { it: 'Classifica', en: 'Leaderboard' },
  selectLevel: { it: 'Seleziona livello', en: 'Select level' },
  solutionPlaceholder: { it: 'Scrivi qui la tua soluzione...', en: 'Write your solution here...' },
  doubtPlaceholder: { it: 'Descrivi cosa non ti è chiaro...', en: 'Describe what is unclear...' },
  modulesArchived: { it: 'Moduli Archiviati', en: 'Archived Modules' },
  noArchived: { it: 'Nessun modulo archiviato.', en: 'No archived modules.' },
};

export function getLang() {
  return localStorage.getItem(LANG_KEY) || 'it';
}

export function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

export function t(key) {
  const lang = getLang();
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang] || entry.it || key;
}
