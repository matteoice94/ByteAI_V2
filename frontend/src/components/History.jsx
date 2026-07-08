import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiHistory, apiSessionDetail } from '../api';
import { t, getLang } from '../i18n';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = getLang();

  useEffect(() => {
    apiHistory(user.token)
      .then(res => setSessions(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.token]);

  async function loadDetail(sid) {
    setSelectedSession(sid);
    try {
      const res = await apiSessionDetail(sid, lang);
      setModules(res.data || []);
    } catch { setModules([]); }
  }

  if (loading) return <div className="card"><p>{t('loading')}</p></div>;
  if (sessions.length === 0) return <div className="card"><p>{t('noHistory')}</p></div>;

  return (
    <div className="card">
      <h2>{t('history')}</h2>
      {sessions.map(s => (
        <div key={s.id}>
          <div className="session-card" onClick={() => loadDetail(s.id)}>
            <div className="meta">{s.created_at?.split('T')[0]} — {s.level}</div>
            <strong>{s.topic}</strong>
            {s.riepilogo && <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--success)' }}>📋 Riepilogo</span>}
          </div>

          {selectedSession === s.id && (
            <div style={{ padding: '0 16px 16px' }}>
              {modules.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: '0.9rem' }}>
                  <span>{m.completed ? '✅' : m.archived ? '📦' : '⚪'}</span>
                  <span>{m.titolo}</span>
                  <span className={m.completed ? 'status-completed' : m.archived ? 'status-archived' : 'status-pending'}
                        style={{ fontSize: '0.75rem' }}>
                    {m.completed ? t('completed') : m.archived ? t('archived') : t('pending')}
                  </span>
                  {m.attempts?.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({m.attempts.length} tentativi)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
