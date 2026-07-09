---
type: source
title: "MLPG Gamification System"
created: 2026-07-08
updated: 2026-07-08
tags: [mlpg, gamification, xp, badges, streaks]
source_type: code
url: "src/gamification.py"
author: "MLPG Project"
confidence: high
key_claims:
  - "10-level XP curve with progressive thresholds from 0 to 1800"
  - "20 badge definitions across 5 categories with bilingual (IT/EN) labels"
  - "Streak tracking with automatic break detection and phoenix mechanic (return after 7+ days)"
summary: "238-line gamification engine: XP system (4 action types), 20 badges (5 categories), daily streak tracking with phoenix recovery, and SVG badge rendering with dual-ring style in 5 color themes."
related: ["[[XP Progression Curve]]", "[[Badge System Design]]", "[[Streak and Phoenix Mechanic]]"]
sources: []
---

# MLPG Gamification System

`src/gamification.py` (238 lines) implements the complete gamification loop.

## XP System

### Progression Curve
Levels use progressive thresholds: 0, 50, 120, 220, 350, 520, 740, 1020, 1370, 1800. Beyond level 10, each level costs +200 XP.

### Actions & Rewards
| Action | Base XP | Bonus |
|--------|---------|-------|
| `module_completed` | 15 | +10 if first try |
| `path_completed` | 25 | — |
| `clarification` | 2 | — |

### Key Functions
- `level_from_xp(xp)`: Binary-search-like level lookup
- `xp_to_next_level(xp)`: Returns (current_level, total_needed, progress) for progress bars
- `award_xp(reason)`: Maps action string to XP value

## Badge System

### 20 Badges in 5 Categories
| Category | Badges |
|----------|--------|
| **Moduli** (green) | First Answer, Student (5), Encyclopedic (10), Graduate (15), Sage (50) |
| **Precisione** (blue) | Perfectionist (3 streak), Lightning (10 streak), Perfect Module (0 errors) |
| **Streak** (orange) | Unstoppable (7d), Phoenix (return after 7d) |
| **Livelli** (purple) | Master (Lv5), Legend (Lv10) |
| **Traguardi** (gold) | Path Master, Explorer (3 topics), Centurion (100 correct), Collector (any 5), Night Owl (3x after 10PM), Polyglot (IT+EN) |

### Check Logic
`check_badges(stats)`: Iterates all 20 conditions → returns (newly_earned, all_earned). Collector badge checked last (after all others processed).

### SVG Rendering
`badge_svg(key, lang, size, locked)`: Renders double-ring SVG with radial gradient. 5 color palettes (green/blue/orange/purple/gold). Locked badges render in gray with 🔒 icon. Counter variable prevents SVG ID collisions.

## Streak System

### Daily Tracking
`update_streak(stats)`: Checks `last_active_date`:
- Same day → no change
- Yesterday → increment streak
- Gap ≥ 7 days AND no prior phoenix → trigger phoenix mechanic
- Otherwise → reset to 1

### Phoenix Mechanic
When a user returns after 7+ days of inactivity: sets `phoenix_earned = 1` (in database.py), triggers Phoenix badge check. Once earned, never re-triggered (prevents exploiting absence).
