import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t, getLang } from '../i18n';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const lang = getLang();

  return (
    <div className="login-container">
      <div className="card login-card">
        <h1>{t('appTitle')}</h1>
        <p className="subtitle">Micro Learning Path Generator</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('username')}</label>
            <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t('loading') : (isRegister ? t('register') : t('login'))}
          </button>
        </form>
        <div className="login-toggle">
          {isRegister ? 'Hai già un account?' : 'Nuovo utente?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? t('login') : t('register')}
          </button>
        </div>
      </div>
    </div>
  );
}
