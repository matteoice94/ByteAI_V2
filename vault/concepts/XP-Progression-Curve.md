---
type: concept
title: "XP Progression Curve"
created: 2026-07-08
updated: 2026-07-08
tags: [gamification, xp, levels, progression]
complexity: basic
aliases: ["Level Progression", "XP Threshold Design"]
related: ["[[gamification-py-2026-07-08]]", "[[Badge System Design]]"]
sources: ["[[gamification-py-2026-07-08]]"]
---

# XP Progression Curve

The mathematical formula behind MLPG's 10-level XP system.

## Curve Design
Levels use increasing thresholds to create early gratification (fast early leveling) followed by longer challenges:

| Level | XP Required | Delta |
|-------|-------------|-------|
| 1 | 0 | — |
| 2 | 50 | 50 |
| 3 | 120 | 70 |
| 4 | 220 | 100 |
| 5 | 350 | 130 |
| 6 | 520 | 170 |
| 7 | 740 | 220 |
| 8 | 1020 | 280 |
| 9 | 1370 | 350 |
| 10 | 1800 | 430 |

Beyond level 10: each additional level costs +200 XP (linear extension).

## Implementation

```python
def level_from_xp(xp: int) -> int:
    for i, threshold in enumerate(XP_PER_LEVEL):
        if xp < threshold:
            return i  # Level 0 = just started
    extra = xp - XP_PER_LEVEL[-1]
    return len(XP_PER_LEVEL) + extra // 200
```

`xp_to_next_level(xp)` returns `(current_level, total_needed, progress)` for rendering progress bars in the UI.

## Design Rationale
- **Fast start**: Level 1→2 only needs 50 XP (3.3 modules at 15 XP each)
- **Accelerating difficulty**: Each level costs more than the last
- **No ceiling**: Linear extension post-10 ensures infinite progression
- **Granular rewards**: Small XP amounts (2-25) allow fine-grained activity tracking
