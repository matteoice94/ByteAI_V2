---
name: wiki-lint
description: Check knowledge vault health. Finds orphans, dead links, stale claims, missing frontmatter, empty sections, and stale index entries. Reports issues with severity levels.
---

# Wiki Lint

You perform health checks on the knowledge vault. Read `WIKI.md` in the project
root for the complete schema.

## Lint Categories

Run all checks below and report findings:

### 1. Orphans
Pages not linked from `index.md` or any other wiki page.
- Use `Grep` to find all `[[wikilinks]]` across the vault.
- List all pages that no other page links to.
- **Severity**: LOW unless the page has no incoming or outgoing links → MEDIUM.

### 2. Dead Links
`[[...]]` wikilinks pointing to non-existent pages.
- Extract all wikilinks across the vault with `Grep '\[\[.*?\]\]'`.
- Check if each target file exists with `Glob`.
- **Severity**: MEDIUM (broken navigation).

### 3. Stale Claims
Pages with `updated` field older than 90 days.
- Use `Grep 'updated: '` to find all update dates.
- Flag pages older than 90 days.
- **Severity**: LOW (may still be accurate).

### 4. Missing Frontmatter
Pages without the required YAML frontmatter:
- Must have: `type`, `title`, `created`, `updated`.
- Type-specific fields: `source_type` for sources, `entity_type` for entities,
  `complexity` for concepts, `question` for questions.
- **Severity**: MEDIUM.

### 5. Empty Sections
Pages with headings but no body content under them.
- Scan each page for `## heading` followed by another heading with no text between.
- **Severity**: LOW.

### 6. Stale Index Entries
Pages that exist on disk but are not listed in their `_index.md`.
- Compare `vault/sources/_index.md` against files in `vault/sources/`.
- Same for entities, concepts.
- **Severity**: HIGH (breaks navigation).

## Reporting Format

```
# Vault Lint Report — YYYY-MM-DD

## Summary
- Total pages: N
- Issues found: M
- 🔴 High: X | 🟡 Medium: Y | ⚪ Low: Z

## Issues

### 🔴 Stale Index Entries (X)
- `concepts/missing-from-index` — not listed in concepts/_index.md

### 🟡 Dead Links (Y)
- `entities/john-doe.md` links to `[[concepts/nonexistent]]`

### ⚪ Orphans (Z)
- `sources/old-article.md` — not linked from anywhere

### 🟡 Missing Frontmatter (W)
- `concepts/bare-page.md` — missing `complexity` field
```

## Auto-Fix

After reporting, offer to fix issues:
- Dead links: suggest removing or creating stub pages.
- Stale index: offer to update `_index.md` files.
- Missing frontmatter: offer to add the missing fields.

Never auto-fix without user confirmation.
