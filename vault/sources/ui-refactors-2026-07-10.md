---
type: source
title: "UI Refactors — July 10 Session"
created: 2026-07-10
updated: 2026-07-10
tags: [frontend, ui, bot, layout, exercise, dashboard, forms, code-blocks]
source_type: note
confidence: high
key_claims:
  - "Split-screen layout (65/35) with sticky bot sidebar replaced single-column layout across PathGenerator and ModuleView"
  - "Bot mascot with 3 expressions (neutral/happy/thinking) and glitch pixel transitions extracted from original SVG"
  - "Exercise restructured into Problem Data box + Operations Roadmap + Formula Help accordion"
  - "Dashboard stats redesigned as Bento Grid with gradient cards, 32px values, streak in Coral"
  - "All form inputs unified: #0b132b bg, Teal focus, italic placeholder, 680px max-width container"
  - "Code blocks styled as IDE panels with macOS traffic light dots, dark bg #050a14, custom scrollbar"
  - "max_tokens added to API calls (4096 for paths, 1024 for evals) fixing truncated JSON responses"
summary: "Comprehensive UI overhaul session: split-screen layout, bot mascot with glitch animations, structured exercise panels, Bento Grid dashboard, unified form styling, IDE-style code blocks, avatar/theme selectors, and leaderboard refinements."
related: ["[[Split-Screen-Layout-Pattern]]", "[[Bot-Mascot-Integration]]", "[[Exercise-Structured-Layout]]"]
sources: []
---

# UI Refactors — July 10, 2026

Comprehensive frontend overhaul touching every major component.

## Changes Summary

### 1. Split-Screen Layout
- **Files**: `App.css`, `PathGenerator.jsx`, `ModuleView.jsx`
- `study-layout`: flex with 65% content + 35% sticky sidebar
- Right sidebar contains bot mascot + speech bubbles
- Speech bubbles replace inline hint-box, feedback-box, error-msg
- Bubble CSS: rounded 16px, triangle arrow pointing up toward bot
- Color-coded: orange (hint), green (correct), red (wrong), blue (clarification)
- Responsive: stacks vertically below 750px

### 2. Bot Mascot with Glitch
- **New file**: `BotMascot.jsx`
- 3 expressions via separate SVGs: neutral, happy, thinking
- Context-based mood: idle=neutral, loading=thinking, correct=happy, wrong=neutral
- Glitch transition: 12 pixel-art squares from original SVG mapped to face area
- 3 animation groups (gpx1/gpx2/gpx3) on 2.5s cycle with `forwards`
- Glitch confined to face area using proportional CSS positioning
- Expression changes at end of glitch cycle (simultaneous with overlay removal)
- No shake, no dark overlay — neutral face visible during glitch

### 3. Structured Exercise Layout
- **Files**: `ModuleView.jsx`, `App.css`
- Replaced flat exercise-box with 3-panel layout:
  - `problem-data-box`: exercise text isolated with icon header
  - `operations-roadmap`: interactive step checklist (auto-parsed from text)
  - `formula-help`: collapsible accordion with theory excerpt
- Desktop: 2-column grid (data left, roadmap right); mobile: stacked
- Completed modules show submitted solution in a green-bordered box

### 4. Dashboard Bento Grid
- **Files**: `App.css`, `Dashboard.jsx`
- Stats grid: `repeat(auto-fit, minmax(140px, 1fr))`
- Cards: gradient bg, 14px radius, hover lift 3px
- Values: 32px extra-bold white; labels: 12px uppercase semi-opaque
- Streak cards: Coral `#D85A30` with text-shadow glow
- Progress bar integrated in XP card

### 5. Form Inputs Refactor
- **Files**: `App.css`, `PathGenerator.jsx`
- All inputs: bg `#0b132b`, border `rgba(255,255,255,0.08)`, radius 10px
- Focus: Teal `#1D9E75` border + box-shadow glow 15%
- Placeholder: `rgba(255,255,255,0.4)` italic
- Form container: max-width 680px centered

### 6. IDE-style Code Blocks
- **Files**: `App.css`
- `<pre>` blocks: bg `#050a14`, 12px radius, box-shadow depth
- Header bar via `::before`: 36px, semi-transparent, bottom border
- macOS traffic lights via `::after`: red/yellow/green dots via box-shadow
- `line-height: 1.6`, padding 20px + 48px top for header
- Custom scrollbar: 6px thin, dark semi-transparent thumb

### 7. Avatar/Theme + Leaderboard
- **Files**: `App.css`, `Dashboard.jsx`
- Avatar buttons: scale(1.15) on hover/select, purple ring `#534AB7`
- Theme buttons: same scale + outer ring box-shadow
- Leaderboard rows: border `rgba(255,255,255,0.04)`, hover bg `rgba(255,255,255,0.02)`

### 8. Backend Fixes
- `src/config.py`: added `CHAT_MAX_TOKENS_*` constants (PATH=4096, EVAL=1024, HINT=256, SUMMARY=2048)
- `src/generator.py`: `max_tokens` propagated through `_openrouter_chat_completion` → `_get_chat_response_text` → all callers
- `Prompts/system_mlpg.md` + `_en.md`: added text-only exercise constraint
