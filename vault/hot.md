---
type: meta
title: "Hot Cache"
updated: 2026-07-08T17:30:00
---
# Recent Context

## Last Updated
2026-07-08 — Full project analysis: ingested 4 source files + 7 concept pages

## Key Recent Facts
- MLPG uses Pydantic with `extra=forbid` as the validation contract between LLM JSON and app logic
- Database supports PostgreSQL + SQLite via unified _DB wrapper; placeholder translation (?→%s) for PG
- Password auth migrated from fixed-salt SHA-256 → bcrypt with migrate-on-login pattern
- 20 badges in 5 color-coded categories; Collector meta-badge rewards badge diversity
- All UI text centralized in 260-key flat IT/EN dict; CLI, Streamlit, Flask all use same tr()
- Streak system: consecutive-day tracking + phoenix mechanic (badge on return after 7+ days)

## Recent Changes
- Created: vault/sources/models-py-2026-07-08.md, vault/sources/database-py-2026-07-08.md, vault/sources/gamification-py-2026-07-08.md, vault/sources/i18n-py-2026-07-08.md
- Created: vault/concepts/Pydantic-Validation-Contract.md, vault/concepts/Dual-Backend-Abstraction.md, vault/concepts/Password-Migration-Pattern.md, vault/concepts/XP-Progression-Curve.md, vault/concepts/Badge-System-Design.md, vault/concepts/Streak-and-Phoenix-Mechanic.md, vault/concepts/Centralized-Translation-Pattern.md

## Active Threads
- Full vault populated with 5 sources, 1 entity, 8 concepts — 14 pages total
- Vault captures all major architectural patterns in MLPG codebase