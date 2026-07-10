---
type: concept
title: "Split Screen Layout Pattern"
created: 2026-07-10
updated: 2026-07-10
tags: [ui, layout, frontend, split-screen]
complexity: basic
sources: ["[[ui-refactors-2026-07-10]]"]
summary: "65/35 flex split with sticky right sidebar for bot mascot and speech bubbles; stacks vertically on mobile."
---

# Split Screen Layout Pattern

Two-column asymmetric layout used across PathGenerator and ModuleView.

## Structure
- **Left (65%)**: scrollable content — forms, explanations, exercises, code editors
- **Right (35%)**: `position: sticky; top: 24px` — bot mascot + speech bubbles, always visible
- **Mobile (<750px)**: flex wraps to column, sidebar becomes `position: static`

## Speech Bubbles
Replace inline feedback/hint/error blocks. Bubble has:
- 16px radius, dark bg, color-coded border
- CSS triangle (`::before`/`::after`) pointing up toward bot
- Colors: warning (hint), success (correct), danger (wrong), primary (clarification)

## Why
- Eliminates vertical scrolling to see feedback after submitting
- Bot always visible as emotional anchor
- Separates "doing" (left) from "coaching" (right)
