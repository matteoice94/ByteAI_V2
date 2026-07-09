---
type: source
title: "PROMPT LOG — MLPG Prompt Engineering Chronicle"
created: 2026-07-09
updated: 2026-07-09
tags: [prompts, llm, prompt-engineering, evaluation, recovery-flow]
source_type: note
confidence: high
key_claims:
  - "The MLPG tutor prompt evolved through 6 major iterations from basic JSON enforcement to 3-tier evaluation"
  - "Recovery flow distinguishes 'parziale' (partial understanding → hint + retry) from 'sbagliata' (wrong answer → archive after 2nd error)"
  - "Sanity check was removed from pipeline because it blocked legitimate but off-focus answers (e.g. SQL queries) before LLM evaluation"
  - "Token optimization via retry+backoff and prompt consolidation reduced API calls during rate limits"
summary: "Chronicle of all prompt modifications in the MLPG project from May 15 to July 9, 2026. Documents the evolution from basic JSON-only output to a sophisticated 3-tier evaluation pipeline with recovery flow, i18n support, and heuristic filtering."
related: ["[[incident-log-2026-07-09]]", "[[Recovery-Flow-Pattern]]", "[[Three-Tier-Evaluation-Pipeline]]"]
sources: []
---

# PROMPT LOG — MLPG Project

Full-source [[Prompt Engineering Chronicle]] documenting every prompt change from project inception to V2 deployment.

## Evolution Timeline

### Phase 1: Foundation (May 15)
Initial `system_mlpg.md` created from Spec v3.0. Core requirements:
- Tutor behavior definition (encouraging, supportive)
- JSON-only output with explicit Pydantic validation
- 3 modules per learning path

### Phase 2: Robustness (May 15-19)
- Added `spiegazione_semplificata` field for confusion handling
- JSON extraction logic for markdown-wrapped responses
- Empathetic closing (`genera_saluto_finale()`)
- Level-aware explanations (base/intermediate/advanced) in `genera_spiegazione_alternativa()`

### Phase 3: Web Interface (May 19)
- Flask (`app.py`) and Streamlit (`streamlit_app.py`) interfaces created
- Web-based interactive paths replace terminal-only interaction

### Phase 4: Token Optimization (May 25)
- `_call_with_retries()` for 429 rate limit handling
- Prompts rewritten for extreme conciseness
- Exponential backoff on API calls

### Phase 5: Flow Consolidation (May 28)
- Single cumulative API call for final summary (eliminated intermediate calls)
- Separated `TutorResponse` from `RiepilogoFinale`
- Moved closing greeting into final summary response

### Phase 6: Recovery Flow + RAG (June 24)
- Endpoint fix: `/v1/chat/completions` → `/api/v1/chat/completions`
- `_normalize_json_text()` applied to all parsing functions
- `valuta_risposta` prompt updated: separate `commento_costruttivo` (warm/enthusiastic) from `suggerimento_miglioramento` (concrete/future-oriented)
- `esito` field: "corretta" / "parziale" / "sbagliata"
- `genera_hint()` with textual fallback on first error
- Recovery flow: 1st error → hint, 2nd different error → archive module
- RAG: SQLite with OpenRouter embeddings, `find_similar_modules()` for context enrichment

### Phase 7: OpenRouter Migration (June 25)
- Complete switch from Gemini to OpenRouter API
- Model: `gpt-4o-mini` for all generation tasks
- Removed `google-generativeai` dependency

### Phase 8: i18n + Unified Evaluation (July 6)
- Centralized 260-key IT/EN translation dict
- `valuta_con_pipeline()`: unified evaluation for Streamlit, Flask, and CLI
- Translation functions: `traduci_percorso_completo()` and `traduci_modulo_singolo()`
- Heuristic filter updated: substring matching for "non lo so", code indicators for SQL
- Sanity check prompt updated: "non lo so" excluded from "non pertinente" criteria

### Phase 9: V2 Recovery + React (July 9)
- `cosa_manca` field added to `FeedbackValutazione` for partial answers
- 3-tier recovery: correct → complete, 1st parziale → hint+retry, 2nd parziale → "Da Approfondire", 2nd sbagliata → archiviato
- Sanity check removed from pipeline entirely — LLM handles both relevance and correctness
- SQL indicators (`CREATE`, `SELECT`, `TABLE`, etc.) added to code detection

## Key Architectural Decisions

1. **Prompt files as single source of truth**: LLM prompts in `Prompts/` directory, versioned in git
2. **Language-aware**: Dual prompts (IT/EN) loaded by language selector, LLM output auto-translated
3. **Heuristic pre-filter**: Lightweight Python checks before expensive LLM calls
4. **No sanity blocking**: LLM always evaluates — avoids false negatives on legitimate but off-focus answers
