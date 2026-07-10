---
type: concept
title: "Step Card Navigation Pattern"
created: 2026-07-09
updated: 2026-07-09
tags: [ui, navigation, css-grid, frontend, react]
complexity: basic
aliases: ["Step Cards", "Module Cards"]
related: ["[[Streamlit-State-Management|Streamlit State Management]]"]
sources: ["[[moduleview-step-cards-2026-07-09]]"]
summary: "Horizontal CSS Grid card navigation replacing dual redundant UI elements. Cards show circular status badge + title with 5 visual states (completed/active/archived/deepen/pending) and hover animation."
---

# Step Card Navigation Pattern

A unified horizontal navigation component that replaces redundant dual-UI patterns (timeline nodes + tab buttons) with a single, status-aware CSS Grid layout.

## Core Design

### Why Replace Dual UI
Having two separate navigation elements (timeline + tabs) that show the same content creates:
- Vertical space waste (two rows for one purpose)
- Cognitive load (user must process both)
- Maintenance burden (two code paths for same action)

### The Step Card Solution
A single CSS Grid row with 3 cards, each containing:
- **Left**: Circular badge (32px) with status icon and background color
- **Right**: Module title (2-line clamp with ellipsis)

## Visual Language

### Color Semantics
- **Teal #1D9E75** — Completion. Associated with success, achievement. Used for `.completed` border + badge bg.
- **Purple #534AB7** — Active/current. Warm but distinct from primary blue. Used for `.active` border + glow + badge bg.
- **Warning orange** — Archived/waiting. Signals "not done, but paused". Used for `.archived` and `.deepen` badge bg.
- **Translucent rgba(255,255,255,0.08)** — Pending/inert. Barely visible; doesn't compete for attention.

### Motion Design
- **Hover**: `translateY(-2px)` + lighter background. Subtle lift that says "clickable" without being distracting.
- **Active pulse**: `box-shadow` ring expansion from 0→8px over 2 seconds. Continuously draws attention to current step without blinking.
- **Transitions**: `0.2s ease` on all properties for smooth state changes.

## CSS Implementation

```css
.step-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
```

Always 3 columns regardless of module count (MLPG always generates 3 modules). Equal `1fr` widths ensure consistent sizing even with varying title lengths.

## State Machine

```
┌──────────┐  user clicks  ┌────────┐  correct answer  ┌───────────┐
│ pending  │ ────────────▶ │ active │ ───────────────▶ │ completed │
│ (○ grey) │               │ (● pur)│                  │ (✓ teal)  │
└──────────┘               └────────┘                  └───────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
              ┌──────────┐ ┌───────────┐ ┌───────────┐
              │ archived │ │  deepen   │ │  hinted   │
              │ (📦 warn)│ │ (📝 blue) │ │ (same as  │
              └──────────┘ └───────────┘ │  active)  │
                                         └───────────┘
```
