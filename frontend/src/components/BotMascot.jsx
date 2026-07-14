import { useState, useEffect, useRef } from 'react';

const EXPRESSIONS = {
  neutral: '/robot_8bit_neutral_nomouth.svg',
  happy: '/robot_8bit_happy_v8.svg',
  thinking: '/robot_8bit_thinking_v4.svg',
};

// 12 glitch pixels from original SVG, positions relative to face area (192x120)
const PIXELS = [
  { left: 12.5, top: 20.0, color: '#4B0082', group: 1 },
  { left: 37.5, top: 40.0, color: '#64B5F6', group: 2 },
  { left: 62.5, top: 0.0,  color: '#E0E0E0', group: 3 },
  { left: 25.0, top: 60.0, color: '#64B5F6', group: 1 },
  { left: 50.0, top: 20.0, color: '#4B0082', group: 2 },
  { left: 75.0, top: 80.0, color: '#E0E0E0', group: 3 },
  { left: 12.5, top: 80.0, color: '#64B5F6', group: 1 },
  { left: 37.5, top: 0.0,  color: '#4B0082', group: 2 },
  { left: 87.5, top: 40.0, color: '#E0E0E0', group: 3 },
  { left: 25.0, top: 20.0, color: '#64B5F6', group: 3 },
  { left: 62.5, top: 60.0, color: '#4B0082', group: 2 },
  { left: 0.0,  top: 60.0, color: '#E0E0E0', group: 1 },
];

function GlitchPixels({ group }) {
  return PIXELS.filter(p => p.group === group).map((p, i) => (
    <div key={i} className={`glitch-px gp${group}`} style={{
      left: `${p.left}%`, top: `${p.top}%`,
      background: p.color,
    }} />
  ));
}

export default function BotMascot({ mood = 'neutral' }) {
  const [displayMood, setDisplayMood] = useState(mood);
  const [glitchKey, setGlitchKey] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (mood !== displayMood) {
      if (timerRef.current) clearTimeout(timerRef.current.t1);
      setGlitchKey(k => k + 1);
      const targetMood = mood;
      const t1 = setTimeout(() => {
        setDisplayMood(targetMood);
        setGlitchKey(0);
      }, 2500);
      timerRef.current = { t1 };
      return () => { clearTimeout(t1); };
    }
  }, [mood, displayMood]);

  return (
    <div className={`bot-mascot-container ${glitchKey > 0 ? 'glitching' : ''}`}>
      <img src={EXPRESSIONS[displayMood]} alt="Pyxel" className="bot-mascot-img" />
      {glitchKey > 0 && (
        <div key={glitchKey} className="bot-glitch-overlay">
          <GlitchPixels group={1} />
          <GlitchPixels group={2} />
          <GlitchPixels group={3} />
        </div>
      )}
    </div>
  );
}
