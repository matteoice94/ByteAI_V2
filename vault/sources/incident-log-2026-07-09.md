---
type: source
title: "INCIDENT LOG — MLPG Bug & Fix Chronicle"
created: 2026-07-09
updated: 2026-07-09
tags: [bugs, incidents, fixes, security, database, ui]
source_type: note
confidence: high
key_claims:
  - "The project encountered 40+ distinct bugs across API integration, parsing, UI state, and security domains"
  - "Major architectural migrations (Gemini→OpenRouter, SHA-256→bcrypt, single→multi-page) each introduced new bug classes"
  - "Dual-backend (PG+SQLite) caused recurring SQL dialect compatibility issues"
  - "Streamlit session_state and rerender behavior was the most frequent source of UI bugs"
summary: "Complete technical incident log from project inception (May 15) to V2 deployment (July 9, 2026). Documents every bug, its root cause, solution, and lesson learned across API, parsing, UI, security, and database domains."
related: ["[[prompt-log-2026-07-09]]", "[[Database-Backend-Compatibility]]", "[[Security-Hardening-Journey]]", "[[Streamlit-State-Management]]"]
sources: []
---

# INCIDENT LOG — MLPG Project

Comprehensive bug register covering 40+ incidents across the full development lifecycle.

## Bug Categories and Patterns

### API Integration Bugs (8 incidents)
- **Wrong model name**: `gemini-1.5-flash` → `models/gemini-2.5-flash`
- **Wrong endpoint URL**: `/v1/chat/completions` → `/api/v1/chat/completions` (HTTP 404)
- **Rate limit 429**: No retry mechanism → added `_call_with_retries()` with exponential backoff
- **JSON parsing failures**: LLM returning markdown-wrapped JSON → `_normalize_json_text()` applied globally
- **Prompt JSON broken**: Extra brace in template → removed, deleted empty `.txt` file

### Parsing & Validation Bugs (5 incidents)
- **KeyError on old schema**: Archived modules with missing `spiegazione` → `.get()` with fallback + auto-migration
- **ImportError**: `valuta_con_pipeline` not found despite existing → stale `.pyc` cache, killed all python processes
- **Evaluation bias**: All answers classified as "parziale" → prompt updated to make "sbagliata" more frequent

### Database Bugs (5 incidents)
- **psycopg2 compatibility**: `conn.execute()` not supported → `_DB` wrapper unifying interface
- **create_user catch too broad**: All exceptions treated as duplicate username → specific catch for UniqueViolation
- **Missing LIMIT**: `find_similar_modules()` O(n) scan → added `LIMIT 200`
- **PG DATE function**: SQLite `DATE('now', '-7 days')` unsupported in PG → Python `datetime.timedelta` instead
- **Column ambiguity**: `created_at` without table qualifier → `a.created_at` prefix

### UI State Bugs — Streamlit (9 incidents)
- **Infinity rerender**: Status dropdown mismatch → added "archiviato" option
- **Progress bar crash**: `completati > totali` → `min(ratio, 1.0)`
- **Migration on every page load**: No guard → `_migrated_archiviati` session_state flag
- **Module redirect after correct answer**: Lost UI context → removed redirect, show feedback inline
- **Avatar not persisting**: Local variables lost on rerun → session_state for avatar/color/theme
- **F5 re-login**: Session not surviving refresh → signed token in query_params
- **Sidebar badge overlap**: Badge overlapping button → inline with title
- **Archived module UI different from active**: Mono-column vs dual-column → aligned layouts
- **Python code blocked as spam**: Character ratio < 0.3 → threshold raised, code indicators detected

### Security Bugs (3 incidents)
- **SHA-256 with fixed salt**: `mlpg_salt_2026_xyz` hardcoded → bcrypt with per-user salt + auto-migration
- **Flask debug=True in production**: Werkzeug console exposed → `FLASK_DEBUG` env var, default False
- **JWT secret ephemeral**: `time.time()` based → fixed secret, production env var

### V2 Migration Bugs (6 incidents)
- **Counter not reset on reopen**: Old attempts remained → `clear_module_attempts()` 
- **Dashboard crash**: Double-encoded JSON → double-parse with fallback
- **FinalSummary crash**: `diario_di_bordo.map()` on string → rendered as text
- **Generic error message**: Silent API failure → specific error state
- **XP/livello desync**: XP updated without level recalculation → `_level_from_xp()` auto-recalc
- **Theme color invisible**: Saved but never applied → applied to border, XP bar, badges

## Lessons Learned

1. **Normalize once, normalize everywhere**: JSON parsing must be applied at every entry point, not selectively
2. **Test dual-backend queries**: SQLite and PG differ in date functions and column qualification
3. **Streamlit state is volatile**: Always guard with session_state flags; never trust local variables across reruns
4. **Security needs layered defense**: Fixed salts, debug mode, and ephemeral secrets are each single points of failure
5. **Migration needs retrocompatibility**: Field additions require `.get()` fallbacks and auto-migration code
