---
type: meta
title: "Hot Cache"
updated: 2026-07-10T20:00:00
---
# Recent Context

## Last Updated
2026-07-10 — Named bot "Pyxel" and site "ByteAI"; applied across all UI surfaces

## Key Recent Facts
- Split-screen layout (65/35) with sticky bot sidebar used across PathGenerator and ModuleView
- Bot mascot with 3 expressions (neutral/happy/thinking) and 12-pixel glitch transitions from original SVG
- Exercise restructured: Problem Data box + Operations Roadmap + Formula Help accordion
- Dashboard stats: Bento Grid with gradient cards, 32px values, Coral streak highlight
- Form inputs unified: #0b132b bg, Teal #1D9E75 focus, italic placeholder
- Code blocks: IDE-style with macOS traffic lights, dark bg #050a14, custom scrollbar
- max_tokens added to API (4096 paths, 1024 evals) fixing truncated JSON
- System prompts forbid graphical exercises (text-only constraint)
- Submitted solutions show in left column (not speech bubble)
- Bot mascot named "Pyxel" (pixel reference); site rebranded to "ByteAI" (8-bit reference)
- CSS animated background: breathing gradient (8s) + CRT scanlines + vignette + floating pixel squares + cursor glow + shimmer cards + Pyxel aura + NavBar micro-glitch
- Heuristic filter fixed: keyword overlap now bypassed for substantial answers (>8 words, >60 alpha chars); unique char check uses absolute count (<8 unique chars = spam) instead of ratio (which always failed for texts >86 chars due to 26-letter alphabet)

## Recent Changes
- Created: vault/sources/ui-refactors-2026-07-10.md
- Created: vault/concepts/Split-Screen-Layout-Pattern.md, vault/concepts/Bot-Mascot-Integration.md, vault/concepts/Exercise-Structured-Layout.md
- Updated: vault/index.md, vault/sources/_index.md, vault/concepts/_index.md

## Active Threads
- Vault: 9 sources, 1 entity, 18 concepts — 28 pages total
- Full V2 UI architecture captured: layout, bot, exercises, dashboard, forms, code blocks
- Bot glitch transitions working; expression flow: neutral → glitch → target expression
