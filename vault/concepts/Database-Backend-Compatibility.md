---
type: concept
title: "Database Backend Compatibility"
created: 2026-07-09
updated: 2026-07-09
tags: [database, postgresql, sqlite, compatibility, bugs]
complexity: intermediate
aliases: ["DB Compatibility", "PG vs SQLite"]
related: ["[[Dual-Backend-Abstraction|Dual Backend Abstraction]]"]
sources: ["[[incident-log-2026-07-09]]"]
summary: "Common SQL dialect differences between PostgreSQL and SQLite that caused bugs in the MLPG dual-backend architecture, and their solutions."
---

# Database Backend Compatibility

While the `_DB` wrapper in `database.py` abstracts the connection interface, SQL dialect differences between PostgreSQL and SQLite repeatedly caused bugs.

## Known Incompatibilities and Fixes

### 1. Connection Interface
- **Bug**: `psycopg2` connection objects do not support `.execute()` directly (unlike `sqlite3`)
- **Fix**: `_DB` wrapper class provides a unified `.execute()` method that delegates correctly

### 2. Date Arithmetic
- **Bug**: SQLite `DATE('now', '-7 days')` is invalid PostgreSQL syntax
- **Fix**: Calculate dates in Python via `datetime.timedelta` and pass as parameter

```python
# Before (SQLite-only, broken on PG)
cursor.execute("SELECT * FROM x WHERE created_at > DATE('now', '-7 days')")

# After (compatible)
seven_days_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
cursor.execute("SELECT * FROM x WHERE created_at > ?", (seven_days_ago,))
```

### 3. Column Name Ambiguity
- **Bug**: `DATE(created_at)` without table qualifier fails on PG when multiple tables have `created_at`
- **Fix**: Always prefix with table alias: `DATE(a.created_at)`

### 4. Parameter Placeholders
- **Bug**: SQLite uses `?`, PostgreSQL uses `%s`
- **Fix**: `_DB._adapt()` auto-converts `?` to `%s` for PostgreSQL backend

### 5. UNIQUE Constraint Violations
- **Bug**: Catching `sqlite3.IntegrityError` misses `psycopg2.errors.UniqueViolation`
- **Fix**: Catch both exceptions separately; log unexpected errors instead of treating everything as duplicate

### 6. LIMIT Syntax
- **Bug**: Missing `LIMIT` on `find_similar_modules()` caused O(n) full table scans
- **Fix**: Added `LIMIT 200` to all search queries

## Best Practices for Dual-Backend Code

1. **Always use Python for computations**: never delegate date math, string processing, or logic to SQL dialect
2. **Qualify all column names**: `table.column` not just `column`
3. **Test on both backends**: SQLite is forgiving; PG reveals strictness issues
4. **Catch specific exceptions**: never `except Exception` for known error types
5. **Use the wrapper's `.execute()`**: never call the underlying connection directly
