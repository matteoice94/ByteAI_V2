import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Component } from 'react';
import Login from './components/Login';
import PathGenerator from './components/PathGenerator';
import ModuleView from './components/ModuleView';
import FinalSummary from './components/FinalSummary';
import History from './components/History';
import Dashboard from './components/Dashboard';
import NavBar from './components/NavBar';
import { getLang, setLang, t } from './i18n';
import { useState } from 'react';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return <div className="card" style={{margin:40,color:'var(--danger)'}}>
        <h2>Crash</h2><pre>{this.state.error.message}</pre>
      </div>;
    }
    return this.props.children;
  }
}

export default function App() {
  const { user, logout } = useAuth();
  const [lang, setLangState] = useState(getLang());

  function switchLang(l) {
    setLang(l);
    setLangState(l);
  }

  if (!user) return <Login />;

  return (
    <div className="app">
      <NavBar user={user} lang={lang} onSwitchLang={switchLang} onLogout={logout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<PathGenerator />} />
          <Route path="/session/:sessionId" element={<ModuleView />} />
          <Route path="/summary/:sessionId" element={<ErrorBoundary><FinalSummary /></ErrorBoundary>} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
