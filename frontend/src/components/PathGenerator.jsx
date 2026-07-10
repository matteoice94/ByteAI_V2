import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGenerate } from '../api';
import { t, getLang } from '../i18n';
import BotMascot from './BotMascot';

export default function PathGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botMood, setBotMood] = useState('neutral');
  const lang = getLang();

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic || !level) return;
    setLoading(true);
    setError('');
    setBotMood('thinking');
    try {
      const res = await apiGenerate(topic, level, name, getLang(), user.token);
      navigate(`/session/${res.session_id}`, { state: { sessionData: res.data, moduleDbIds: res.module_db_ids } });
    } catch (err) {
      setError(err.message);
      setBotMood('neutral');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="study-layout">
      <div className="study-content">
        <div className="card">
          <h2>{t('newPath')}</h2>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>{t('topic')}</label>
              <input className="form-input" value={topic} onChange={e => setTopic(e.target.value)}
                     placeholder="es. Python decorators, SQL joins, algebra lineare" required />
            </div>
            <div className="form-group">
              <label>{t('level')}</label>
              <select className="form-select" value={level} onChange={e => setLevel(e.target.value)} required>
                <option value="">{t('selectLevel')}</option>
                <option value="base">{t('base')}</option>
                <option value="intermedio">{t('intermediate')}</option>
                <option value="avanzato">{t('advanced')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('yourName')}</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder={t('namePlaceholder')} />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? t('generating') : t('generate')}
            </button>
          </form>
        </div>
      </div>

      <div className="study-bot-sidebar">
        <div className="study-bot-wrapper">
          <BotMascot mood={botMood} />
        </div>
        <div className="speech-bubble">
          <div className="speech-bubble-title">Pyxel</div>
          <div className="speech-bubble-body">
            {lang === 'it'
              ? 'Ciao! Inserisci un argomento e scegli il livello per generare il tuo percorso di micro-learning personalizzato.'
              : 'Hi! Enter a topic and choose a level to generate your personalized micro-learning path.'}
          </div>
        </div>
      </div>
    </div>
  );
}
