---
type: concept
title: "Prompt Engineering Evolution"
created: 2026-07-09
updated: 2026-07-09
tags: [prompts, llm, prompt-engineering, tutor]
complexity: advanced
aliases: ["Prompt Evolution"]
related: ["[[Recovery-Flow-Pattern]]", "[[Three-Tier-Evaluation-Pipeline]]"]
sources: ["[[prompt-log-2026-07-09]]"]
summary: "How the MLPG tutor prompt evolved through 9 phases from a basic JSON contract to a sophisticated multi-language, multi-model evaluation system."
---

# Prompt Engineering Evolution

The MLPG tutor prompt underwent 9 distinct evolutionary phases, each solving concrete problems discovered through testing.

## Phase Map

| Phase | Date | Problem | Solution |
|-------|------|---------|----------|
| 1. Foundation | May 15 | No tutor at all | JSON-only output, 3 modules, Pydantic validation |
| 2. Robustness | May 15-19 | LLM adds markdown/text | JSON extraction logic, `spiegazione_semplificata` |
| 3. Web | May 19 | Terminal only | Flask + Streamlit UI |
| 4. Token efficiency | May 25 | 429 rate limits | Retry+backoff, consolidated calls |
| 5. Flow consolidation | May 28 | Redundant API calls | Single cumulative final summary |
| 6. Recovery + RAG | Jun 24 | No error recovery | Hint → archive flow, semantic memory |
| 7. Provider migration | Jun 25 | Gemini dependency | Full OpenRouter switch |
| 8. i18n + unified eval | Jul 6 | Language silos, code dup | 260-key translations, `valuta_con_pipeline()` |
| 9. V2 3-tier | Jul 9 | Coarse recovery | `cosa_manca` field, parziale vs sbagliata distinction |

## Key Patterns

### Progressive Prompt Hardening
Each phase added defensive measures against LLM unpredictability:
1. **Phase 2**: Strip markdown from responses
2. **Phase 4**: Handle rate limits gracefully
3. **Phase 6**: Parse old schema versions
4. **Phase 8**: Language-aware prompt loading

### The "LLM Always Evaluates" Principle  
From Phase 9: The sanity check was removed because it made decisions the LLM should make. Even SQL answers that look off-topic may be legitimate — the LLM, not a heuristic filter, should judge relevance.

### Prompt File Architecture
```
Prompts/
├── system_mlpg.md      # Italian system prompt
├── system_mlpg_en.md   # English system prompt (auto-loaded by language selector)
```

Both files are versioned in git. The language selector picks the right file at runtime. All LLM output is auto-translated when the user switches language.
