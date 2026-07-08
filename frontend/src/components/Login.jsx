import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { t, getLang, setLang } from '../i18n';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLangState] = useState(getLang());

  function switchLang(l) {
    setLang(l);
    setLangState(l);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length < 4) {
      setError(lang === 'it' ? 'Password troppo corta (min 4 caratteri).' : 'Password too short (min 4 characters).');
      return;
    }
    if (isRegister && password !== passwordConfirm) {
      setError(lang === 'it' ? 'Le password non coincidono.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(username, password);
      else await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <img src="/logos/robot_8bit_neutral_nomouth.svg" alt="Robot" style={{ width: 80, height: 80, imageRendering: 'pixelated' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <button className={`lang-btn ${lang === 'it' ? 'active' : ''}`} onClick={() => switchLang('it')}>🇮🇹 IT</button>
          <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => switchLang('en')}>🇬🇧 EN</button>
        </div>
      </div>
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
          {isRegister && (
            <div className="form-group">
              <label>{lang === 'it' ? 'Conferma password' : 'Confirm password'}</label>
              <input className="form-input" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required />
            </div>
          )}
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
