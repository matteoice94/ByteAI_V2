---
type: concept
title: "Bot Mascot Integration"
created: 2026-07-10
updated: 2026-07-10
tags: [ui, bot, animation, glitch, frontend]
complexity: intermediate
sources: ["[[ui-refactors-2026-07-10]]"]
summary: "Pixel-art bot with 3 context-based expressions and glitch pixel transitions extracted from original animated SVG."
---

# Bot Mascot Integration

The `BotMascot` component renders a pixel-art robot that responds to user interaction context.

## Expression States
| State | Trigger | SVG |
|-------|---------|-----|
| neutral | Idle, wrong answer, error | `robot_8bit_neutral_nomouth.svg` |
| thinking | Generating, evaluating, fetching hint/clarification | `robot_8bit_thinking_v4.svg` |
| happy | Correct answer | `robot_8bit_happy_v8.svg` |

## Glitch Transition
- 12 pixel squares extracted from original animated SVG
- Positioned proportionally on face area (viewBox 432×348)
- 3 animation groups (gpx1/gpx2/gpx3) matching original keyframe percentages
- 2.5s cycle: glitch visible → expression swaps at end → overlay removed
- Glitch confined to face — rest of bot unchanged
- No shake, no dark overlay — underlying expression visible during glitch

## Component Design
- Conditionally mounted via `key={glitchKey}` for clean animation restart
- Timer cleanup via `useRef` to prevent race conditions
- Always starts from neutral, transitions context-based
