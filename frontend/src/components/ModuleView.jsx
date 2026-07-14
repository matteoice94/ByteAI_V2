import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiEvaluate, apiHint, apiArchiveModule, apiCompleteModule, apiClarify, apiReopenModule, apiSessionDetail, apiHistory } from '../api';
import { t, getLang } from '../i18n';
import BotMascot from './BotMascot';
import { useNotify } from '../context/NotificationContext';
import DOMPurify from 'dompurify';

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
  return <div className="explanation-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
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
      status: m.status || 'pending',
      attempts: m.attempts || 0,
      partialCount: m.partialCount || 0,
      wrongCount: m.wrongCount || 0,
      feedback: m.feedback || null,
      hint: m.hint || null,
      archived: m.archived || false,
      cosaManca: m.cosaManca || null,
      submittedSolution: m.submittedSolution || null,
    }));
  });

  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doubt, setDoubt] = useState('');
  const [clarification, setClarification] = useState(null);

  const [archivedModules, setArchivedModules] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  const [solutionSteps, setSolutionSteps] = useState([]);
  const [showFormulaHelp, setShowFormulaHelp] = useState(false);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [botMood, setBotMood] = useState('neutral');
  const notify = useNotify();

  function extractSteps(exerciseText) {
    if (!exerciseText) return [];
    const lines = exerciseText.split('\n');
    const steps = [];
    for (const line of lines) {
      const m = line.match(/^\s*(\d+)[.)]\s+(.+)/);
      if (m) steps.push({ label: m[2].trim(), done: false });
    }
    if (steps.length === 0) {
      const sentences = exerciseText.split(/[.;]\s*/).filter(s => s.trim().length > 15);
      if (sentences.length >= 2) {
        for (let i = 0; i < Math.min(sentences.length, 5); i++) {
          steps.push({ label: sentences[i].trim(), done: false });
        }
      }
    }
    return steps;
  }

  function toggleStep(idx) {
    setActiveStepIdx(idx);
    const newSteps = [...solutionSteps];
    newSteps[idx] = { ...newSteps[idx], done: !newSteps[idx].done };
    setSolutionSteps(newSteps);
  }

  useEffect(() => {
    const steps = extractSteps(mod?.esercizio_pratico);
    setSolutionSteps(steps);
    setActiveStepIdx(0);
  }, [selectedIdx]);

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
    return <div className="card"><p>{t('error')}: {t('sessionNotFound')}</p></div>;
  }

  const allDone = modules.every(m => m.status === 'completed' || m.archived);

  const stepCards = useMemo(() => (
    <div className="step-cards">
      {modules.map((m, i) => {
        const isActive = i === selectedIdx;
        const isCompleted = m.status === 'completed';
        const isArchived = m.archived;
        const isDeepen = m.status === 'approfondire';

        let cardClass = 'step-card';
        if (isCompleted) cardClass += ' completed';
        else if (isDeepen) cardClass += ' deepen';
        else if (isArchived) cardClass += ' archived';
        else if (isActive) cardClass += ' active';

        let badgeText, badgeClass = 'step-badge';
        if (isCompleted) { badgeText = '\u2713'; badgeClass += ' badge-completed'; }
        else if (isArchived) { badgeText = '\uD83D\uDCE6'; badgeClass += ' badge-archived'; }
        else if (isDeepen) { badgeText = '\uD83D\uDCDD'; badgeClass += ' badge-archived'; }
        else if (isActive) { badgeText = '\u25CF'; badgeClass += ' badge-active'; }
        else { badgeText = '\u25CB'; badgeClass += ' badge-pending'; }

        return (
          <div key={m.id} className={cardClass} onClick={() => { setSelectedIdx(i); setClarification(null); setError(''); }}>
            <div className={badgeClass}>{badgeText}</div>
            <div className="step-title">{m.titolo_modulo}</div>
          </div>
        );
      })}
    </div>
  ), [modules, selectedIdx]);

  async function handleEvaluate() {
    if (!solution.trim()) return;
    setLoading(true);
    setError('');
    setBotMood('thinking');
    try {
      const dbId = moduleDbIds[String(mod.id)];
      const res = await apiEvaluate(mod.esercizio_pratico, solution, sessionData.percorso_studio.livello, dbId, mod.attempts, lang, user.token);
      const newAttempts = mod.attempts + 1;
      const isCorrect = res.esito === 'corretta';
      const isPartial = res.esito === 'parziale';
      const isWrong = !isCorrect && !isPartial;

      const newPartialCount = mod.partialCount + (isPartial ? 1 : 0);
      const newWrongCount = mod.wrongCount + (isWrong ? 1 : 0);
      const shouldDeepen = !isCorrect && newPartialCount >= 2;
      const shouldArchive = !isCorrect && !isPartial && newAttempts >= 2;

      const newModules = [...modules];
      newModules[selectedIdx] = {
        ...mod,
        attempts: newAttempts,
        partialCount: newPartialCount,
        wrongCount: newWrongCount,
        feedback: res,
        hint: res.hint || mod.hint,
        cosaManca: res.cosa_manca || mod.cosaManca,
        status: isCorrect ? 'completed' : shouldDeepen ? 'approfondire' : shouldArchive ? 'archived' : 'partial',
        archived: shouldArchive || shouldDeepen,
      };
      setModules(newModules);
      setSolution('');

      if (isCorrect && dbId) apiCompleteModule(dbId, lang).catch(() => {});
      setBotMood(isCorrect ? 'happy' : 'neutral');

      if (isCorrect) {
        const xpGain = 30;
        const completedCount = modules.filter(m => m.status === 'completed').length + 1;
        const totalXp = completedCount * xpGain;
        const thresholds = [0, 50, 120, 220, 350, 520, 740, 1020, 1370, 1800];
        let lvl = 1;
        for (let i = 1; i < thresholds.length; i++) {
          if (totalXp >= thresholds[i]) lvl = i + 1;
          else break;
        }
        const prevThreshold = thresholds[lvl - 1] || 0;
        const nextThreshold = thresholds[lvl] || 2600;
        const xpPct = Math.min(100, Math.round((totalXp - prevThreshold) / (nextThreshold - prevThreshold) * 100));
        notify('xp', { xpGain, newXp: totalXp, newLevel: lvl, oldLevel: lvl > 1 ? lvl - 1 : 1, xpPercent: xpPct, totalXp: nextThreshold });
        if (lvl > 1 && completedCount === 1) {
          setTimeout(() => notify('achievement', { icon: '\u2B06', title: 'Level Up!', subtitle: `Hai raggiunto il livello ${lvl}!`, color: '#534AB7' }), 1500);
        }
      }
      if (shouldArchive && dbId) {
        apiArchiveModule(dbId, lang).catch(() => {});
        loadArchivedModules();
      }
      if (shouldDeepen && dbId) {
        apiArchiveModule(dbId, lang).catch(() => {});
        loadArchivedModules();
      }
    } catch (err) {
      setError(err.message);
      setBotMood('neutral');
    } finally {
      setLoading(false);
    }
  }

  async function handleAskHint() {
    setLoading(true);
    setBotMood('thinking');
    try {
      const res = await apiHint(mod.esercizio_pratico, solution, sessionData.percorso_studio.livello, mod.attempts, lang);
      const newModules = [...modules];
      newModules[selectedIdx] = { ...mod, hint: res.hint };
      setModules(newModules);
    } catch (err) { setError(err.message); setBotMood('neutral'); }
    setLoading(false);
  }

  async function handleClarify() {
    if (!doubt.trim()) return;
    setLoading(true);
    setBotMood('thinking');
    try {
      const res = await apiClarify(mod.titolo_modulo, mod.spiegazione, doubt, sessionData.percorso_studio.livello, lang);
      setClarification(res.data);
      setDoubt('');
      setBotMood('neutral');
    } catch (err) { setError(err.message); setBotMood('neutral'); }
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

      {stepCards}

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

      <div className="study-layout">
        <div className="study-content">
          <div className="card">
            <h3>{mod.titolo_modulo}</h3>
            <MarkdownRenderer content={mod.spiegazione} />

            {!mod.archived && (
              <>
                <div className="exercise-container">
                  <div className="exercise-main-grid">
                    <div className="problem-data-box">
                      <div className="problem-data-header">
                        <span className="problem-data-icon">&#x1F4CA;</span>
                        <span>{lang === 'it' ? 'Dati del Problema' : 'Problem Data'}</span>
                      </div>
                      <MarkdownRenderer content={mod.esercizio_pratico} />
                    </div>

                    {solutionSteps.length > 0 && (
                      <div className="operations-roadmap">
                        <div className="roadmap-header">
                          <span className="roadmap-icon">&#x1F5FA;</span>
                          <span>{lang === 'it' ? 'Flusso delle Operazioni' : 'Operations Flow'}</span>
                        </div>
                        <div className="roadmap-steps">
                          {solutionSteps.map((step, idx) => (
                            <div
                              key={idx}
                              className={`roadmap-step ${step.done ? 'done' : ''} ${idx === activeStepIdx && !step.done ? 'current' : ''}`}
                              onClick={() => toggleStep(idx)}>
                              <div className={`step-marker ${step.done ? 'done' : idx === activeStepIdx && !step.done ? 'current' : ''}`}>
                                {step.done ? '\u2713' : idx + 1}
                              </div>
                              <div className="step-text">{step.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="formula-help">
                    <button className="help-toggle" onClick={() => setShowFormulaHelp(!showFormulaHelp)}>
                      <span>{showFormulaHelp ? '\u25BC' : '\u25B6'}</span>
                      <span>&#x1F4A1; {lang === 'it' ? 'Suggerimenti Operativi' : 'Operational Hints'}</span>
                    </button>
                    {showFormulaHelp && (
                      <div className="help-content">
                        <p className="help-intro">{lang === 'it'
                          ? 'Ripassa i concetti chiave della spiegazione sopra per affrontare ogni passaggio. Clicca su uno step per segnarlo come completato.'
                          : 'Review the key concepts from the explanation above to tackle each step. Click a step to mark it done.'}</p>
                        <div className="help-excerpt">
                          <MarkdownRenderer content={mod.spiegazione.slice(0, 300) + '…'} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {mod.status !== 'completed' && (
                  <>
                    <div className="form-group" style={{ marginTop: 16 }}>
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

                {mod.submittedSolution && mod.status === 'completed' && (
                  <div className="submitted-solution-box">
                    <div className="submitted-solution-label">{lang === 'it' ? 'La tua soluzione' : 'Your solution'}</div>
                    <pre className="submitted-solution-code">{mod.submittedSolution}</pre>
                  </div>
                )}

                {mod.status !== 'completed' && (
                  <div className="form-group" style={{ marginTop: 20 }}>
                    <h4 style={{ marginBottom: 8 }}>{t('needClarification')}</h4>
                    <textarea className="form-textarea" value={doubt} onChange={e => setDoubt(e.target.value)}
                              placeholder={t('doubtPlaceholder')} rows={3} />
                    <button className="btn btn-secondary" onClick={handleClarify} disabled={loading || !doubt.trim()} style={{ marginTop: 8 }}>
                      {t('askClarification')}
                    </button>
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

        <div className="study-bot-sidebar">
          <div className="study-bot-wrapper">
            <BotMascot mood={botMood} />
          </div>

          {error && (
            <div className="speech-bubble wrong-bubble">
              <div className="speech-bubble-title">⚠ {lang === 'it' ? 'Errore' : 'Error'}</div>
              <div className="speech-bubble-body">{error}</div>
            </div>
          )}

          {mod.hint && (
            <div className="speech-bubble hint-bubble">
              <div className="speech-bubble-title">💡 {t('hint')} ({t('attempt')} {mod.attempts}/2)</div>
              <div className="speech-bubble-body">{mod.hint}</div>
            </div>
          )}

          {mod.feedback && (
            <div className={`speech-bubble ${mod.feedback.esito}-bubble`}>
              <span className={`esito-badge ${mod.feedback.esito}`} style={{ marginBottom: 8 }}>{t(mod.feedback.esito)}</span>
              <div className="speech-bubble-body">
                <p style={{ marginBottom: 8 }}>{mod.feedback.commento_costruttivo}</p>
                <p style={{ color: 'var(--text-muted)' }}>{mod.feedback.suggerimento_miglioramento}</p>
              </div>
            </div>
          )}

          {mod.archived && (
            <div className={`speech-bubble hint-bubble`} style={mod.status === 'approfondire' ? { borderColor: 'var(--primary)' } : {}}>
              <div className="speech-bubble-body">
                {mod.status === 'approfondire' ? (
                  <>
                    <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>📝 {t('deepenLabel')}</p>
                    <p>{t('deepeningNote')}</p>
                    {mod.cosaManca && <p style={{ marginTop: 8, fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>"{mod.cosaManca}"</p>}
                  </>
                ) : (
                  <p>⚠️ {t('archived')} — {t('archivedAfterTwo')}</p>
                )}
              </div>
            </div>
          )}

          {clarification && (
            <div className="speech-bubble" style={{ borderColor: 'var(--primary)' }}>
              <div className="speech-bubble-title">💬 {t('clarification')}</div>
              <div className="speech-bubble-body">
                <p style={{ marginBottom: 8 }}><strong>{clarification.spiegazione_semplificata}</strong></p>
                {clarification.esempio_pratico && <p style={{ color: 'var(--text-muted)' }}>{clarification.esempio_pratico}</p>}
                {clarification.guida_step && <p style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap', marginTop: 8 }}>{clarification.guida_step}</p>}
              </div>
            </div>
          )}

          {!mod.hint && !mod.feedback && !error && !clarification && !mod.archived && mod.status !== 'completed' && (
            <div className="speech-bubble">
              <div className="speech-bubble-title">Pyxel</div>
              <div className="speech-bubble-body">
                {lang === 'it'
                  ? 'Scrivi la tua soluzione nella textarea a sinistra e clicca "Valuta" per ricevere un feedback.'
                  : 'Write your solution in the textarea on the left and click "Evaluate" to get feedback.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
