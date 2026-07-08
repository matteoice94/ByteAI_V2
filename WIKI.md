# Wiki Vault Schema

This is the canonical reference for the opencode knowledge vault system.
All skills (`.opencode/skills/wiki*/SKILL.md`) reference this schema.

## Vault Architecture

```
vault/
├── hot.md                  # Recent context cache (~500 words)
├── index.md                # Master catalog of all pages
├── log.md                  # Append-only operation log
├── overview.md             # Executive summary of the vault
├── sources/                # One summary page per ingested source
│   └── _index.md           # Sub-index for sources
├── entities/               # People, orgs, tools, products, repos
│   └── _index.md           # Sub-index for entities
├── concepts/               # Ideas, patterns, frameworks, theories
│   └── _index.md           # Sub-index for concepts
├── questions/              # Filed answers to user queries
├── sessions/               # Filed conversation summaries
└── meta/                   # Dashboards, lint reports
```

## Page Frontmatter Schema

Every wiki page MUST include this YAML frontmatter at the top:

```yaml
---
type: <source|entity|concept|question|session|meta>
title: "Human-Readable Title"
created: 2026-01-15
updated: 2026-01-15
tags: [category, subcategory]
aliases: ["Alternative Title"]
related: ["[[Other Page]]", "[[Another Page]]"]
sources: ["[[sources/source-file.md]]"]
summary: "One-sentence description of this page"
---
```

### Type-Specific Fields

**source** (for ingested documents):
```yaml
type: source
source_type: article        # article | video | paper | transcript | note
url: "https://..."          # Optional, for web sources
author: "Author Name"       # Optional
confidence: high            # high | medium | low
key_claims:
  - "Main claim 1"
  - "Main claim 2"
```

**entity** (people, orgs, tools):
```yaml
type: entity
entity_type: person         # person | organization | tool | product | repo
role: "Author of ..."       # Brief description
```

**concept** (ideas, patterns, frameworks):
```yaml
type: concept
complexity: intermediate    # basic | intermediate | advanced
aliases: ["Other Name"]
```

**question** (filed answers):
```yaml
type: question
question: "The original user question"
answer_quality: draft       # draft | reviewed | final
```

## Hot Cache Format (`vault/hot.md`)

```markdown
---
type: meta
title: "Hot Cache"
updated: 2026-01-15T10:30:00
---
# Recent Context

## Last Updated
2026-01-15 — Ingested 3 new sources

## Key Recent Facts
- [Most important recent takeaway]
- [Second important takeaway]

## Recent Changes
- Created: [[concepts/new-concept]], [[entities/new-entity]]
- Updated: [[concepts/existing-concept]] (added section on X)

## Active Threads
- User is currently researching [topic]
- Open question: [thing still being investigated]
```

## Index Format (`vault/index.md`)

```markdown
---
type: meta
title: "Vault Index"
updated: 2026-01-15T10:30:00
---
# Vault Index

## Sources
- [[sources/article-about-x]] — Summary of X by Author (2024)
- [[sources/video-about-y]] — Transcript of Y tutorial

## Entities
- [[entities/john-doe]] — person, author of X
- [[entities/example-corp]] — organization, created Y

## Concepts
- [[concepts/machine-learning]] — intermediate
- [[concepts/reinforcement-learning]] — advanced
```

## Log Format (`vault/log.md`)

New entries go at the TOP. Each entry:

```markdown
## 2026-01-15 10:30
**Operation**: ingest | query | lint | save
**Pages created**: [[page-one]], [[page-two]]
**Pages updated**: [[existing-page]]
**Summary**: Brief description of what happened
```

## Ingest Protocol

When ingesting a source, follow these steps:

1. **Check delta**: Read `.manifest.json` in vault root. If source hash matches a prior
   ingest, ask user if they want to re-process (`--force`).
2. **Read source** completely (no skimming).
3. **Discuss key takeaways** with user (skip if user said "just ingest it").
4. **Create source page** in `vault/sources/` with full frontmatter.
5. **Create/update entity pages** for every person, org, tool, product mentioned.
   Minimum: name, type, role, link to source.
6. **Create/update concept pages** for significant ideas, patterns, frameworks.
   Minimum: title, summary, link to source.
7. **Update `vault/overview.md`** if the big picture changed.
8. **Update `vault/index.md`** — add entries for all new pages.
   Update `_index.md` files in affected subdirectories.
9. **Update `vault/hot.md`** — add context from this ingest.
10. **Append to `vault/log.md`** — new entry at TOP.
11. **Update `.manifest.json`** — record source hash + created pages.

A single source typically produces 3-8 wiki pages.

## Query Protocol

When answering a question, follow this layered read strategy:

1. **Read `vault/hot.md`** (always, ~500 words). If answer is found → respond.
2. **Read `vault/index.md`** — scan for relevant page titles.
3. **Read 3-5 candidate pages** — follow wikilinks one level deep.
4. **Synthesize answer** — cite specific wiki pages with `[[page]]` links.
5. **Offer to file answer** as a new page in `vault/questions/`.

## Lint Categories

1. **Orphans**: Pages not linked from index or any other page
2. **Dead links**: Wikilinks `[[...]]` pointing to non-existent pages
3. **Stale claims**: Pages with `updated` older than 90 days
4. **Missing frontmatter**: Pages without required YAML fields
5. **Empty sections**: Pages with headings but no content
6. **Stale index**: Pages not listed in their sub-index

## Linking Conventions

- Use `[[relative-path/filename]]` for wikilinks (e.g., `[[concepts/machine-learning]]`)
- Use `[[filename|Display Text]]` for custom display text
- Page filenames are lower-kebab-case: `machine-learning.md`, `john-doe.md`
- Source files retain their original filename with a date prefix: `2026-01-15-article-slug.md`
