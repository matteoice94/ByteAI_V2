const BASE = '/api';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function apiRegister(username, password) {
  return request(`${BASE}/register`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function apiLogin(username, password) {
  return request(`${BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function apiGenerate(topic, level, name, lang, token) {
  return request(`${BASE}/generate`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ topic, level, name, lang }),
  });
}

export async function apiEvaluate(esercizio, soluzione, livello, module_db_id, tentativi, lang, token) {
  return request(`${BASE}/evaluate`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ esercizio, soluzione, livello, module_db_id, tentativi, lang }),
  });
}

export async function apiHint(esercizio, soluzione, livello, tentativo, lang) {
  return request(`${BASE}/hint`, {
    method: 'POST',
    body: JSON.stringify({ esercizio, soluzione, livello, tentativo, lang }),
  });
}

export async function apiClarify(argomento, spiegazione, dubbio, livello, lang) {
  return request(`${BASE}/clarify`, {
    method: 'POST',
    body: JSON.stringify({ argomento, spiegazione, dubbio, livello, lang }),
  });
}

export async function apiFinalSummary(solutions, diary, livello, session_id, lang) {
  return request(`${BASE}/final-summary`, {
    method: 'POST',
    body: JSON.stringify({ solutions, diary, livello, session_id, lang }),
  });
}

export async function apiArchiveModule(module_db_id, lang) {
  return request(`${BASE}/archive-module`, {
    method: 'POST',
    body: JSON.stringify({ module_db_id, lang }),
  });
}

export async function apiCompleteModule(module_db_id, lang) {
  return request(`${BASE}/complete-module`, {
    method: 'POST',
    body: JSON.stringify({ module_db_id, lang }),
  });
}

export async function apiHistory(token) {
  return request(`${BASE}/history`, { headers: headers(token) });
}

export async function apiSessionDetail(session_id, lang) {
  return request(`${BASE}/session-detail`, {
    method: 'POST',
    body: JSON.stringify({ session_id, lang }),
  });
}

export async function apiTranslations(lang) {
  return request(`${BASE}/translations?lang=${lang}`);
}

export async function apiUserStats(token) {
  return request(`${BASE}/user/stats`, { headers: headers(token) });
}

export async function apiLeaderboard(token) {
  return request(`${BASE}/leaderboard`, { headers: headers(token) });
}

export async function apiUpdateProfile(avatar, theme_color, featured_badges, token) {
  return request(`${BASE}/user/profile`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ avatar, theme_color, featured_badges }),
  });
}
