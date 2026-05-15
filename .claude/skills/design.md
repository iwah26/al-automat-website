# Skill: Design

## Triggers
Any change to colors, typography, spacing, layout, responsive breakpoints, animations, or dark/light mode.

## Palette & Typography
- Primary: deep indigo or near-black (#0F0F1A or similar) — dark, premium feel
- Accent: electric blue or teal gradient — tech/automation energy
- Text: white on dark backgrounds; never gray-on-gray
- Font: Heebo or Rubik (Google Fonts) — Hebrew-optimized, modern
- Font scale: use Tailwind defaults (text-sm through text-6xl); never hardcode px font sizes

## Tailwind Rules
- Use `dir="rtl"` on `<html>` — all flex/grid directions must account for RTL
- Use `space-x-reverse` and `mr-*` instead of `ml-*` for RTL spacing
- Mobile-first: base classes for mobile, `md:` and `lg:` for wider screens
- No inline styles. No arbitrary Tailwind values unless absolutely necessary (e.g., `w-[73px]` is forbidden — use the scale)

## Animations (Framer Motion)
- Entry animations: fade-in + slide-up (`y: 30 → 0, opacity: 0 → 1`), duration 0.5s
- Stagger children with `staggerChildren: 0.1`
- No animations on text that must be readable immediately (hero H1)
- `useReducedMotion()` must be respected — wrap all motion components with a check

## Forbidden
- Bootstrap, MUI, Chakra, or any component library — Tailwind only
- Fixed pixel heights on sections — use `min-h-*` or `py-*`
- Horizontal scrollbars on any viewport width
