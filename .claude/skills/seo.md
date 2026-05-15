# Skill: SEO

## Triggers
Any change to metadata, page titles, OG tags, structured data, image alt text, or performance optimizations.

## Next.js Metadata
- Use the `metadata` export (App Router) in `app/layout.tsx` and `app/page.tsx`
- Title template: `"[Page Name] | על אוטומט"`
- Description: 120–155 chars, Hebrew, includes primary keyword

## Required Tags on Every Page
```ts
title, description, openGraph.title, openGraph.description,
openGraph.image (1200x630), twitter.card = "summary_large_image"
```

## Hebrew SEO
- Primary keyword targets: "אוטומציות עסקיות", "בוטים לעסקים", "תהליכי AI", "Claude Code ישראל"
- `<html lang="he" dir="rtl">` — always

## Images
- All `<Image>` components must have descriptive Hebrew `alt` text
- Use Next.js `<Image>` (never `<img>`) for automatic optimization
- Hero image must be pre-loaded: `priority` prop on the hero `<Image>`

## Performance
- No third-party scripts in `<head>` unless critical
- Google Fonts loaded via `next/font` — never a `<link>` tag
- Target Lighthouse score: 90+ on mobile
