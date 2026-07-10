import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

let _id = 0;

export function NotificationProvider({ children }) {
  const [queue, setQueue] = useState([]);

  const notify = useCallback((type, data) => {
    const id = ++_id;
    setQueue(q => [...q, { id, type, data }]);
    if (type === 'xp') {
      setTimeout(() => setQueue(q => q.filter(n => n.id !== id)), 3500);
    } else {
      setTimeout(() => setQueue(q => q.filter(n => n.id !== id)), 4000);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {queue.map(n => (
        <Notification key={n.id} {...n} />
      ))}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotificationContext).notify;
}

function Notification({ type, data }) {
  if (type === 'xp') return <XpSnackbar data={data} />;
  return <AchievementPopup data={data} />;
}

function AchievementPopup({ data }) {
  const { icon, title, subtitle, color } = data;
  return (
    <div className="achievement-overlay">
      <div className="achievement-popup" style={{ borderColor: color || '#534AB7' }}>
        <div className="popup-glitch-bars" />
        <div className="popup-icon">{icon}</div>
        <div className="popup-title" style={{ color: color || '#534AB7' }}>{title}</div>
        <div className="popup-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

function XpSnackbar({ data }) {
  const { xpGain, newXp, newLevel, oldLevel, xpPercent } = data;
  const levelUp = newLevel > oldLevel;
  return (
    <div className={`xp-snackbar ${levelUp ? 'level-up' : ''}`}>
      <div className="xp-snackbar-icon">{levelUp ? '\u2B06' : '\u26A1'}</div>
      <div className="xp-snackbar-content">
        <div className="xp-snackbar-text">
          {levelUp
            ? `Level ${oldLevel} \u2192 ${newLevel}!`
            : `+${xpGain} XP`}
        </div>
        <div className="xp-bar-container">
          <div className="xp-bar-fill" style={{ '--xp-pct': `${xpPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
