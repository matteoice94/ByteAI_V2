# MLPG Project Instructions

## Knowledge Vault (Proactive Mode)

This project has a knowledge vault at `vault/` that captures architectural decisions,
design patterns, and implementation details. **Always consult it before making code changes.**

### Before Editing Any File

1. **Check vault/sources/** for a source page about the file you're about to touch
   (e.g., before editing `src/database.py`, read `vault/sources/database-py-*.md`)
2. **Check vault/concepts/** for patterns relevant to the area
   (e.g., before changing auth code, read `vault/concepts/Password-Migration-Pattern.md`)
3. **Read vault/hot.md** for recent context and active threads

### After Making Significant Changes

Auto-capture mode is ON. After creating new files, major refactors, or architectural
changes, the `wiki` skill will automatically:
- Create/update source and concept pages
- Update index, log, hot cache
- Report: "Captured to vault: N sources, M concepts"

### Commands

| Command | Purpose |
|---------|---------|
| `/wiki` | Check vault health, recent activity, get suggestions |
| `/ingest <file>` | Manually ingest a source document |

### Key Architecture (from vault)

- **Database**: Dual-backend (PG + SQLite) via `_DB` wrapper. `src/database.py` (946 lines).
- **Validation**: Pydantic with `extra=forbid` as LLM contract. `src/models.py`.
- **Gamification**: 10-level XP curve, 20 badges in 5 categories. `src/gamification.py`.
- **i18n**: 260-key flat IT/EN dict for 3 interfaces. `src/i18n.py`.
- **LLM Integration**: OpenRouter gateway, 3-layer eval pipeline. `src/generator.py`.
- **UI**: Streamlit multi-page app. `streamlit_app.py` (2026 lines).

### Build & Test

```bash
# Run all tests
python -m pytest tests/ -v

# Run database tests only (uses temp SQLite)
python -m pytest tests/test_database.py -v

# Run Streamlit
streamlit run streamlit_app.py
```

### Key Conventions

- All SQL uses `?` placeholders (auto-converted to `%s` for PG by `_adapt()`)
- Translations via `tr(key, lang)` never hardcoded strings
- User passwords: bcrypt with auto-migration from legacy SHA-256 on login
- Modules auto-archive after 2 wrong attempts
