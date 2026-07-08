import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiEvaluate, apiHint, apiArchiveModule, apiCompleteModule, apiClarify, apiReopenModule, apiSessionDetail, apiHistory } from '../api';
import { t, getLang } from '../i18n';

function MarkdownRenderer({ content }) {
  const [renderer, setRenderer] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      import('react-markdown'),
      import('remark-gfm'),
      import('remark-math'),
      import('rehype-katex'),
    ]).then(([reactMd, remarkGfm, remarkMath, rehypeKatex]) => {
      if (cancelled) return;
      const ReactMarkdown = reactMd.default;
      const gfm = remarkGfm.default;
      const math = remarkMath.default;
      const katex = rehypeKatex.default;
      setRenderer(() => (props) => (
        <ReactMarkdown remarkPlugins={[gfm, math]} rehypePlugins={[katex]}>
          {props.children}
        </ReactMarkdown>
      ));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const Comp = renderer;
  if (Comp) return <Comp>{content || ''}</Comp>;
  if (!content) return null;
  let html = content
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n- (.+)/g, '<br/>• $1')
    .replace(/\n(\d+)\. (.+)/g, '<br/>$1. $2');
  return <div className="explanation-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function ModuleView() {
  const { sessionId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const lang = getLang();

  const sessionData = location.state?.sessionData;
  const moduleDbIds = location.state?.moduleDbIds || {};

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [modules, setModules] = useState(() => {
    if (!sessionData?.percorso_studio?.moduli) return [];
    return sessionData.percorso_studio.moduli.map(m => ({
      ...m,
      status: 'pending',
      attempts: 0,
      feedback: null,
      hint: null,
      archived: false,
    }));
  });

  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doubt, setDoubt] = useState('');
  const [clarification, setClarification] = useState(null);

  const [archivedModules, setArchivedModules] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    loadArchivedModules();
  }, [user.token]);

  async function loadArchivedModules() {
    try {
      const res = await apiHistory(user.token);
      const sessions = res.data || [];
      const archived = [];
      for (const s of sessions) {
        const detail = await apiSessionDetail(s.id, lang);
        for (const m of (detail.data || [])) {
          if (m.archived && !m.completed) {
            archived.push({ ...m, session_id: s.id, session_topic: s.topic });
          }
        }
      }
      setArchivedModules(archived);
    } catch {}
  }

  const mod = modules[selectedIdx];
  if (!mod || !sessionData) {
    return <div className="card"><p>{t('error')}: sessione non trovata.</p></div>;
  }

  const allDone = modules.every(m => m.status === 'completed' || m.archived);

  const stepIndicator = useMemo(() => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
      {modules.map((m, i) => {
        const isActive = i === selectedIdx;
        const isCompleted = m.status === 'completed';
        const isArchived = m.archived;
        let icon = '⚪';
        let label = t('pending');
        if (isCompleted) { icon = '✅'; label = t('completed'); }
        else if (isArchived) { icon = '📦'; label = t('archived'); }
        else if (isActive) { icon = '🔵'; label = t('active'); }
        return (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => { setSelectedIdx(i); setClarification(null); setError(''); }}
              style={{
                background: isActive ? 'var(--surface2)' : 'transparent',
                border: `2px solid ${isActive ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--border)'}`,
                borderRadius: '50%', width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1rem',
              }}>
              {icon}
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              {m.titolo_modulo?.substring(0, 20)}
              <br/><span style={{ fontSize: '0.65rem' }}>{label}</span>
            </div>
            {i < modules.length - 1 && <span style={{ color: 'var(--border)', margin: '0 4px' }}>→</span>}
          </div>
        );
      })}
    </div>
  ), [modules, selectedIdx]);

  async function handleEvaluate() {
    if (!solution.trim()) return;
    setLoading(true);
    setError('');
    try {
      const dbId = moduleDbIds[String(mod.id)];
      const res = await apiEvaluate(mod.esercizio_pratico, solution, sessionData.percorso_studio.livello, dbId, mod.attempts, lang, user.token);
      const newAttempts = mod.attempts + 1;
      const isCorrect = res.esito === 'corretta';
      const shouldArchive = !isCorrect && newAttempts >= 2;

      const newModules = [...modules];
      newModules[selectedIdx] = {
        ...mod,
        attempts: newAttempts,
        feedback: res,
        hint: res.hint || mod.hint,
        status: isCorrect ? 'completed' : shouldArchive ? 'archived' : 'partial',
        archived: shouldArchive,
      };
      setModules(newModules);
      setSolution('');

      if (isCorrect && dbId) apiCompleteModule(dbId, lang).catch(() => {});
      if (shouldArchive && dbId) {
        apiArchiveModule(dbId, lang).catch(() => {});
        loadArchivedModules();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAskHint() {
    setLoading(true);
    try {
      const res = await apiHint(mod.esercizio_pratico, solution, sessionData.percorso_studio.livello, mod.attempts, lang);
      const newModules = [...modules];
      newModules[selectedIdx] = { ...mod, hint: res.hint };
      setModules(newModules);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleClarify() {
    if (!doubt.trim()) return;
    setLoading(true);
    try {
      const res = await apiClarify(mod.titolo_modulo, mod.spiegazione, doubt, sessionData.percorso_studio.livello, lang);
      setClarification(res.data);
      setDoubt('');
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  async function handleReopen(moduleDbId) {
    try {
      await apiReopenModule(moduleDbId, user.token);
      loadArchivedModules();
      setShowArchived(false);
    } catch {}
  }

  return (
    <div>
      <div className="learning-objective">
        <h3>📋 {sessionData.percorso_studio.obiettivo_di_apprendimento}</h3>
      </div>

      {stepIndicator}

      {archivedModules.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowArchived(!showArchived)}>
            📦 {t('modulesArchived')} ({archivedModules.length})
          </button>
          {showArchived && (
            <div className="card" style={{ marginTop: 8, padding: 12 }}>
              {archivedModules.map(am => (
                <div key={am.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    📦 <strong>{am.titolo}</strong> — {am.session_topic}
                  </span>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleReopen(am.id)}>
                    {t('reopen')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="tabs">
        {modules.map((m, i) => (
          <button key={m.id}
            className={`tab-btn ${i === selectedIdx ? 'active' : ''} ${m.status === 'completed' ? 'completed' : ''} ${m.archived ? 'archived' : ''}`}
            onClick={() => { setSelectedIdx(i); setClarification(null); setError(''); }}>
            {m.archived ? '📦' : m.status === 'completed' ? '✅' : i === selectedIdx ? '🔵' : '⚪'} {m.titolo_modulo}
          </button>
        ))}
      </div>

      <div className="card">
        <h3>{mod.titolo_modulo}</h3>
        <MarkdownRenderer content={mod.spiegazione} />

        {!mod.archived && (
          <>
            <div className="exercise-box">
              <h4>{t('exercise')}</h4>
              <MarkdownRenderer content={mod.esercizio_pratico} />
            </div>

            {mod.status !== 'completed' && (
              <>
                {error && <div className="error-msg">{error}</div>}
                <div className="form-group">
                  <textarea className="form-textarea" value={solution} onChange={e => setSolution(e.target.value)}
                            placeholder={t('solutionPlaceholder')} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleEvaluate} disabled={loading || !solution.trim()}>
                    {loading ? t('evaluating') : t('submit')}
                  </button>
                  {mod.attempts > 0 && !mod.hint && (
                    <button className="btn btn-secondary" onClick={handleAskHint} disabled={loading}>
                      {t('hint')}
                    </button>
                  )}
                </div>
              </>
            )}

            {mod.hint && (
              <div className="hint-box">
                <h4>💡 {t('hint')} ({t('attempt')} {mod.attempts}/2)</h4>
                <p>{mod.hint}</p>
              </div>
            )}

            {mod.feedback && (
              <div className={`feedback-box ${mod.feedback.esito}`}>
                <span className={`esito-badge ${mod.feedback.esito}`}>{t(mod.feedback.esito)}</span>
                <p style={{ marginBottom: 8 }}>{mod.feedback.commento_costruttivo}</p>
                <p style={{ color: 'var(--text-muted)' }}>{mod.feedback.suggerimento_miglioramento}</p>
              </div>
            )}

            {mod.archived && (
              <div className="hint-box">
                <p>⚠️ {t('archived')} — questo modulo è stato archiviato dopo 2 tentativi. Puoi riaprirlo dalla sidebar.</p>
              </div>
            )}

            {(mod.status === 'completed' || mod.archived) && mod.attempts > 0 && (
              <div className="form-group" style={{ marginTop: 20 }}>
                <h4 style={{ marginBottom: 8 }}>{t('needClarification')}</h4>
                <textarea className="form-textarea" value={doubt} onChange={e => setDoubt(e.target.value)}
                          placeholder={t('doubtPlaceholder')} rows={3} />
                <button className="btn btn-secondary" onClick={handleClarify} disabled={loading || !doubt.trim()} style={{ marginTop: 8 }}>
                  {t('askClarification')}
                </button>
              </div>
            )}

            {clarification && (
              <div className="feedback-box" style={{ marginTop: 16, borderColor: 'var(--primary)' }}>
                <h4>💬 {t('clarification')}</h4>
                <p style={{ marginBottom: 8 }}><strong>{clarification.spiegazione_semplificata}</strong></p>
                {clarification.esempio_pratico && (
                  <>
                    <h4 style={{ marginTop: 12 }}>📝 {t('example')}</h4>
                    <p style={{ color: 'var(--text-muted)' }}>{clarification.esempio_pratico}</p>
                  </>
                )}
                {clarification.guida_step && (
                  <>
                    <h4 style={{ marginTop: 12 }}>📋 {t('stepGuide')}</h4>
                    <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{clarification.guida_step}</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {allDone && (
        <button className="btn btn-primary" style={{ width: '100%' }}
                onClick={() => navigate(`/summary/${sessionId}`, { state: { modules, sessionData, moduleDbIds } })}>
          {t('finalSummary')} →
        </button>
      )}
    </div>
  );
}
