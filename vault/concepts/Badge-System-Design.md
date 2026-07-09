---
type: concept
title: "Badge System Design"
created: 2026-07-08
updated: 2026-07-08
tags: [gamification, badges, achievements, svg]
complexity: intermediate
aliases: ["Achievement System", "Gamification Badges"]
related: ["[[gamification-py-2026-07-08]]", "[[XP Progression Curve]]", "[[Streak and Phoenix Mechanic]]"]
sources: ["[[gamification-py-2026-07-08]]"]
---

# Badge System Design

MLPG's 20-badge achievement system with bilingual labels and SVG rendering.

## Architecture

### Badge Definition Format
```python
BADGES = {
    "badge_key": {
        "icon": "🥇",
        "name_it": "Nome Italiano",
        "name_en": "English Name",
        "desc_it": "Descrizione italiana",
        "desc_en": "English description",
    }
}
```

### Check Pipeline
`check_badges(stats)` runs all 20 conditions in sequence:
1. Each condition evaluates a stat field: `stats.get("total_modules_completed", 0) >= 5`
2. If condition is True AND badge not already earned → add to `new` list
3. After all badges checked → check Collector (any 5 badges earned)
4. Return `(new_badges, all_earned)`

### Badge Categories and Colors
| Category | Color | Hex |
|----------|-------|-----|
| Moduli (completion) | Green | #4CAF50 |
| Precisione (accuracy) | Blue | #2196F3 |
| Streak (consistency) | Orange | #FF9800 |
| Livelli (level) | Purple | #9C27B0 |
| Traguardi (milestones) | Gold | #FFC107 |

### SVG Rendering
`badge_svg()` creates a 60x60 double-ring SVG:
- Outer ring: category color at 30% opacity
- Main circle: category color with dark border
- Inner gradient: radial white-to-light for 3D effect
- Emoji icon centered at font-size 22
- Locked badges: gray colors + 🔒 icon
- Counter variable (`_svg_counter`) prevents ID collisions when rendering multiple badges on one page

## Design Decisions
- **Categories for color coding**: Users visually distinguish badge types without reading text
- **Bilingual from the start**: Each badge has IT and EN names/descriptions, not separate localization
- **Collector as meta-badge**: Rewards badge diversity, encouraging varied activity patterns
- **Emoji icons in SVG text**: Simple, universal, no image assets needed
