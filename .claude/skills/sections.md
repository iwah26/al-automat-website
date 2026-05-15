# Skill: Sections

## Triggers
Building, editing, or restructuring any page section: Hero, Services, About, CV/Lectures, Testimonials, Contact.

## File Structure
- Each section is a standalone React component in `src/components/sections/`
- Named exports only — no default exports
- Props typed with TypeScript interfaces defined in the same file

## Section Contracts

### Hero
- Must have: H1 tagline, sub-headline, primary CTA button, background visual (gradient or subtle animated mesh)
- H1 must be above the fold on all viewports
- CTA scrolls to #contact or links to WhatsApp

### Services
- Render as a grid of cards (3 cols desktop, 2 tablet, 1 mobile)
- Each card: icon (SVG inline, no external icon lib), title, 2-line description
- Services: אוטומציות, בוטים, CRM, תהליכי AI, Claude Code

### CV / Lectures
- Two sub-sections: (1) professional background timeline, (2) lectures/courses list
- Lectures list: title, audience, date/year, optional link
- This section must be printable — add `print:` Tailwind variants where needed

### Contact
- WhatsApp CTA as primary action (link: `https://wa.me/972XXXXXXXXX`)
- Optional: simple form (name, email, message) — no backend required, use mailto: fallback

## Forbidden
- Fetching section content from an API or CMS — hardcode everything for now
- Deeply nested components — max 2 levels of component composition per section
