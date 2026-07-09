---
type: concept
title: "Three-Tier Evaluation Pipeline"
created: 2026-07-09
updated: 2026-07-09
tags: [evaluation, pipeline, llm, heuristic, validation]
complexity: intermediate
aliases: ["Evaluation Pipeline", "valuta_con_pipeline"]
related: ["[[Recovery-Flow-Pattern]]", "[[Prompt-Engineering-Evolution]]"]
sources: ["[[prompt-log-2026-07-09]]", "[[incident-log-2026-07-09]]"]
summary: "Unified 3-layer evaluation pipeline (heuristic → sanity → LLM eval) consolidated into valuta_con_pipeline() for Streamlit, Flask, and CLI."
---

# Three-Tier Evaluation Pipeline

The `valuta_con_pipeline()` function in `src/generator.py` implements a staged evaluation that balances cost (API calls) with accuracy.

## Architecture

```
Layer 1: Heuristic Filter       Layer 2: Sanity Check        Layer 3: LLM Evaluation
    (Python, free)                  (LLM call)                     (LLM call)
    ┌─────────────┐              ┌─────────────┐               ┌─────────────┐
    │ Min length   │    Pass     │ Relevance    │    Pass      │ Correctness  │
    │ Unique chars │ ──────────▶ │ check        │ ───────────▶ │ Partial check│
    │ Code detect  │             │ (REMOVED)    │              │ Hint gen     │
    │ Keyword match│             └─────────────┘               └─────────────┘
    └─────────────┘                                                  │
         │ Fail                                                ┌────┴────┐
         ▼                                                     ▼         ▼
    "Risposta troppo breve"                              esito + hint  archive
```

## Layer 1: Heuristic Filter

Free Python checks that block obviously invalid input:
- **Min length**: < 3 chars → "la risposta e' troppo breve"
- **Character spam**: unique char ratio < 0.3 on strings > 80 chars
- **Code detection**: `_code_indicators` list (`def`, `print(`, `=`, `{`, `CREATE`, `SELECT`, `TABLE`, etc.)
- **Keyword overlap**: if answer has zero content keywords from exercise (skipped when code indicators present)

## Layer 2: Sanity Check (HISTORICAL — REMOVED July 9)

The sanity check was an LLM call that verified relevance. It was removed because:
- It blocked legitimate but off-focus answers (SQL queries vs Python exercises)
- It made decisions the LLM evaluation layer should make
- "Non lo so" answers were caught by it instead of reaching encouraging evaluation

## Layer 3: LLM Evaluation

The final layer runs the full evaluation prompt. Returns:
- `esito`: "corretta" | "parziale" | "sbagliata"
- `commento_costruttivo`: warm, encouraging feedback
- `suggerimento_miglioramento`: concrete, future-oriented advice
- `punti_di_forza`: what the user did well
- `punteggio`: optional numeric score
- `cosa_manca`: (V2+) what was missing for parziale answers

## Consolidation Benefits

Before `valuta_con_pipeline()`, evaluation logic was duplicated across:
- `streamlit_app.py` (~130 lines)
- `app.py` (Flask, ~90 lines)  
- `main.py` (CLI, ~60 lines)

After consolidation, all three interfaces call the same function, eliminating drift between platforms.
