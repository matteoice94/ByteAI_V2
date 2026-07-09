---
type: meta
title: "Hot Cache"
updated: 2026-07-09T18:00:00
---
# Recent Context

## Last Updated
2026-07-09 — Ingested PROMPT_LOG.md and INCIDENTS.md from V1 folder

## Key Recent Facts
- MLPG prompt engineering evolved through 9 phases: JSON-only → recovery flow → i18n → 3-tier evaluation
- Recovery flow distinguishes "parziale" (partial understanding → hint + retry) from "sbagliata" (wrong → archive)
- Sanity check was removed from pipeline — LLM now evaluates both relevance and correctness
- Incident log documents 40+ bugs across API, parsing, UI state, security, and DB domains
- Dual-backend (PG+SQLite) caused recurring SQL dialect compatibility bugs
- Streamlit session_state was the most frequent source of UI bugs (9 incidents)
- Security hardening: SHA-256→bcrypt, Flask debug off, JWT secret stabilized
- `valuta_con_pipeline()` consolidated 280 lines of duplicated eval logic across 3 interfaces

## Recent Changes
- Created: vault/sources/prompt-log-2026-07-09.md, vault/sources/incident-log-2026-07-09.md
- Created: vault/concepts/Prompt-Engineering-Evolution.md, vault/concepts/Recovery-Flow-Pattern.md, vault/concepts/Three-Tier-Evaluation-Pipeline.md
- Created: vault/concepts/Database-Backend-Compatibility.md, vault/concepts/Security-Hardening-Journey.md, vault/concepts/Streamlit-State-Management.md
- Updated: vault/entities/OpenRouter.md (added Gemini→OpenRouter migration history)

## Active Threads
- Vault now has 7 sources, 1 entity, 14 concepts — 22 pages total
- Full development chronicle captured: prompt evolution + bug register spanning May-July 2026
- Cross-references established between prompt log ↔ incident log ↔ architectural concepts
