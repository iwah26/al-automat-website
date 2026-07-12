# מדריך התקנה — Claude Code
_Mac + Windows | לרבנים שאינם טכניים_

---

## שלב 1 — התקנת VS Code

### Mac
1. כנס לאתר: https://code.visualstudio.com
2. לחץ על הכפתור הכחול הגדול "Download for Mac"
3. פתח את הקובץ שהורד (VSCode-darwin.zip)
4. גרור את האייקון לתיקיית Applications
5. פתח מ-Applications

### Windows
1. כנס לאתר: https://code.visualstudio.com
2. לחץ על "Download for Windows"
3. פתח את הקובץ שהורד (.exe)
4. לחץ "Next" עד הסוף — השאר הכל כברירת מחדל
5. לחץ "Install" ואז "Finish"

**בדיקה:** VS Code נפתח? ✅ ממשיכים.

---

## שלב 2 — התקנת Node.js

### Mac
1. כנס לאתר: https://nodejs.org
2. לחץ על הכפתור הירוק "LTS" (לא Current)
3. פתח את הקובץ שהורד (.pkg)
4. לחץ "Continue" עד הסוף

### Windows
1. כנס לאתר: https://nodejs.org
2. לחץ על הכפתור הירוק "LTS"
3. פתח את הקובץ שהורד (.msi)
4. לחץ "Next" עד הסוף

**בדיקה:**
- פתח Terminal (Mac) או Command Prompt (Windows)
- כתוב: `node --version`
- אמור להופיע מספר גרסה (למשל v20.11.0) ✅

---

## שלב 3 — התקנת Claude Code

### Mac + Windows (אותה פקודה)
1. פתח Terminal (Mac) או Command Prompt (Windows)
2. הדבק את השורה הזו ולחץ Enter:
```
npm install -g @anthropic-ai/claude-code
```
3. המתן עד שמסתיים (כ-30 שניות)

**בדיקה:**
- כתוב: `claude --version`
- אמור להופיע מספר גרסה ✅

---

## שלב 4 — קבלת API Key

1. כנס לאתר: https://console.anthropic.com
2. צור חשבון (או התחבר אם יש)
3. לחץ על "API Keys" בתפריט השמאלי
4. לחץ "Create Key"
5. תן לו שם (למשל "סדנה-רבנים")
6. **העתק את המפתח מיד** — הוא מופיע פעם אחת בלבד!
7. שמור אותו במקום בטוח (NotePad / Apple Notes)

⚠️ **חשוב:** לעולם לא לשתף את המפתח הזה עם אף אחד

---

## שלב 5 — חיבור Claude Code ל-API Key

### Mac
1. פתח Terminal
2. כתוב:
```
export ANTHROPIC_API_KEY=המפתח-שלך
```
3. לחץ Enter

### Windows
1. פתח Command Prompt
2. כתוב:
```
set ANTHROPIC_API_KEY=המפתח-שלך
```
3. לחץ Enter

---

## שלב 6 — פתיחת Claude Code ב-VS Code

1. פתח VS Code
2. לחץ על Extensions (האייקון עם 4 ריבועים בשמאל)
3. חפש "Claude Code"
4. לחץ Install
5. פתח Terminal בתוך VS Code: תפריט → Terminal → New Terminal
6. כתוב: `claude`
7. Claude Code נפתח! ✅

---

## שלב 7 — הגדרות נוספות

### RTL — עברית מימין לשמאל
1. ב-VS Code לחץ על Extensions (האייקון עם 4 ריבועים בשמאל)
2. חפש: `Claude Code RTL Support`
3. לחץ Install על האקסטנשן של **yechielby**
4. סגור VS Code ופתח מחדש

זהו — Claude Code יזהה עברית אוטומטית ויציג אותה מימין לשמאל.

### פיצ'ר צלצול בסוף עבודה
ב-Claude Code כתוב:
```
/config
```
ושם תוכל להפעיל התראות קול

---

## בעיות נפוצות

| בעיה | פתרון |
|---|---|
| "npm not found" | Node.js לא הותקן — חזור לשלב 2 |
| "claude not found" | סגור Terminal ופתח מחדש |
| API Key לא עובד | וודא שהעתקת אותו נכון בלי רווחים |
| VS Code לא נפתח | הפעל מחדש את המחשב |

---

## עזרה
אם נתקעת — צלם מסך ושאל את Claude Code:
> "קיבלתי את השגיאה הזו בהתקנה, מה לעשות?"

---
_עודכן: 2026-06-28_
