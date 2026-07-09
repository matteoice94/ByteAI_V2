---
type: concept
title: "Pydantic Validation Contract"
created: 2026-07-08
updated: 2026-07-08
tags: [pydantic, validation, llm, json-parsing]
complexity: intermediate
aliases: ["Strict Schema Validation", "LLM Output Contract"]
related: ["[[models-py-2026-07-08]]", "[[Dual Backend Abstraction]]"]
sources: ["[[models-py-2026-07-08]]"]
---

# Pydantic Validation Contract

Pattern used in MLPG to enforce a strict data contract between unstructured LLM output and typed application logic.

## Problem
LLMs return arbitrary JSON. Without validation, malformed responses corrupt application state silently. Fields may be missing, extra keys may appear, or types may be wrong.

## Solution in MLPG
Every LLM response is parsed through a Pydantic `BaseModel` with `extra = "forbid"` configuration:

```python
class TutorResponse(BaseModel):
    percorso_studio: PercorsoStudio
    model_config = {"extra": "forbid"}
```

This achieves three things:
1. **Type enforcement**: Every field is typed (`int`, `str`, `List[str]`, `Optional[T]`)
2. **Extra field rejection**: Any hallucinated key raises `ValidationError` immediately
3. **Length constraints**: `Field(..., max_length=2500)` caps explanation size

## Trade-offs
- **Pro**: Catches LLM errors at the boundary, not deep in application logic
- **Pro**: `Optional[List[str]]` allows partial responses without breaking
- **Con**: Strict validation may reject valid-but-verbose LLM output (e.g., extra whitespace in strings)
- **Mitigation**: `_normalize_json_text()` in generator.py strips markdown fences, newlines, and surrounding text before Pydantic parsing
