---
type: concept
title: "Exercise Structured Layout"
created: 2026-07-10
updated: 2026-07-10
tags: [ui, exercise, pedagogy, frontend]
complexity: basic
sources: ["[[ui-refactors-2026-07-10]]"]
summary: "Exercise decomposed into 3 panels: Problem Data box, interactive Operations Roadmap, and collapsible Formula Help accordion."
---

# Exercise Structured Layout

Replaces the flat exercise text block with a 3-section visual decomposition.

## Sections

### 1. Problem Data Box
- Exercise statement with icon header
- Distinct background (`--surface2`), separated from theory
- LaTeX/markdown support

### 2. Operations Roadmap
- Interactive step checklist auto-populated from exercise text
- Auto-parses numbered lists or splits long sentences into steps
- Click to toggle completion (marker: number → ✓)
- Current step: purple border, completed: teal border + strikethrough
- Reset on module switch

### 3. Formula Help (Accordion)
- Collapsible panel with toggle arrow
- Shows theory excerpt as quick reference
- Intro text guides user to use theory for each step

## Layout
- Desktop: 2-column grid (data left, roadmap right)
- Mobile (<700px): single column stacked

## Completed Modules
- Submitted solution shown in green-bordered box below exercise
- Monospace `<pre>` with dark background
