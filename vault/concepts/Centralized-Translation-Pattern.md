---
type: concept
title: "Centralized Translation Pattern"
created: 2026-07-08
updated: 2026-07-08
tags: [i18n, translations, architecture, patterns]
complexity: basic
aliases: ["i18n Pattern", "Translation Map", "Multilingual Support"]
related: ["[[i18n-py-2026-07-08]]", "[[Pydantic Validation Contract]]"]
sources: ["[[i18n-py-2026-07-08]]"]
---

# Centralized Translation Pattern

Single-source-of-truth approach for multilingual UI text used in MLPG's 737-line `src/i18n.py`.

## Structure

```python
TRANSLATIONS = {
    "key_name": {"it": "testo", "en": "text"},  # flat, not nested
}
tr("key_name", lang, **kwargs)  # O(1) lookup
```

## Why Flat (Not Nested)

**Alternative (rejected)**:
```python
{"login": {"title": {"it": "...", "en": "..."}, "button": {"it": "...", "en": "..."}}}
```

This would require recursive traversal or dotted-key parsing. Flat keys are simpler:
- `tr("login_title", lang)` → 1 dictionary lookup
- `tr("login.title", lang)` → would need string splitting + traversal

**Trade-off**: 700+ lines of visually repetitive structure, but zero runtime overhead.

## Format String Integration
```python
tr("module_archived_after", lang, count=2)
# → "Modulo archiviato dopo 2 tentativi"
# → "Module archived after 2 attempts"
```

Dynamic values are injected via `str.format(**kwargs)`. This handles pluralization naturally in Italian and English without separate plural rules.

## System Prompt Routing
Language selection controls which LLM system prompt is loaded:
- IT: `Prompts/system_mlpg.md` (95 lines)
- EN: `Prompts/system_mlpg_en.md` (95 lines)

The prompts are NOT in the translation dict because they're too large and are LLM inputs, not UI strings. They're loaded from filesystem via `get_system_prompt_path(lang)`.

## Coverage
- 3 interfaces use the same translations: Streamlit UI, Flask HTML, and CLI
- Key domains: login, learning path, evaluation, clarifications, summary, history, gamification, dashboard, profile, error messages
- Italian is always the fallback (every key has at minimum an `it` entry)
