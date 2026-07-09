---
type: entity
title: "OpenRouter"
created: 2026-07-08
updated: 2026-07-09
tags: [api, llm, openrouter]
entity_type: service
role: "LLM API provider for MLPG"
related: ["[[GPT-4o-mini]]", "[[Gemini Flash 1.5]]", "[[Text Embedding 3 Small]]"]
sources: ["[[config-py-2026-07-08]]", "[[prompt-log-2026-07-09]]", "[[incident-log-2026-07-09]]"]
---

# OpenRouter

OpenRouter is the unified API gateway used by MLPG to access multiple LLM models through a single endpoint (`https://openrouter.ai/api/v1/chat/completions`).

## Models Used by MLPG
- **Chat**: `gpt-4o-mini` — for learning path generation, answer evaluation, hints, clarifications
- **Embedding**: `openai/text-embedding-3-small` — for RAG semantic search
- **Translation**: `google/gemini-flash-1.5` — fast model for on-the-fly UI language switching

## Usage in MLPG
All LLM calls go through OpenRouter. The `src/generator.py` module builds requests with API key from `.env`, sends them via `urllib.request`, and parses JSON responses. The `src/database.py` module uses the embedding endpoint for cosine similarity RAG.

## Migration from Gemini (June 25, 2026)
MLPG originally used Google Gemini API (`google-generativeai` package). The migration involved:
- Replacing all `model.generate_content()` calls with OpenRouter HTTP requests
- Fixing endpoint URL from `/v1/chat/completions` to `/api/v1/chat/completions` (initial 404 error)
- Removing `google-generativeai` from requirements.txt
- Switching `.env` from `GEMINI_API_KEY` to `OPENROUTER_API_KEY`

The migration was motivated by flexibility: OpenRouter provides access to multiple models through a single API, while Gemini locked the project to one provider.
