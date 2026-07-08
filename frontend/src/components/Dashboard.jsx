import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUserStats, apiLeaderboard, apiUpdateProfile } from '../api';
import { t } from '../i18n';

const ALL_BADGES = [
  { id: 'prima_risposta', name: 'Prima Risposta', emoji: '🎯', cat: 'achievement' },
  { id: 'studente', name: 'Studente (5 mod)', emoji: '📚', cat: 'milestone' },
  { id: 'laureato', name: 'Laureato (15 mod)', emoji: '🎓', cat: 'milestone' },
  { id: 'enciclopedico', name: 'Enciclopedico (10)', emoji: '📖', cat: 'milestone' },
  { id: 'saggio', name: 'Saggio (50 mod)', emoji: '🧙', cat: 'milestone' },
  { id: 'perfezionista', name: 'Perfezionista (3x)', emoji: '✨', cat: 'streak' },
  { id: 'fulmine', name: 'Fulmine (10x)', emoji: '⚡', cat: 'streak' },
  { id: 'modulo_perfetto', name: 'Modulo Perfetto', emoji: '💎', cat: 'performance' },
  { id: 'inarrestabile', name: 'Inarrestabile (7gg)', emoji: '🔥', cat: 'streak' },
  { id: 'fenice', name: 'Fenice', emoji: '🦅', cat: 'streak' },
  { id: 'maestro', name: 'Maestro (Lv5)', emoji: '👑', cat: 'level' },
  { id: 'leggenda', name: 'Leggenda (Lv10)', emoji: '🏆', cat: 'level' },
  { id: 'esploratore', name: 'Esploratore (3 topic)', emoji: '🧭', cat: 'achievement' },
  { id: 'percorso_completo', name: 'Percorso Completo', emoji: '🗺️', cat: 'achievement' },
  { id: 'centenario', name: 'Centenario (100)', emoji: '💯', cat: 'milestone' },
  { id: 'poliglotta', name: 'Poliglotta', emoji: '🌍', cat: 'achievement' },
  { id: 'nottambulo', name: 'Nottambulo', emoji: '🦉', cat: 'achievement' },
  { id: 'collezionista', name: 'Collezionista', emoji: '🏅', cat: 'achievement' },
  { id: 'pilota_automatico', name: 'Pilota Automatico', emoji: '🤖', cat: 'performance' },
  { id: 'sblocco_rapido', name: 'Sblocco Rapido', emoji: '🚀', cat: 'performance' },
];

