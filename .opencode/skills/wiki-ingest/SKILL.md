---
name: wiki-ingest
description: Ingest a source document into the knowledge vault. Reads the source, extracts entities and concepts, creates cross-linked wiki pages, and updates indexes. Handles files, URLs, and text input.
---

# Wiki Ingest

You ingest source documents into the knowledge vault. Read `WIKI.md` in the project
root for the complete schema reference.

## Process

When given a source (file path, URL, or raw text), follow these steps:

### Step 1: Read the Source

- For **files**: Use `Read` to read the complete content.
- For **URLs**: Use `WebFetch` to retrieve the content.
- For **text**: Use the text directly.

### Step 2: Check Delta

Read `vault/.manifest.json`. If a source with the same file path or URL was
previously ingested (hash matches), tell the user and ask if they want to re-ingest.
Skip this check for inline text or if the user says `--force`.

### Step 3: Analyze and Discuss

Quickly identify:
- 2-4 key takeaways
- Main entities mentioned (people, orgs, tools, products)
- Main concepts discussed (ideas, patterns, frameworks)

Share these takeaways with the user. Skip discussion if user said "just do it"
or "quick ingest".

### Step 4: Create Source Page

Create `vault/sources/<date-slug>.md` with:
```yaml
---
type: source
title: "Descriptive Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [relevant, tags]
source_type: article|video|paper|transcript|note
url: "..."  # if applicable
author: "..."  # if known
confidence: high|medium|low
key_claims:
  - "Claim 1"
  - "Claim 2"
summary: "One-paragraph summary"
related: []
sources: []
---
```
Then write the full source summary (500-1000 words) with main arguments,
evidence, and conclusions.

### Step 5: Create/Update Entity Pages

For each entity (person, org, tool, product, repo):
1. Check if `vault/entities/<name>.md` already exists (use `Glob` to search).
2. If **new**: Create with type `entity`, full description, link back to source.
3. If **existing**: Use `Edit` to add new information and cross-reference the source.

### Step 6: Create/Update Concept Pages

For each concept (idea, pattern, framework, theory):
1. Check if `vault/concepts/<name>.md` already exists.
2. If **new**: Create with type `concept`, clear explanation, link back to source.
3. If **existing**: Add new perspective, note contradictions with `> [!contradiction]`.

### Step 7: Update Indexes

1. Add entries to `vault/index.md` for all new pages.
2. Update `vault/sources/_index.md` if created a new source.
3. Update `vault/entities/_index.md` for new/updated entities.
4. Update `vault/concepts/_index.md` for new/updated concepts.

### Step 8: Update Hot Cache and Log

1. Edit `vault/hot.md`: add key takeaways, new pages, active threads.
2. Prepend a new entry to `vault/log.md` (newest entries at TOP).

### Step 9: Update Manifest

Add entry to `vault/.manifest.json`:
```json
{
  "source-slug": {
    "hash": "<sha1-of-content>",
    "ingested_at": "YYYY-MM-DDTHH:MM:SS",
    "pages_created": ["page1", "page2"],
    "pages_updated": ["page3"]
  }
}
```

## Output

After completion, report to the user:
- Pages created: N
- Pages updated: M
- Key insight added: one-line summary
- Suggest: "Ask me anything about this source or the wider vault"

## Batch Ingest

If given multiple sources, process them sequentially. After all are done,
do a cross-reference pass: find connections between the new sources and
add wikilinks between related new pages.
