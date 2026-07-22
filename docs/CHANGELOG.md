2026-06-04 — נבחרת היועצים: עמוד טופס `/navcheret` + API submit (Supabase) + API export vCard — TypeScript passes clean.
2026-05-13 — Initial build: Next.js 16 + Tailwind + Framer Motion scaffold with Hero, Services, About, CV, Contact sections and Navbar — build passes clean.
2026-05-13 — Added Testimonials section (4 cards, star ratings, avatar initials, scroll-in animation) between CV and Contact — build passes clean.
2026-05-13 — Added brand logos: rectangular negative in Navbar + Footer, square negative as favicon — deployed to Vercel prod.- [2026-05-13] עדכון פלטת צבעים לסגול (#2e1e45 bg, #7a59a5 accent) — החלפת כל ה-blue/cyan בכל הקומפוננטות ו-tailwind.config
2026-05-13 — WhatsApp link wired to 97226233170; contact form rewritten with phone field + privacy checkbox + webhook POST to boost.space — build passes clean.
2026-05-13 — SEO: OG image (1200x630, edge runtime), sitemap.xml, robots.txt, JSON-LD ProfessionalService schema, metadataBase + twitter card in layout — build passes clean.
2026-05-13 — Deploy to Vercel prod: https://13-05-26-al-automat-website.vercel.app — build clean, all routes static.
- 2026-05-15 — site deployed to https://al-automat-website.vercel.app/ via Vercel + GitHub integration
- 2026-05-15 — custom domain al-automat.co.il connected via Vercel + SiteGround DNS
- Added רהיטים category with subcategories to navcheret form
- הוספת פרטי קשר בית העסק (טלפון, כתובת) ל-Contact + דף /terms עם תקנון ביטולים לפי חוק הגנת הצרכן
- 2026-07-03: Added rabanim workshop payment flow (Morning dynamic payment form + webhook), Supabase-backed registrations + course access, /course password gate with 2-device limit, WhatsApp (Green API) confirmation + reminder cron. Needs env vars filled before going live (see below).
- 2026-07-06: Added affiliate/referral tracking for sednah-rabanim — `?c=<code>` now threaded through form→checkout→DB (`rabanim_registrations.referral_code`, needs manual `alter table` from supabase/rabanim-schema.sql run once in Supabase SQL editor), plus a per-affiliate report page at /sednah-rabanim/affiliate?code=<code>.
- 2026-07-13: /course page redesigned to light theme (new "course" Tailwind color tokens: bg/card/border/text/muted/accent) — replaced dark brand-* colors in course layout, sidebar, and SessionPage.
- 2026-07-13: Added /mashov (private 360-feedback form + admin table) and an automated call-recording→Fireflies transcription pipeline (/api/calls/transcribe-poll, GitHub Action every 10 min): downloads new files from a Drive folder via a read-only Google service account, stages them in Vercel Blob, uploads to Fireflies, locks each transcript to owner-only privacy, tracks state in Supabase (call_recordings_processed).
- 2026-07-21: Added GET /api/zoom/poll-results?meetingId=... — live Zoom poll results (via Zoom's poll report REST API, not a webhook) for the webinar deck's '▶ תוצאות חי' button. Needs the Zoom Server-to-Server app to have a poll-report read scope enabled (e.g. report:read:list_poll_results) — not yet confirmed enabled.
- 2026-07-21: coaching-homework — added nested sub-items per item (parent_item_id self-reference on coaching_homework_items, cascade delete), collapsible sub-list in both the personal edit page and the read-only coach view. Migration: supabase/coaching-homework-subitems-migration.sql.
