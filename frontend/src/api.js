const BASE = '/api';
const TIMEOUT = 30000;

function headers() {
  const h = { 'Content-Type': 'application/json' };
  try {
    const saved = localStorage.getItem('byteai_user');
    if (saved) {
      const u = JSON.parse(saved);
      if (u.token) h['Authorization'] = `Bearer ${u.token}`;
    }
  } catch {}
  return h;
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });
    clearTimeout(timer);
    if (!res.ok) {
      let data;
      try { data = await res.json(); } catch { data = {}; }
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Richiesta scaduta. Riprova.');
    throw err;
  }
}

function post(url, body) {
  return request(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
}

function get(url) {
  return request(url, { headers: headers() });
}

export async function apiRegister(username, password) {
  return post(`${BASE}/register`, { username, password });
}

export async function apiLogin(username, password) {
  return post(`${BASE}/login`, { username, password });
}

export async function apiGenerate(topic, level, name, lang) {
  return post(`${BASE}/generate`, { topic, level, name, lang });
}

export async function apiEvaluate(esercizio, soluzione, livello, module_db_id, tentativi, lang) {
  return post(`${BASE}/evaluate`, { esercizio, soluzione, livello, module_db_id, tentativi, lang });
}

export async function apiHint(esercizio, soluzione, livello, tentativo, lang) {
  return post(`${BASE}/hint`, { esercizio, soluzione, livello, tentativo, lang });
}

export async function apiArchiveModule(moduleDbId, lang) {
  return post(`${BASE}/archive-module`, { module_db_id: moduleDbId, lang });
}

export async function apiCompleteModule(moduleDbId, lang) {
  return post(`${BASE}/complete-module`, { module_db_id: moduleDbId, lang });
}

export async function apiClarify(titolo, spiegazione, dubbio, livello, lang) {
  return post(`${BASE}/clarify`, { titolo_modulo: titolo, spiegazione, dubbio_utente: dubbio, livello, lang });
}

export async function apiFinalSummary(solutions, diary, livello, sessionId, lang) {
  return post(`${BASE}/final-summary`, { solutions, diary, livello, session_id: sessionId, lang });
}

export async function apiReopenModule(moduleDbId) {
  return post(`${BASE}/reopen-module`, { module_db_id: moduleDbId });
}

export async function apiSessionDetail(sessionId, lang) {
  return post(`${BASE}/session-detail`, { session_id: sessionId, lang });
}

export async function apiHistory() {
  return get(`${BASE}/history`);
}

export async function apiUserStats() {
  return get(`${BASE}/user/stats`);
}

export async function apiLeaderboard() {
  return get(`${BASE}/leaderboard`);
}

export async function apiUpdateProfile(avatar, themeColor, featuredBadges) {
  return post(`${BASE}/user/profile`, { avatar, theme_color: themeColor, featured_badges: featuredBadges });
}

export async function apiRenameSession(sessionId, newTopic) {
  return post(`${BASE}/rename-session`, { session_id: sessionId, new_topic: newTopic });
}

export async function apiDeleteSession(sessionId) {
  return post(`${BASE}/delete-session`, { session_id: sessionId });
}

export async function apiRenameModule(moduleId, newTitle) {
  return post(`${BASE}/rename-module`, { module_id: moduleId, new_title: newTitle });
}

export async function apiDeleteModule(moduleId) {
  return post(`${BASE}/delete-module`, { module_id: moduleId });
}

export async function apiSocialSearch(query) {
  return post(`${BASE}/social/search`, { query });
}

export async function apiSocialSendRequest(friendId) {
  return post(`${BASE}/social/send-request`, { friend_id: friendId });
}

export async function apiSocialRespond(friendshipId, action) {
  return post(`${BASE}/social/respond`, { friendship_id: friendshipId, action });
}

export async function apiSocialPending() {
  return get(`${BASE}/social/pending`);
}

export async function apiSocialFriends() {
  return get(`${BASE}/social/friends`);
}
