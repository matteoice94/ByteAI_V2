---
type: source
title: "ModuleView — Step Cards Navigation"
created: 2026-07-09
updated: 2026-07-09
tags: [frontend, react, ui, navigation, module-view]
source_type: note
confidence: high
key_claims:
  - "Replaced redundant dual navigation (timeline nodes + tab buttons) with unified CSS Grid step cards"
  - "Step cards use a circular status badge (left) + module title (right) with 5 visual states"
  - "Active card uses purple border (#534AB7) with pulsing glow animation; completed uses teal (#1D9E75)"
summary: "Frontend refactor that unified the dual module navigation UI (stepIndicator timeline + .tabs buttons) into a single horizontal CSS Grid component with status-aware styling."
related: ["[[Step-Card-Navigation-Pattern]]"]
sources: []
---

# ModuleView — Step Cards Navigation (July 9, 2026)

Refactored the module navigation in `frontend/src/components/ModuleView.jsx` to eliminate visual redundancy.

## Before

Two separate UI elements showed identical module titles:
1. **stepIndicator**: Horizontal timeline with circular emoji buttons (⚪/🔵/✅/📦) + 20-char truncated titles + status labels, connected by → arrows
2. **tab-buttons**: Pill-shaped buttons (`.tab-btn`, `border-radius: 999px`) with emoji + full module titles, blue background when active

Both called `setSelectedIdx(i)` on click. Both showed the same status information.

## After

Single unified component: `.step-cards` — a CSS Grid row with 3 cards.

### Card Structure
```html
<div class="step-cards">
  <div class="step-card [completed|active|archived|deepen]">
    <div class="step-badge [badge-completed|badge-active|badge-archived|badge-pending]">
      ✓ / ● / 📦 / ○
    </div>
    <div class="step-title">Module Title</div>
  </div>
</div>
```

### CSS States
| State | Border | Badge BG | Badge Icon |
|-------|--------|----------|------------|
| `.completed` | Teal #1D9E75 | Teal #1D9E75 | ✓ (white) |
| `.active` | Purple #534AB7 + glow | Purple #534AB7 | ● (white, pulsing) |
| `.archived` | Warning orange | Warning orange | 📦 (white) |
| `.deepen` | Primary blue | Warning orange | 📝 (white) |
| (pending) | rgba(255,255,255,0.08) | Dark bg + border | ○ (muted) |

### Interaction
- Hover: translate up 2px + lighter background (`var(--surface2)`)
- Click: `setSelectedIdx(i)` + clear clarification/error state
- Active badge uses `@keyframes stepPulse` animation (2s infinite loop)

## Files Changed
- `frontend/src/components/ModuleView.jsx`: Replaced `stepIndicator` useMemo with `stepCards` useMemo; removed `.tabs` div
- `frontend/src/App.css`: Replaced `.tabs`/`.tab-btn` styles with `.step-cards`/`.step-card`/`.step-badge`/`.step-title` + `@keyframes stepPulse`
