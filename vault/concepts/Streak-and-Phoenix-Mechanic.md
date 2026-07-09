---
type: concept
title: "Streak and Phoenix Mechanic"
created: 2026-07-08
updated: 2026-07-08
tags: [gamification, streak, retention, engagement]
complexity: basic
aliases: ["Daily Streak", "Phoenix Recovery", "Engagement Loop"]
related: ["[[gamification-py-2026-07-08]]", "[[XP Progression Curve]]", "[[Badge System Design]]"]
sources: ["[[gamification-py-2026-07-08]]"]
---

# Streak and Phoenix Mechanic

Two interconnected gamification mechanics: daily streaks for consistent engagement, and phoenix recovery for returning users.

## Streak Algorithm

```python
def update_streak(stats):
    today = date.today()
    last = stats["last_active_date"]

    if last == today:
        return (streak, max_streak, False)  # same day, no change

    if last == yesterday:
        streak += 1  # consecutive day

    elif gap >= 7 days:
        if no_prior_phoenix:
            is_phoenix = True  # trigger phoenix badge
        streak = 1  # reset

    else:
        streak = 1  # reset (short gap, no phoenix)
```

## Key Behaviors

| Scenario | Streak | Phoenix | UX Effect |
|----------|--------|---------|-----------|
| Login same day | Unchanged | No | Idempotent |
| Login next day | +1 | No | Accumulates |
| Skip 2-6 days | Reset to 1 | No | Lost streak |
| Skip 7+ days | Reset to 1 | Yes (once) | Badge reward |
| Never had phoenix | — | Eligible | One-shot |

## Phoenix Purpose
Returns from long absence (7+ days) are celebrated instead of punished. The user gets the Phoenix badge + motivational welcome message, encouraging re-engagement rather than guilt over a broken streak.

## Implementation Notes
- `phoenix_earned` is a boolean flag in `database.py` (`INTEGER DEFAULT 0`), set to 1 when first triggered
- `is_phoenix` is only True the first time user returns after 7+ day gap
- Phoenix badge check: `stats.get("phoenix_earned", 0) >= 1`
- Once earned, never re-triggered (prevents exploiting periodic absences for badge farming)

## Integration with Database
`track_wrong_answer()` and `award_user_xp()` both call `update_streak()` and persist the result to `user_stats.current_streak` and `user_stats.max_streak`.
