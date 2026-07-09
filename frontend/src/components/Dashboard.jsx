import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiUserStats, apiLeaderboard, apiUpdateProfile } from '../api';
import { t, getLang } from '../i18n';

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
  const [featuredB, setFeaturedB] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const lang = getLang();

  useEffect(() => {
    Promise.all([
      apiUserStats(user.token).catch(e => { setError(e.message); return null; }),
      apiLeaderboard(user.token).catch(e => { console.error(e); return []; }),
    ]).then(([s, lb]) => {
      setStats(s?.data || null);
      if (s?.data) {
        try {
          let fb = s.data.featured_badges;
          if (typeof fb === 'string') { fb = JSON.parse(fb); if (typeof fb === 'string') fb = JSON.parse(fb); }
          setFeaturedB(Array.isArray(fb) ? fb : []);
        } catch { setFeaturedB([]); }
      }
      setLeaderboard(lb?.data || []);
    }).finally(() => setLoading(false));
  }, [user.token]);

  if (loading) return <div className="card"><p>{t('loading')}</p></div>;
  if (!stats) return <div className="card"><p>{t('error')}{error ? `: ${error}` : ''}</p></div>;

  const earnedBadges = (() => {
    try {
      let b = stats.badges;
      if (typeof b === 'string') { b = JSON.parse(b); if (typeof b === 'string') b = JSON.parse(b); }
      return Array.isArray(b) ? b : [];
    } catch { return []; }
  })();

  const featuredBadges = (() => {
    try {
      let b = stats.featured_badges;
      if (typeof b === 'string') { b = JSON.parse(b); if (typeof b === 'string') b = JSON.parse(b); }
      return Array.isArray(b) ? b : [];
    } catch { return []; }
  })();

  /* XP progression (10 levels, same as V1 gamification.py) */
  const XP_THRESHOLDS = [0, 50, 120, 220, 350, 520, 740, 1020, 1370, 1800];
  const currentLevelXp = XP_THRESHOLDS[Math.min((stats.level || 1) - 1, XP_THRESHOLDS.length - 1)];
  const nextLevelXp = XP_THRESHOLDS[Math.min(stats.level || 1, XP_THRESHOLDS.length - 1)] || 2600;
  const xpInLevel = (stats.xp || 0) - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const totalAttempts = (stats.total_correct || 0) + (stats.total_wrong || 0);
  const accuracy = totalAttempts > 0 ? Math.round((stats.total_correct || 0) / totalAttempts * 100) : 0;

  async function handleAvatar(avatar) {
    try {
      await apiUpdateProfile(avatar, stats.theme_color, JSON.stringify(featuredB), user.token);
      setStats(s => ({ ...s, avatar }));
    } catch {}
  }

  async function handleTheme(color) {
    try {
      await apiUpdateProfile(stats.avatar, color, JSON.stringify(featuredB), user.token);
      setStats(s => ({ ...s, theme_color: color }));
    } catch {}
  }

  async function toggleFeaturedBadge(badgeId) {
    const newFeatured = featuredB.includes(badgeId)
      ? featuredB.filter(b => b !== badgeId)
      : [...featuredB, badgeId].slice(0, 3);
    setFeaturedB(newFeatured);
    try {
      await apiUpdateProfile(stats.avatar, stats.theme_color, JSON.stringify(newFeatured), user.token);
    } catch {}
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: '0 0 240px', textAlign: 'center', borderColor: stats.theme_color || 'var(--border)', borderWidth: 2 }}>
          <div style={{ fontSize: '4rem', marginBottom: 8 }}>{stats.avatar || '🤖'}</div>
          <h3>{user.username}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Lv. {stats.level || 1} — {stats.xp || 0} XP</p>
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 8 }}>
            {featuredB.map((bid, i) => {
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
              <div className="progress-bar" style={{ marginTop: 8, height: 6 }}>
                <div className="progress-fill" style={{ width: `${xpPercent}%`, background: stats.theme_color || 'var(--primary)' }} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {xpInLevel}/{xpNeeded} XP → Lv.{Math.min((stats.level || 1) + 1, 10)}
              </div>
            </div>
            <div className="stat-card">
              <div className="value">{stats.level || 1}</div>
              <div className="label">{t('level')}</div>
            </div>
            <div className="stat-card">
              <div className="value">{accuracy}%</div>
              <div className="label">Accuracy</div>
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
            const featured = featuredB.includes(b.id);
            return (
              <div key={b.id} className={`badge-item ${earned ? '' : 'locked'}`}
                   style={{ cursor: earned ? 'pointer' : 'default', border: featured ? `2px solid ${stats.theme_color || 'var(--primary)'}` : undefined, background: featured ? `${stats.theme_color || 'var(--primary)'}20` : undefined }}
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
              <h3>{t('publicProfile')}</h3>
              <button className="modal-close" onClick={() => setSelectedProfile(null)}>✕</button>
            </div>
            {(() => {
              const entry = leaderboard.find(l => l.user_id === selectedProfile);
              if (!entry) return <p>Utente non trovato.</p>;
              const fb = (() => {
                try {
                  let v = entry.featured_badges;
                  if (typeof v === 'string') { v = JSON.parse(v); if (typeof v === 'string') v = JSON.parse(v); }
                  return Array.isArray(v) ? v : [];
                } catch { return []; }
              })();
              const earned = (() => {
                try {
                  let v = entry.badges;
                  if (typeof v === 'string') v = JSON.parse(v);
                  return Array.isArray(v) ? v : [];
                } catch { return []; }
              })();
              const currentLevelXp = XP_THRESHOLDS[Math.min((entry.level || 1) - 1, XP_THRESHOLDS.length - 1)];
              const nextLevelXp = XP_THRESHOLDS[Math.min(entry.level || 1, XP_THRESHOLDS.length - 1)] || 2600;
              const xpIn = (entry.xp || 0) - currentLevelXp;
              const xpNeed = nextLevelXp - currentLevelXp;
              const pct = Math.min(100, Math.round((xpIn / xpNeed) * 100));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* TOP ROW: Identity + Stats */}
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    {/* Identity Block */}
                    <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface2)', borderRadius: 14, padding: 20, border: `2px solid ${entry.theme_color || 'var(--border)'}` }}>
                      <div style={{ fontSize: '3.5rem', marginBottom: 4 }}>{entry.avatar || '🤖'}</div>
                      <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>{entry.username}</h3>
                      <div style={{ width: '100%', marginTop: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Lv.{entry.level || 1}</span>
                          <span>{entry.xp || 0} / {nextLevelXp} XP</span>
                        </div>
                        <div className="progress-bar" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: entry.theme_color || '#1D9E75' }} />
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, minWidth: 180 }}>
                      <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, border: `1px solid ${entry.theme_color || 'rgba(255,255,255,0.05)'}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '1.8rem' }}>🔥</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F59E0B' }}>{entry.current_streak || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('streak')}</span>
                      </div>
                      <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, border: `1px solid ${entry.theme_color || 'rgba(255,255,255,0.05)'}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '1.8rem' }}>📦</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3B82F6' }}>{entry.total_modules_completed || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('totalModules')}</span>
                      </div>
                      <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16, border: `1px solid ${entry.theme_color || 'rgba(255,255,255,0.05)'}33`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '1.8rem' }}>🗺️</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#A855F7' }}>{entry.total_paths_completed || 0}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('pathsCompleted')}</span>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: Badge Showcase */}
                  <div style={{ background: 'var(--surface2)', borderRadius: 14, padding: 16 }}>
                    <h4 style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {t('badges')}
                    </h4>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {fb.slice(0, 3).map((bid, i) => {
                        const badge = ALL_BADGES.find(b => b.id === bid);
                        return (
                          <div key={i} style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #FFD700 0%, #B8860B 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.4rem', boxShadow: '0 0 12px rgba(255,215,0,0.3)',
                          }} title={badge?.name || bid}>
                            {badge ? badge.emoji : '🥇'}
                          </div>
                        );
                      })}
                      {fb.length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nessun badge in evidenza</span>
                      )}
                    </div>
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
