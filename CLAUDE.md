# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Protocol

Before writing or modifying any code: (1) identify your domain, (2) read the corresponding skill file in full from `.claude/skills/`, (3) only then proceed.

## `!resume` Command

If the user types `!resume` at the start of a session: READ `docs/BIG_PICTURE.md`. Do not print it. Reply with a short status summary and ask: "What are we working on this session?" Never read it again during the session unless asked.

## Session Discipline

One session = one task. Do not let the conversation sprawl across multiple features or fixes. When the task is complete, say so explicitly.

## Routing Table

| Trigger | Skill File |
|---|---|
| Colors, fonts, spacing, animations, layout, responsive, RTL | `.claude/skills/design.md` |
| Any page section: Hero, Services, About, CV, Contact | `.claude/skills/sections.md` |
| Hebrew copy, headlines, CTAs, `content.ts` | `.claude/skills/content.md` |
| Metadata, OG tags, alt text, Lighthouse, `<Image>` | `.claude/skills/seo.md` |
| Vercel, build errors, env vars, domain, CI | `.claude/skills/deploy.md` |

## After Every Completed Task

1. APPEND a 1-liner to `docs/CHANGELOG.md`. Never read it.
2. Optionally APPEND out-of-scope ideas as 1-liners to `docs/BACKLOG.md`.
3. Tell the user: "Task complete. Log updated. Please close this chat and open a new one — keep the context window clean."
