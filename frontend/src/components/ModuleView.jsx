import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiEvaluate, apiHint, apiArchiveModule, apiCompleteModule, apiClarify } from '../api';
import { t, getLang } from '../i18n';

function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\$\$([\s\S]+?)\$\$/g, '<strong>$$ $1 $$</strong>')
    .replace(/\$(.+?)\$/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  return html;
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
      archived: false,
    }));
  });

  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doubt, setDoubt] = useState('');
  const [clarification, setClarification] = useState(null);

  const mod = modules[selectedIdx];
  if (!mod || !sessionData) {
    return <div className="card"><p>{t('error')}: sessione non trovata.</p></div>;
  }

  const allDone = modules.every(m => m.status === 'completed' || m.archived);

  async function handleEvaluate() {
    if (!solution.trim()) return;
    setLoading(true);
    setError('');
    try {
      const dbId = moduleDbIds[String(mod.id)];
      const res = await apiEvaluate(mod.esercizio_pratico, solution, sessionData.percorso_studio.livello, dbId, mod.attempts, lang, user.token);
      const newModules = [...modules];
      newModules[selectedIdx] = {
        ...mod,
        attempts: mod.attempts + 1,
        feedback: res,
        hint: res.hint || null,
        status: res.esito === 'corretta' ? 'completed' : (mod.attempts >= 1 ? 'archived' : 'partial'),
      };
      setModules(newModules);
      setSolution('');

      if (res.esito === 'corretta' && dbId) {
        apiCompleteModule(dbId, lang).catch(() => {});
      } else if (newModules[selectedIdx].status === 'archived' && dbId) {
        apiArchiveModule(dbId, lang).catch(() => {});
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

  const statusIcon = {
    completed: '✅',
    archived: '📦',
    pending: '⚪',
    partial: '🔵',
  };

  return (
    <div>
      <div className="learning-objective">
        <h3>{sessionData.percorso_studio.obiettivo_di_apprendimento}</h3>
      </div>

      <div className="tabs">
        {modules.map((m, i) => (
          <button key={m.id}
            className={`tab-btn ${i === selectedIdx ? 'active' : ''} ${m.status === 'completed' ? 'completed' : ''} ${m.archived ? 'archived' : ''}`}
            onClick={() => { setSelectedIdx(i); setClarification(null); }}>
            {statusIcon[m.archived ? 'archived' : (m.status === 'completed' ? 'completed' : 'pending')]} {m.titolo_modulo}
          </button>
        ))}
      </div>

      <div className="card">
        <h3>{mod.titolo_modulo}</h3>
        <div className="explanation-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(mod.spiegazione) }} />

        {!mod.archived && (
          <>
            <div className="exercise-box">
              <h4>{t('exercise')}</h4>
              <div className="explanation-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(mod.esercizio_pratico) }} />
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
                  {mod.attempts > 0 && (
                    <button className="btn btn-secondary" onClick={handleAskHint} disabled={loading}>
                      {t('hint')}
                    </button>
                  )}
                </div>
              </>
            )}

            {mod.hint && (
              <div className="hint-box">
                <h4>💡 {t('hint')}</h4>
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

            {mod.status === 'archived' && (
              <div className="hint-box">
                <p>{t('archived')} — questo modulo è stato archiviato dopo 2 tentativi.</p>
              </div>
            )}

            {(mod.status === 'completed' || mod.archived) && mod.attempts > 0 && (
              <div className="form-group" style={{ marginTop: 20 }}>
                <h4 style={{ marginBottom: 8 }}>{t('needClarification')}</h4>
                <textarea className="form-textarea" value={doubt} onChange={e => setDoubt(e.target.value)}
                          placeholder={t('doubtPlaceholder')} rows={3} />
                <button className="btn btn-secondary" onClick={handleClarify} disabled={loading || !doubt.trim()}
                        style={{ marginTop: 8 }}>
                  {t('askClarification')}
                </button>
              </div>
            )}

            {clarification && (
              <div className="feedback-box" style={{ marginTop: 16, borderColor: 'var(--primary)' }}>
                <p style={{ marginBottom: 8 }}><strong>{clarification.spiegazione_semplificata}</strong></p>
                {clarification.esempio_pratico && <p style={{ color: 'var(--text-muted)' }}>{clarification.esempio_pratico}</p>}
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
