---
type: concept
title: "Dual Backend Abstraction"
created: 2026-07-08
updated: 2026-07-08
tags: [database, abstraction, postgresql, sqlite]
complexity: advanced
aliases: ["Database Abstraction Layer", "Backend Adapter Pattern"]
related: ["[[database-py-2026-07-08]]", "[[Pydantic Validation Contract]]"]
sources: ["[[database-py-2026-07-08]]"]
---

# Dual Backend Abstraction

Pattern that allows MLPG to run with PostgreSQL in production and SQLite for development/offline use, without changing any application code.

## Architecture

```
Application code (same SQL queries everywhere)
        │
        ▼
    _adapt(sql)  ←── converts ? → %s for PostgreSQL
        │
        ▼
    _get_conn()  ←── checks IS_PG flag from env
        │
        ├── IS_PG = True  → psycopg2.connect(DATABASE_URL)
        └── IS_PG = False → sqlite3.connect("data/mlpg.db")
        │
        ▼
    _DB wrapper  ←── unified .execute(), .commit(), .rollback()
```

## Key Mechanisms

### 1. Placeholder Translation
`_adapt(sql)` replaces `?` with `%s` for PostgreSQL. SQLite uses `?` natively. All SQL in the codebase uses `?` as the canonical placeholder.

### 2. Connection Factory
`_get_conn()` returns a `_DB` instance wrapping either psycopg2 or sqlite3. The `_DB` class delegates all operations to the underlying connection, with identical method signatures.

### 3. ID Retrieval
`_insert_returning_id()` handles the difference:
- PostgreSQL: Appends `RETURNING id`, reads from returned row
- SQLite: Uses `cursor.lastrowid` after insert

### 4. Schema Selection
`init_db()` splits on `IS_PG`:
- PG: Runs `SCHEMA_PG` + migration statements (`ALTER TABLE ADD COLUMN IF NOT EXISTS`)
- SQLite: Runs `SCHEMA_SQLITE` only (schema already includes all columns)

### 5. Exception Translation
`create_user()` handles unique violations differently per backend:
- PostgreSQL: `psycopg2.errors.UniqueViolation`
- SQLite: `sqlite3.IntegrityError`

## Benefits
- **Zero-config dev**: No PostgreSQL needed for local development
- **Test isolation**: Tests monkeypatch `IS_PG=False` + `DB_PATH` to temp directory
- **Same code path**: No if/else in application logic, only in connection/schema layer
