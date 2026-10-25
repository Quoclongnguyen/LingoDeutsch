---
name: lingo-german-domain
description: Validate and implement German-learning vocabulary, grammar, bilingual examples, and CEFR content for Lingo Deutsch. Use when work changes learner-facing German content or its domain validation; do not use for infrastructure-only tasks.
---

# Lingo German domain

Read the relevant product rules in `docs/PRD.md` and content/design rules in `docs/DESIGN.md` before changing learner-facing language data.

## Required invariants

- Preserve German capitalization, umlauts, and `ß`.
- Store nouns with article and plural when a plural exists. Use `noPlural` only when the noun genuinely lacks a plural in the intended sense.
- Keep the headword separate from structured metadata such as article, plural, reflexive marker, separable prefix, governed preposition, and case.
- Use concise Vietnamese meanings and natural German example sentences appropriate to the assigned CEFR level.
- Distinguish `Sie` and `du` register when it affects meaning or usage.
- Do not invent a grammar rule when uncertain. Flag the item for review instead.

## Workflow

1. Identify the content type and level.
2. Check the German form, grammatical metadata, Vietnamese meaning, and example together.
3. Preserve the vocabulary schema from the PRD.
4. Add validation or fixture coverage when a correctness rule can be enforced deterministically.
5. Report any linguistic uncertainty explicitly.

Do not expand a coding task into broad curriculum authoring unless requested.
