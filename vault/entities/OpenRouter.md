---
type: entity
title: "OpenRouter"
created: 2026-07-08
updated: 2026-07-08
tags: [api, llm, openrouter]
entity_type: service
role: "LLM API provider for MLPG"
related: ["[[GPT-4o-mini]]", "[[Gemini Flash 1.5]]", "[[Text Embedding 3 Small]]"]
sources: ["[[config-py-2026-07-08]]"]
---

# OpenRouter

OpenRouter is the unified API gateway used by MLPG to access multiple LLM models through a single endpoint (`https://openrouter.ai/api/v1/chat/completions`).

## Models Used by MLPG
- **Chat**: `gpt-4o-mini` — for learning path generation, answer evaluation, hints, clarifications
- **Embedding**: `openai/text-embedding-3-small` — for RAG semantic search
- **Translation**: `google/gemini-flash-1.5` — fast model for on-the-fly UI language switching

## Usage in MLPG
All LLM calls go through OpenRouter. The `src/generator.py` module builds requests with API key from `.env`, sends them via `urllib.request`, and parses JSON responses. The `src/database.py` module uses the embedding endpoint for cosine similarity RAG.
