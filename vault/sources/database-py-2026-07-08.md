---
type: source
title: "MLPG Database Layer"
created: 2026-07-08
updated: 2026-07-08
tags: [mlpg, database, postgresql, sqlite, orm]
source_type: code
url: "src/database.py"
author: "MLPG Project"
confidence: high
key_claims:
  - "Dual-backend architecture: PostgreSQL (production) with automatic SQLite fallback"
  - "Unified _DB wrapper class abstracts pg/sqlite behind identical interface"
  - "Password auth uses bcrypt with automatic SHA-256→bcrypt migration on login"
  - "RAG implemented via cosine similarity over pre-computed text embeddings"
summary: "946-line persistence layer supporting PostgreSQL (via psycopg2) and SQLite (via sqlite3) through a unified _DB wrapper. Handles user auth with bcrypt, session/module/attempt CRUD, gamification stats, leaderboard queries, and RAG semantic search with embedding-based cosine similarity."
related: ["[[Dual Backend Abstraction]]", "[[Password Migration Pattern]]", "[[RAG with Cosine Similarity]]", "[[models-py-2026-07-08]]", "[[config-py-2026-07-08]]"]
sources: []
---

# MLPG Database Layer

`src/database.py` (946 lines) is the full persistence layer. It supports two backends transparently.

## Architecture

### Connection Management
- `IS_PG` flag derived from `DATABASE_URL` env var at module load
- `_get_conn()`: PostgreSQL if IS_PG, else SQLite at `data/mlpg.db`
- `_DB` wrapper class: unifies `.execute()`, `.commit()`, `.rollback()`, `.close()` across backends
- `_adapt(sql)`: converts `?` placeholders to `%s` for PG compatibility

### Schema Strategy
Two complete DDL schemas:
- `SCHEMA_PG` (lines 111-175): Uses `SERIAL PRIMARY KEY`, PG-specific syntax
- `SCHEMA_SQLITE` (lines 177-241): Uses `INTEGER PRIMARY KEY AUTOINCREMENT`
- `init_db()`: selects schema based on `IS_PG`, applies PG-only migrations when needed

### Tables
| Table | Purpose |
|-------|---------|
| `users` | Auth with bcrypt-hashed passwords |
| `sessions` | Learning path metadata (topic, level, riepilogo JSON) |
| `modules` | Per-module data with embeddings for RAG |
| `attempts` | User solutions with esito (corretta/parziale/sbagliata) and feedback JSON |
| `user_stats` | Gamification state: XP, streaks, badges, topics, languages |

## Auth System
- **Hashing**: bcrypt with gensalt (auto salt)
- **Verification**: bcrypt.checkpw first, then fallback to legacy SHA-256
- **Migration**: On successful legacy login, password automatically upgraded to bcrypt
- **Unique violation**: Handles both `psycopg2.errors.UniqueViolation` (PG) and `sqlite3.IntegrityError` (SQLite)

## RAG Implementation
- `compute_embedding()`: Calls OpenRouter embedding API (`openai/text-embedding-3-small`), caches with `@lru_cache(maxsize=128)`, returns `tuple[float]` for hashability
- `_cosine_similarity()`: Pure Python dot product / magnitude product
- `find_similar_modules()`: Fetches 200 most recent embedded modules, computes cosine scores, returns top-K above `RAG_SIMILARITY_THRESHOLD`

## Gamification Stats
- `ensure_user_stats()`: Creates stats row if missing (lazy init)
- `award_user_xp()`: Full pipeline: XP calculation → streak update → badge check → topics tracking → night owl detection
- `backfill_user_stats()`: Rebuilds stats for all users from historical data
- `track_wrong_answer()`: Penalty tracking (resets consecutive streak, no XP loss)
- `track_lang_usage()`: Language diversity tracking for Polyglot badge

## CRUD Operations
- Session: save, rename, delete (cascading — deletes modules + attempts)
- Module: rename, delete, archive, complete
- Attempt: save only (immutable history)
- Riepilogo: save/update JSON summary on session
