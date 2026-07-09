# Operation Log

## 2026-07-09
**Operation**: ingest
**Sources**: prompt-log-2026-07-09, incident-log-2026-07-09
**Pages created**: vault/sources/prompt-log-2026-07-09.md, vault/sources/incident-log-2026-07-09.md, vault/concepts/Prompt-Engineering-Evolution.md, vault/concepts/Recovery-Flow-Pattern.md, vault/concepts/Three-Tier-Evaluation-Pipeline.md, vault/concepts/Database-Backend-Compatibility.md, vault/concepts/Security-Hardening-Journey.md, vault/concepts/Streamlit-State-Management.md
**Pages updated**: vault/entities/OpenRouter.md, vault/index.md, vault/sources/_index.md, vault/concepts/_index.md, vault/entities/_index.md, vault/hot.md, vault/overview.md
**Key insight**: Full development chronicle captured: 9-phase prompt evolution from JSON-only to 3-tier evaluation with recovery flow; 40+ incident log spanning API, parsing, UI, security, and DB domains. 6 new concepts extracted (prompt evolution, recovery flow, eval pipeline, DB compatibility, security hardening, Streamlit state management).

---

## 2026-07-08
**Operation**: ingest
**Source**: i18n-py-2026-07-08
**Pages created**: vault/sources/i18n-py-2026-07-08.md, vault/concepts/Centralized-Translation-Pattern.md
**Key insight**: 260-key flat IT/EN dict powers 3 interfaces (Streamlit, Flask, CLI); Italian is universal fallback; system prompts loaded from filesystem

---

**Operation**: ingest
**Source**: gamification-py-2026-07-08
**Pages created**: vault/sources/gamification-py-2026-07-08.md, vault/concepts/XP-Progression-Curve.md, vault/concepts/Badge-System-Design.md, vault/concepts/Streak-and-Phoenix-Mechanic.md
**Key insight**: 10-level progressive XP curve + 20 badges in 5 categories + daily streak with phoenix mechanic for returning users

---

**Operation**: ingest
**Source**: database-py-2026-07-08
**Pages created**: vault/sources/database-py-2026-07-08.md, vault/concepts/Dual-Backend-Abstraction.md, vault/concepts/Password-Migration-Pattern.md
**Key insight**: 946-line dual-backend persistence layer: PG for production, SQLite auto-fallback; bcrypt + migrate-on-login from legacy SHA-256

---

**Operation**: ingest
**Source**: models-py-2026-07-08
**Pages created**: vault/sources/models-py-2026-07-08.md, vault/concepts/Pydantic-Validation-Contract.md
**Key insight**: 6 Pydantic models form strict JSON contract between LLM and app; extra=forbid catches hallucinations

---

**Operation**: ingest
**Source**: config-py-2026-07-08
**Pages created**: vault/sources/config-py-2026-07-08.md, vault/entities/OpenRouter.md, vault/concepts/RAG-with-Cosine-Similarity.md
**Key insight**: MLPG uses OpenRouter as single LLM gateway with centralized timeout/retry config and 3-layer evaluation pipeline

---

## 2026-07-08 16:00
**Operation**: vault init
**Pages created**: vault/hot.md, vault/index.md, vault/log.md, vault/overview.md
**Summary**: Knowledge vault created and ready for first ingest
