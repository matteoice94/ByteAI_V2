import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFinalSummary } from '../api';
import { t, getLang } from '../i18n';

export default function FinalSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const lang = getLang();

  const { modules, sessionData } = location.state || {};
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const solutions = modules.map(m => ({
        domanda: m.esercizio_pratico,
        risposta: m.solution || '',
        valutazione: m.feedback?.esito || 'sbagliata',
      }));
      const res = await apiFinalSummary(solutions, [], sessionData?.percorso_studio?.livello, sessionId, lang);
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!modules) {
    return <div className="card"><p>{t('error')}: nessun dato sessione.</p></div>;
  }

  return (
    <div className="card">
      <h2>{t('finalSummary')}</h2>

      {!summary && (
        <>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="value">{modules.length}</div>
              <div className="label">Moduli</div>
            </div>
            <div className="stat-card">
              <div className="value">{modules.filter(m => m.status === 'completed').length}</div>
              <div className="label">{t('completed')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{modules.filter(m => m.archived).length}</div>
              <div className="label">{t('archived')}</div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? t('loading') : t('generate')}
          </button>
        </>
      )}

      {summary && (
        <>
          <div className="feedback-box correct">
            <h3>🌟 {t('strengths')}</h3>
            {summary.punti_di_forza?.map((p, i) => (
              <p key={i} className="strength-item">🌟 {p}</p>
            ))}
          </div>

          <div className="feedback-box" style={{ marginTop: 16, borderColor: 'var(--primary)' }}>
            <h3>🎯 {t('improvements')}</h3>
            {summary.punti_da_migliorare?.map((p, i) => (
              <p key={i} className="improvement-item">🎯 {p}</p>
            ))}
          </div>

          {summary.diario_di_bordo?.length > 0 && (
            <div className="exercise-box" style={{ marginTop: 16 }}>
              <h3>📖 {t('diary')}</h3>
              {summary.diario_di_bordo.map((e, i) => <p key={i} style={{ marginBottom: 6, fontSize: '0.9rem' }}>{e}</p>)}
            </div>
          )}

          {summary.saluto_conclusivo && (
            <p style={{ marginTop: 20, fontStyle: 'italic', color: 'var(--text-muted)' }}>{summary.saluto_conclusivo}</p>
          )}
        </>
      )}
    </div>
  );
}
