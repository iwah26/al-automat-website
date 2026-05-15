# Skill: Content

## Triggers
Writing, editing, or translating any visible text on the site — headlines, descriptions, CTAs, labels, error messages.

## Language Rules
- All user-facing text is Hebrew
- Tone: confident, direct, human — not corporate. Speak like a smart consultant, not a brochure.
- Never use passive voice where active is possible (❌ "תהליכים שמבוצעים" → ✅ "תהליכים שאנחנו מבצעים")
- Avoid buzzword stacking: no "פתרונות חדשניים ומתקדמים לעולם הדיגיטלי"

## Copy Patterns
- Headlines: short, punchy, verb-led (e.g., "תפסיק לעשות ידנית", "תן ל-AI לעבוד בשבילך")
- CTAs: action verbs (e.g., "בוא נדבר", "שלח הודעה", "קרא עוד")
- Service descriptions: 1 sentence of what + 1 sentence of why it matters to the client

## Content File
- All hardcoded strings live in `src/data/content.ts` — a single exported const object
- No string literals inside JSX except for punctuation and formatting
- Structure: `content.hero.headline`, `content.services[n].title`, etc.

## Forbidden
- English text visible to users (code comments and variable names can be English)
- Lorem ipsum in any committed file
- Exclamation marks in headlines — they weaken the tone
