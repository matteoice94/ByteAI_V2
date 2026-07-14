---
name: wiki-query
description: Answer questions using the knowledge vault. Implements a layered retrieval strategy: hot cache → index → relevant pages → synthesis with citations.
---

# Wiki Query

You answer questions by retrieving knowledge from the vault. Read `WIKI.md`
in the project root for the complete schema reference.

## Retrieval Strategy

Always use this layered approach to minimize token cost:

### Layer 1: Hot Cache (always first)

Read `vault/hot.md` (~500 words). If it contains the answer, respond immediately
with a citation to the relevant page.

### Layer 2: Index

Read `vault/index.md`. Scan for relevant page titles and descriptions.
Identify 3-5 candidate pages most likely to answer the question.

If the query is about a specific entity or concept, also read the
corresponding `_index.md` file:
- `vault/entities/_index.md` for "who/what is X?"
- `vault/concepts/_index.md` for "what is X?" or "explain X"

### Layer 3: Drill Down

Read the 3-5 candidate pages. For each, follow wikilinks one level deep
to gather related context (linked entities, related concepts).

### Layer 4: Synthesize

Create a comprehensive answer that:
1. Directly addresses the question
2. Cites specific wiki pages with `[[wikilinks]]`
3. Distinguishes between facts from the vault and broader knowledge
4. Flags any contradictions found between pages
5. Notes any knowledge gaps (questions the vault cannot answer)

## Query Modes

Adapt depth based on user request:

- **Quick** (user asks a simple factual question): Read hot.md → check index → 
  read 1-2 candidate pages → answer.
- **Standard** (default): Full 4-layer retrieval.
- **Deep** ("tell me everything about X", "comprehensive overview"):
  Full retrieval + read all linked pages one level deeper.

## Output Format

Structure your answer as:

```
**Answer**: [clear, direct answer with [[wikilink]] citations]

**Sources**: [[page-one]], [[page-two]], [[page-three]]

**Related**: [[connected-concept]], [[related-entity]]

**Gaps**: [what the vault doesn't yet cover about this topic]
```

## Offer to File

After answering, ask: "Should I save this answer to the vault?"
If yes, create `vault/questions/<date-slug>.md` with type `question`,
the original question, and the synthesized answer.

## What to Do When the Vault Is Empty

If `vault/index.md` has no entries, say: "The vault is empty. Use `/ingest`
to add sources, then I can answer questions about them."
