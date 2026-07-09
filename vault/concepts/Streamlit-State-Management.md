---
type: concept
title: "Streamlit State Management"
created: 2026-07-09
updated: 2026-07-09
tags: [streamlit, ui, state, bugs, session]
complexity: intermediate
aliases: ["Streamlit Session State", "Streamlit Bugs"]
related: []
sources: ["[[incident-log-2026-07-09]]"]
summary: "Patterns and anti-patterns for managing Streamlit session_state, drawn from 9 distinct UI bugs encountered during MLPG development."
---

# Streamlit State Management

Streamlit's rerun-based execution model caused the most frequent class of bugs in the MLPG project. This page captures the patterns learned.

## The Core Problem

Streamlit re-executes the entire script on every interaction. Variables not in `st.session_state` are recreated from scratch. This causes:
- Lost user selections (avatar, theme, language)
- Infinite rerender loops
- Lost UI context after state changes

## Bug Patterns and Solutions

### 1. Local Variable Amnesia
**Bug**: Avatar/theme selection lost after clicking another button
**Root cause**: Selection stored in local variable, destroyed on rerun
**Fix**: Use `st.session_state` for all persistent selections:
```python
# Wrong
avatar = show_avatar_selector()
# Correct
if 'profile_avatar' not in st.session_state:
    st.session_state.profile_avatar = '🤖'
```

### 2. Infinite Rerender Loop
**Bug**: Status dropdown caused infinite loop when options mismatched saved state
**Root cause**: Dropdown options `["in sospeso", "completato"]` but DB had "archiviato"
**Fix**: Ensure all valid states appear as options; use index-based selection with `format_func`

### 3. Migration on Every Page Load
**Bug**: Data migration block ran on every single rerun
**Fix**: Guard with session_state flag:
```python
if not st.session_state.get('_migrated_archiviati'):
    migrate_archived()
    st.session_state._migrated_archiviati = True
```

### 4. F5 Kills Authentication
**Bug**: Browser refresh loses login because session_state is ephemeral
**Fix**: Signed session token in URL query_params, verified on each load

### 5. Progress Bar Div/0
**Bug**: `completati / totali` crashes when `completati > totali` (race condition)
**Fix**: `min(completati / max(totali, 1), 1.0)`

### 6. Redirect Loses Context
**Bug**: After correct answer, redirect to home destroyed active module view
**Fix**: Don't redirect; show success inline and let user navigate naturally

### 7. Sidebar Overlap
**Bug**: Badge pill CSS positioned over action button
**Fix**: Inline badge in same column as title, not in separate column

### 8. Dual Layout Drift
**Bug**: Archived modules used different layout from active modules
**Fix**: Extracted shared `_render_modulo_archivio()` component

### 9. Cache Poisoning
**Bug**: `.pyc` cache kept old version of module after refactor
**Fix**: Kill all Python processes, clean `__pycache__`, use `-B` flag

## Streamlit Best Practices

1. **Everything persistent goes in session_state**: language, user, theme, avatar, active module
2. **Guard expensive operations**: use boolean flags in session_state
3. **Never redirect on success**: show feedback inline
4. **Shared components over copy-paste**: extract rendering functions
5. **Defensive math**: always guard divisions against edge cases
