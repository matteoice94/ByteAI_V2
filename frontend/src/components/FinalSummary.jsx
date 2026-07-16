import { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { apiFinalSummary } from '../api';
import { t, getLang } from '../i18n';

export default function FinalSummary() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = getLang();

  const { modules, sessionData } = location.state || {};
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const solutions = (modules || []).map(m => ({
        esercizio: m.esercizio_pratico || m.esercizio || '',
        soluzione: m.feedback?.soluzione || m.submittedSolution || '',
        esito: m.feedback?.esito || m.status || 'sbagliata',
        commento: m.feedback?.commento_costruttivo || '',
        punti_di_forza: m.feedback?.punti_di_forza || [],
        da_migliorare: m.feedback?.suggerimento_miglioramento || '',
      }));
      const diary = (modules || [])
        .filter(m => m.status === 'approfondire')
        .map(m => `${m.titolo_modulo}: ${m.cosaManca || 'da approfondire'}`);
      const res = await apiFinalSummary(solutions, diary, sessionData?.percorso_studio?.livello || 'base', sessionId, lang);
      setSummary(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!modules) {
    return <div className="card"><p>{t('error')}: {t('noSessionData')}</p></div>;
  }

  const completed = modules.filter(m => m.status === 'completed').length;
  const archived = modules.filter(m => m.archived).length;

  return (
    <div>
      {!summary && (
        <div className="card">
          <h2>{t('finalSummary')}</h2>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="value">{modules.length}</div>
              <div className="label">{t('totalModules')}</div>
            </div>
            <div className="stat-card">
              <div className="value" style={{ color: 'var(--success)' }}>{completed}</div>
              <div className="label">{t('completed')}</div>
            </div>
            <div className="stat-card">
              <div className="value" style={{ color: 'var(--warning)' }}>{archived}</div>
              <div className="label">{t('archived')}</div>
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? t('loading') : t('generateSummary')}
          </button>
        </div>
      )}

      {summary && (
        <>
          <div className="card">
            <h2>{t('finalSummary')}</h2>

            {summary.punti_di_forza?.length > 0 && (
              <div className="feedback-box correct" style={{ marginBottom: 16 }}>
                <h3>🌟 {t('strengths')}</h3>
                {summary.punti_di_forza.map((p, i) => (
                  <p key={i} className="strength-item">🌟 {p}</p>
                ))}
              </div>
            )}

            {summary.punti_da_migliorare?.length > 0 && (
              <div className="feedback-box" style={{ marginBottom: 16, borderColor: 'var(--primary)', background: 'rgba(59,130,246,0.08)' }}>
                <h3>🎯 {t('improvements')}</h3>
                {summary.punti_da_migliorare.map((p, i) => (
                  <p key={i} className="improvement-item">🎯 {p}</p>
                ))}
              </div>
            )}

            {summary.diario_di_bordo && (
              <div className="exercise-box" style={{ marginBottom: 16 }}>
                <h3>📖 {t('diary')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>{summary.diario_di_bordo}</p>
              </div>
            )}

            {summary.saluto_conclusivo && (
              <div style={{ marginTop: 20, padding: 16, background: 'var(--surface2)', borderRadius: 'var(--radius)', fontStyle: 'italic', color: 'var(--text-muted)', textAlign: 'center' }}>
                {summary.saluto_conclusivo}
              </div>
            )}

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button className="btn btn-primary" onClick={() => navigate('/')}>
                {t('newPath')}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/history')}>
                {t('history')}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                {t('dashboard')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
