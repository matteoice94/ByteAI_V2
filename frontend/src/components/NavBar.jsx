import { NavLink } from 'react-router-dom';
import { t } from '../i18n';

export default function NavBar({ user, lang, onSwitchLang, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">MLPG</div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {t('newPath')}
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {t('history')}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          {t('dashboard')}
        </NavLink>
      </div>
      <div className="navbar-right">
        <button className={`lang-btn ${lang === 'it' ? 'active' : ''}`} onClick={() => onSwitchLang('it')}>IT</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => onSwitchLang('en')}>EN</button>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.username}</span>
        <button className="btn btn-secondary btn-sm" onClick={onLogout}>{t('logout')}</button>
      </div>
    </nav>
  );
}
