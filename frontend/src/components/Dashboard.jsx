import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUserStats, apiLeaderboard } from '../api';
import { t } from '../i18n';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiUserStats(user.token).catch(() => null),
      apiLeaderboard(user.token).catch(() => []),
    ]).then(([s, lb]) => {
      setStats(s?.data || null);
      setLeaderboard(lb?.data || []);
    }).finally(() => setLoading(false));
  }, [user.token]);

  if (loading) return <div className="card"><p>{t('loading')}</p></div>;
  if (!stats) return <div className="card"><p>{t('error')}</p></div>;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{stats.xp || 0}</div>
          <div className="label">{t('xp')}</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.level || 1}</div>
          <div className="label">{t('level')}</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.current_streak || 0}</div>
          <div className="label">{t('streak')}</div>
        </div>
        <div className="stat-card">
          <div className="value">{(stats.badges && typeof stats.badges === 'string' ? JSON.parse(stats.badges).length : stats.badges?.length) || 0}</div>
          <div className="label">{t('badges')}</div>
        </div>
      </div>

      <div className="card">
        <h3>{t('badges')}</h3>
        <div className="badges-grid">
          {(typeof stats.badges === 'string' ? JSON.parse(stats.badges) : stats.badges || []).map((b, i) => (
            <div key={i} className="badge-item">
              <div>🏅</div>
              <div className="badge-name">{typeof b === 'string' ? b : b.name || b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>{t('leaderboard')}</h3>
        {leaderboard.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nessun dato.</p>
        ) : (
          leaderboard.map((entry, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontWeight: 700, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text-muted)', width: 24 }}>
                #{i + 1}
              </span>
              <span style={{ flex: 1 }}>{entry.username}</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{entry.xp} XP</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
