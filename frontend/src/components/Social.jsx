import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiSocialSearch, apiSocialSendRequest, apiSocialRespond, apiSocialPending, apiSocialFriends } from '../api';
import { t } from '../i18n';

export default function Social() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pending, setPending] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPending();
    loadFriends();
  }, []);

  async function loadPending() {
    try { const r = await apiSocialPending(); setPending(r.data || []); } catch {}
  }
  async function loadFriends() {
    try { const r = await apiSocialFriends(); setFriends(r.data || []); } catch {}
  }

  async function handleSearch() {
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const r = await apiSocialSearch(query.trim());
      setResults(r.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function handleSendRequest(friendId) {
    try { await apiSocialSendRequest(friendId); handleSearch(); } catch {}
  }

  async function handleRespond(fid, action) {
    try { await apiSocialRespond(fid, action); loadPending(); loadFriends(); } catch {}
  }

  return (
    <div className="card">
      <h2>{t('social')}</h2>

      <div className="form-group">
        <label>{t('searchUsers')}</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="form-input" value={query} onChange={e => setQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleSearch()}
                 placeholder={t('searchUsers')} />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? '...' : '🔍'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {results.map(u => (
            <div key={u.id} className="leaderboard-row" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: '1.5rem' }}>{u.avatar || '🤖'}</span>
              <span style={{ flex: 1 }}>{u.username} — Lv.{u.level || 1}</span>
              {u.friendship_status === 'accepted' ? (
                <span style={{ color: 'var(--teal)', fontSize: '0.8rem', fontWeight: 600 }}>{t('alreadyFriends')}</span>
              ) : u.friendship_status === 'pending' ? (
                <span style={{ color: 'var(--warning)', fontSize: '0.8rem', fontWeight: 600 }}>{t('requestSent')}</span>
              ) : (
                <button className="btn btn-sm btn-secondary" onClick={() => handleSendRequest(u.id)}>{t('sendRequest')}</button>
              )}
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && query.length >= 2 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('noUsersFound')}</p>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 10 }}>{t('pendingRequests')} ({pending.length})</h3>
          {pending.map(r => (
            <div key={r.id} className="leaderboard-row" style={{ padding: '8px 0' }}>
              <span style={{ flex: 1 }}>
                <strong>{r.username}</strong>
              </span>
              <button className="btn btn-sm btn-secondary" onClick={() => handleRespond(r.id, 'accept')} style={{ background: 'var(--success)', color: '#fff', border: 'none' }}>
                {t('accept')}
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handleRespond(r.id, 'reject')}>
                {t('reject')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 style={{ marginBottom: 10 }}>{t('myFriends')} ({friends.length})</h3>
        {friends.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('noFriends')}</p>
        ) : (
          friends.map(f => (
            <div key={f.id} className="leaderboard-row" style={{ padding: '8px 0' }}>
              <span style={{ fontSize: '1.5rem' }}>{f.avatar || '🤖'}</span>
              <span>{f.username}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 'auto' }}>Lv.{f.level || 1} — {f.xp || 0} XP</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