const AVATARS = ['🤖', '🐱', '🐶', '🦊', '🐼', '🐨', '🐸', '🦉', '🐙', '🦋', '🐉', '🦄', '🐳', '🦜', '🐢', '🦖'];
const THEMES = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#EC4899', '#06B6D4', '#F97316'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState(null);

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

  const earnedBadges = (() => {
    try {
      if (typeof stats.badges === 'string') return JSON.parse(stats.badges);
      return stats.badges || [];
    } catch { return []; }
  })();

  const featuredBadges = (() => {
    try {
      if (typeof stats.featured_badges === 'string') return JSON.parse(stats.featured_badges);
      return stats.featured_badges || [];
    } catch { return []; }
  })();

  async function handleAvatar(avatar) {
    try {
      await apiUpdateProfile(avatar, stats.theme_color, stats.featured_badges, user.token);
      setStats(s => ({ ...s, avatar }));
    } catch {}
  }

  async function handleTheme(color) {
    try {
      await apiUpdateProfile(stats.avatar, color, stats.featured_badges, user.token);
      setStats(s => ({ ...s, theme_color: color }));
    } catch {}
  }

  async function toggleFeaturedBadge(badgeId) {
    const newFeatured = featuredBadges.includes(badgeId)
      ? featuredBadges.filter(b => b !== badgeId)
      : [...featuredBadges, badgeId].slice(0, 3);
    try {
      await apiUpdateProfile(stats.avatar, stats.theme_color, JSON.stringify(newFeatured), user.token);
      setStats(s => ({ ...s, featured_badges: JSON.stringify(newFeatured) }));
    } catch {}
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '0 0 240px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>{stats.avatar || '🤖'}</div>
          <h3>{user.username}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lv. {stats.level || 1} — {stats.xp || 0} XP</p>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
            {featuredBadges.map((bid, i) => {
              const badge = ALL_BADGES.find(b => b.id === bid);
              return badge ? <span key={i} style={{ fontSize: '1.5rem' }} title={badge.name}>{badge.emoji}</span> : null;
            })}
          </div>
        </div>

        <div style={{ flex: 1 }}>
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
              <div className="value">{stats.current_streak || 0}g</div>
              <div className="label">{t('streak')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.max_streak || 0}g</div>
              <div className="label">{t('maxStreak')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.total_correct || 0}</div>
              <div className="label">{t('correct')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.total_modules_completed || 0}</div>
              <div className="label">{t('completed')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.total_paths_completed || 0}</div>
              <div className="label">{t('pathsCompleted')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{earnedBadges.length}/{ALL_BADGES.length}</div>
              <div className="label">{t('badges')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🎨 {t('profile')}</h3>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t('avatar')}</h4>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => handleAvatar(a)}
                      style={{ fontSize: '1.8rem', padding: 4, border: stats.avatar === a ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 8, background: 'transparent', cursor: 'pointer' }}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{t('themeColor')}</h4>
          <div style={{ display: 'flex', gap: 8 }}>
            {THEMES.map(c => (
              <button key={c} onClick={() => handleTheme(c)}
                      style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: stats.theme_color === c ? '3px solid white' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3>🏅 {t('badges')}</h3>
        <div className="badges-grid">
          {ALL_BADGES.map(b => {
            const earned = earnedBadges.some(eb => (typeof eb === 'string' ? eb : eb.id || eb) === b.id);
            const featured = featuredBadges.includes(b.id);
            return (
              <div key={b.id} className={`badge-item ${earned ? '' : 'locked'}`}
                   style={{ cursor: earned ? 'pointer' : 'default', border: featured ? '2px solid var(--primary)' : undefined }}
                   onClick={() => earned && toggleFeaturedBadge(b.id)}>
                <div style={{ fontSize: '2rem' }}>{earned ? b.emoji : '🔒'}</div>
                <div className="badge-name">
                  {b.name}
                  {featured && ' ⭐'}
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Clicca su un badge guadagnato per metterlo in evidenza (max 3).
        </p>
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
              <span style={{ fontSize: '1.5rem' }}>{entry.avatar || '🤖'}</span>
              <span style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedProfile(selectedProfile === entry.user_id ? null : entry.user_id)}>
                {entry.username}
              </span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Lv.{entry.level} — {entry.xp} XP</span>
            </div>
          ))
        )}
      </div>

      {selectedProfile && (
        <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profilo pubblico</h3>
              <button className="modal-close" onClick={() => setSelectedProfile(null)}>✕</button>
            </div>
            {(() => {
              const entry = leaderboard.find(l => l.user_id === selectedProfile);
              if (!entry) return <p>Utente non trovato.</p>;
              const fb = (() => {
                try { return typeof entry.featured_badges === 'string' ? JSON.parse(entry.featured_badges) : (entry.featured_badges || []); }
                catch { return []; }
              })();
              return (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem' }}>{entry.avatar || '🤖'}</div>
                  <h3>{entry.username}</h3>
                  <p>Lv.{entry.level} — {entry.xp} XP — Streak: {entry.current_streak}g</p>
                  <p>{entry.total_modules_completed} moduli completati</p>
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 12 }}>
                    {fb.map((bid, i) => {
                      const badge = ALL_BADGES.find(b => b.id === bid);
                      return badge ? <span key={i} style={{ fontSize: '2rem' }} title={badge.name}>{badge.emoji}</span> : null;
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
