import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiHistory, apiSessionDetail, apiReopenModule, apiRenameSession, apiDeleteSession, apiRenameModule, apiDeleteModule } from '../api';
import { t, getLang } from '../i18n';

function MarkdownRenderer({ content }) {
  const [MarkdownComponent, setMarkdownComponent] = useState(null);
  useEffect(() => {
    let cancelled = false;
    import('react-markdown').then(mod => {
      if (!cancelled) setMarkdownComponent(() => mod.default);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (MarkdownComponent) return <MarkdownComponent>{content || ''}</MarkdownComponent>;
  if (!content) return null;
  return <div className="explanation-content" dangerouslySetInnerHTML={{ __html: content }} />;
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editModule, setEditModule] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [riepilogoView, setRiepilogoView] = useState(null);
  const [viewModule, setViewModule] = useState(null);
  const lang = getLang();

  useEffect(() => { loadSessions(); }, []);

  async function loadSessions() {
    try {
      const res = await apiHistory();
      setSessions(res.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function loadDetail(sid) {
    if (selectedSession === sid) { setSelectedSession(null); setModules([]); return; }
    setSelectedSession(sid);
    setRiepilogoView(null);
    try {
      const res = await apiSessionDetail(sid, lang);
      setModules(res.data || []);
    } catch { setModules([]); }
  }

  async function handleResume(session) {
    try {
      const res = await apiSessionDetail(session.id, lang);
      const data = res.data || [];
      const modules = data.map(m => {
        const isCompleted = m.completed;
        let feedback = null;
        if (isCompleted && m.attempts?.length > 0) {
          const lastAttempt = m.attempts[m.attempts.length - 1];
          let fb = lastAttempt.feedback_json;
          if (typeof fb === 'string') {
            try { fb = JSON.parse(fb); } catch { fb = {}; }
          }
          feedback = {
            esito: lastAttempt.esito || 'corretta',
            commento_costruttivo: fb.commento_costruttivo || lastAttempt.commento_costruttivo || '',
            suggerimento_miglioramento: fb.suggerimento_miglioramento || lastAttempt.suggerimento_miglioramento || '',
          };
        }
        return {
          id: String(m.module_index + 1),
          titolo_modulo: m.titolo,
          spiegazione: m.spiegazione,
          esercizio_pratico: m.esercizio,
          status: isCompleted ? 'completed' : 'pending',
          attempts: isCompleted ? (m.attempts || []).length : 0,
          partialCount: 0,
          wrongCount: 0,
          feedback: feedback,
          submittedSolution: isCompleted && m.attempts?.length > 0 ? (m.attempts[m.attempts.length - 1].soluzione || '') : '',
          archived: false,
        };
      });
      const sessionData = {
        percorso_studio: {
          livello: session.level,
          obiettivo_di_apprendimento: `Ripresa: ${session.topic} (${session.level})`,
          moduli: modules,
        },
      };
      const moduleDbIds = {};
      data.forEach(m => { moduleDbIds[String(m.module_index + 1)] = m.id; });
      navigate(`/session/${session.id}`, { state: { sessionData, moduleDbIds } });
    } catch (err) {
      alert('Errore nel caricamento della sessione.');
    }
  }

  async function handleRenameSession(sid) {
    if (!editTitle.trim()) return;
    try {
      await apiRenameSession(sid, editTitle);
      setSessions(s => s.map(sess => sess.id === sid ? { ...sess, topic: editTitle } : sess));
      setEditing(null);
    } catch {}
  }

  async function handleDeleteSession(sid) {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiDeleteSession(sid);
      setSessions(s => s.filter(sess => sess.id !== sid));
      if (selectedSession === sid) { setSelectedSession(null); setModules([]); }
    } catch {}
  }

  async function handleRenameModule(mid) {
    if (!editModuleTitle.trim()) return;
    try {
      await apiRenameModule(mid, editModuleTitle);
      setModules(ms => ms.map(m => m.id === mid ? { ...m, titolo: editModuleTitle } : m));
      setEditModule(null);
    } catch {}
  }

  async function handleDeleteModule(mid) {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await apiDeleteModule(mid);
      setModules(ms => ms.filter(m => m.id !== mid));
    } catch {}
  }

  async function handleReopenModule(mid, sessionId) {
    try {
      await apiReopenModule(mid);
      setModules(ms => ms.map(m => m.id === mid ? { ...m, archived: 0 } : m));
      // Auto-resume to let user work on the reopened module
      const targetSession = sessions.find(s => s.id === sessionId);
      if (targetSession) handleResume(targetSession);
    } catch {}
  }

  function parseRiepilogo(riepilogo) {
    try {
      if (typeof riepilogo === 'string') return JSON.parse(riepilogo);
      return riepilogo;
    } catch { return null; }
  }

  if (loading) return <div className="card"><p>{t('loading')}</p></div>;
  if (sessions.length === 0) return <div className="card"><p>{t('noHistory')}</p></div>;

  return (
    <div className="card">
      <h2>{t('history')}</h2>
      {sessions.map(s => (
        <div key={s.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <div onClick={() => loadDetail(s.id)} style={{ cursor: 'pointer', flex: 1 }}>
              <div className="meta">{s.created_at?.split('T')[0]} — {s.level}</div>
              {editing === s.id ? (
                <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                  <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                         style={{ padding: '4px 8px', fontSize: '0.85rem' }} />
                  <button className="btn btn-sm btn-primary" onClick={() => handleRenameSession(s.id)}>OK</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setEditing(null)}>✕</button>
                </div>
              ) : (
                <strong>{s.topic}</strong>
              )}
              {s.riepilogo && (
                <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--success)', cursor: 'pointer' }}
                      onClick={e => { e.stopPropagation(); setRiepilogoView(riepilogoView === s.id ? null : s.id); }}>
                  📋 Riepilogo
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-sm btn-primary" onClick={() => handleResume(s)}>▶ {t('resume')}</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setEditing(s.id); setEditTitle(s.topic); }}>✏️</button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSession(s.id)}>🗑️</button>
            </div>
          </div>

          {riepilogoView === s.id && s.riepilogo && (() => {
            const r = parseRiepilogo(s.riepilogo);
            if (!r) return <div className="error-msg">Errore parsing riepilogo.</div>;
            return (
              <div style={{ padding: '12px 16px', background: 'var(--surface2)', borderRadius: 'var(--radius)', marginBottom: 12 }}>
                {r.punti_di_forza?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ color: 'var(--success)' }}>🌟 {t('strengths')}</h4>
                    {r.punti_di_forza.map((p, i) => <p key={i} className="strength-item">🌟 {p}</p>)}
                  </div>
                )}
                {r.punti_da_migliorare?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <h4 style={{ color: 'var(--primary)' }}>🎯 {t('improvements')}</h4>
                    {r.punti_da_migliorare.map((p, i) => <p key={i} className="improvement-item">🎯 {p}</p>)}
                  </div>
                )}
                {r.diario_di_bordo?.length > 0 && (
                  <div>
                    <h4>📖 {t('diary')}</h4>
                    {r.diario_di_bordo.map((e, i) => <p key={i} style={{ fontSize: '0.85rem', marginBottom: 4 }}>{e}</p>)}
                  </div>
                )}
              </div>
            );
          })()}

          {selectedSession === s.id && (
            <div style={{ padding: '0 16px 16px' }}>
              {modules.map(m => (
                <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {editModule === m.id ? (
                      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                        <input className="form-input" value={editModuleTitle} onChange={e => setEditModuleTitle(e.target.value)}
                               style={{ padding: '4px 8px', fontSize: '0.85rem' }} />
                        <button className="btn btn-sm btn-primary" onClick={() => handleRenameModule(m.id)}>OK</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditModule(null)}>✕</button>
                      </div>
                    ) : (
                      <div style={{ flex: 1 }}>
                        <span>{m.completed ? '✅' : m.archived ? '📦' : '⚪'} </span>
                        <strong style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setViewModule(viewModule === m.id ? null : m.id)}>
                          {m.titolo}
                        </strong>
                        <span className={m.completed ? 'status-completed' : m.archived ? 'status-archived' : 'status-pending'}
                              style={{ marginLeft: 8, fontSize: '0.75rem' }}>
                          {m.completed ? t('completed') : m.archived ? t('archived') : t('pending')}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {m.archived && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleReopenModule(m.id, s.id)}>
                          {t('reopen')}
                        </button>
                      )}
                      <button className="btn btn-sm btn-secondary" onClick={() => { setEditModule(m.id); setEditModuleTitle(m.titolo); }}>✏️</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteModule(m.id)}>🗑️</button>
                    </div>
                  </div>
                  {m.attempts?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                      {m.attempts.map((a, i) => (
                        <div key={i} style={{ padding: '4px 0', color: 'var(--text-muted)' }}>
                          <span className={`esito-badge ${a.esito}`} style={{ fontSize: '0.7rem', marginRight: 8 }}>
                            {t(a.esito)}
                          </span>
                          <span>{a.soluzione?.substring(0, 80)}{a.soluzione?.length > 80 ? '...' : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {viewModule === m.id && (
                    <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
                      <h4 style={{ marginBottom: 8, color: 'var(--primary)' }}>{t('explanation')}</h4>
                      <div className="explanation-content" dangerouslySetInnerHTML={{ __html: m.spiegazione || '' }} />
                      <h4 style={{ margin: '12px 0 8px', color: 'var(--primary)' }}>{t('exercise')}</h4>
                      <div className="explanation-content" dangerouslySetInnerHTML={{ __html: m.esercizio || '' }} />
                    </div>
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
