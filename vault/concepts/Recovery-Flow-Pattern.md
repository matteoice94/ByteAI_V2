---
type: concept
title: "Recovery Flow Pattern"
created: 2026-07-09
updated: 2026-07-09
tags: [recovery, evaluation, tutor, pedagogy]
complexity: intermediate
aliases: ["3-Tier Recovery", "Error Recovery Flow"]
related: ["[[Three-Tier-Evaluation-Pipeline]]", "[[Prompt-Engineering-Evolution]]"]
sources: ["[[prompt-log-2026-07-09]]"]
summary: "The MLPG tutor's distinctive recovery flow: 1st wrong → hint, 2nd wrong → archive. Distinguishes 'parziale' (partial understanding) from 'sbagliata' (wrong answer)."
---

# Recovery Flow Pattern

The MLPG tutor implements a pedagogical recovery flow that avoids punishment while maintaining learning rigor.

## Flow Diagram

```
User Answer
    │
    ▼
[Heuristic Filter] ── Fail ──▶ "Riprova, sembra troppo breve"
    │ Pass
    ▼
[LLM Evaluation]
    │
    ├── esito: "corretta"  ──▶ Module completed ✓
    │
    ├── esito: "parziale"  ──▶ 1st time: Hint + retry
    │                          ──▶ 2nd time: "Da Approfondire" (archived with note)
    │
    └── esito: "sbagliata" ──▶ 1st time: Hint + retry
                               ──▶ 2nd time: "Archiviato" (to retry later)
```

## Key Distinction: "Parziale" vs "Sbagliata"

This is the core pedagogical insight. Not all wrong answers are equal:

- **Parziale**: The user partially understood. They got *some* aspect right. Example: right concept, wrong details. The tutor says "ci sei quasi" and gives a targeted hint.
- **Sbagliata**: The user is fundamentally wrong. The tutor archives the module for a future session — forcing re-engagement instead of brute-force retrying.

## The `cosa_manca` Field

Added in V2 (July 9). When the LLM evaluates "parziale", it must populate `cosa_manca` — a specific explanation of what was missing. This:
1. Gives the user a concrete improvement target
2. Prevents vague "non e' corretta" feedback
3. Appears in the final summary if the module goes to "Da Approfondire"

## Recovery vs Archive States

| State | Trigger | Behavior |
|-------|---------|----------|
| `pending` | New module | Awaiting user answer |
| `hinted` | 1st non-correct | Hint shown, user retries |
| `da_approfondire` | 2nd parziale | Archived with `cosa_manca` note, listed in final summary as "to deepen" |
| `archiviato` | 2nd sbagliata | Archived, resurrectable from history |
| `completato` | correct answer | Done, contributes to progress bar |
