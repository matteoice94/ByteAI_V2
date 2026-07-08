import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGenerate } from '../api';
import { t, getLang } from '../i18n';

export default function PathGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate(e) {
    e.preventDefault();
    if (!topic || !level) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiGenerate(topic, level, name, getLang(), user.token);
      navigate(`/session/${res.session_id}`, { state: { sessionData: res.data, moduleDbIds: res.module_db_ids } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
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
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Studente" />
        </div>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? t('generating') : t('generate')}
        </button>
      </form>
    </div>
  );
}
