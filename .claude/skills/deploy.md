# Skill: Deploy

## Triggers
Vercel configuration, environment variables, build errors, domain setup, or any CI/CD change.

## Vercel Setup
- Deploy via `vercel` CLI or GitHub integration (preferred)
- Framework preset: Next.js (auto-detected)
- Root directory: project root (no monorepo)

## Environment Variables
- Store in Vercel dashboard under project settings — never in `.env` committed to git
- `.env.local` for local dev only — must be in `.gitignore`
- Required vars: none at launch (no backend). Add `NEXT_PUBLIC_WHATSAPP_NUMBER` when contact is wired.

## Build Checks Before Deploy
1. `next build` passes with zero errors and zero TypeScript errors
2. No `console.error` or unhandled Promise rejections in build output
3. All images have `width` and `height` props (Next.js requirement)

## Domain
- Custom domain configured in Vercel dashboard
- `www` redirects to apex (or vice versa) — pick one, configure redirect in Vercel

## Forbidden
- `next export` (static HTML export) — use default Next.js server rendering
- Committing `.env`, `.env.local`, or any file with API keys
