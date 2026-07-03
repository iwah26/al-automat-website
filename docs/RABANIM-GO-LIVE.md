# סדנת רבנים — סטטוס הפעלה

**✅ הכל חי בפרודקשן ונבדק מקצה לקצה (2026-07-03).**

## מה נבדק ועובד
- טופס הרשמה ב-`/sednah-rabanim` → שומר ל-Supabase (`payment_status: pending`) → מחזיר לינק תשלום PayPal
- `/course-login` — דף כניסה עם סיסמה, דוחה סיסמה שגויה (401)
- `/api/rabanim/reminders` — דורש `CRON_SECRET`, דוחה בקשות לא מאומתות (401)
- `vercel.json` — cron jobs לתזכורות ב-11.7 וב-18.7 (18:00 שעון ישראל) מוגדרים ויעבדו אוטומטית

## מנגנון התשלום — PayPal (לא Morning)
Morning (Green Invoice) אין לו מסוף סליקת אשראי פעיל בחשבון — ה-PayPal מחובר
כתוסף אבל לא נתמך ליצירת דף תשלום דינמי דרך `/payments/form`. לכן:
- התשלום עצמו נשאר לינק PayPal סטטי (כמו לפני)
- אישור תשלום מגיע דרך **PayPal IPN**, מועבר גם דרך שדה ה-**Callback** בהגדרות
  תוסף ה-PayPal ב-Morning (כדי לא לגעת בזרימת יצירת החשבונית הקיימת שם)
- ההתאמה בין תשלום להרשמה היא לפי **כתובת מייל** (לא reference דינמי) — אם
  רב משלם עם מייל שונה מהטופס, ההודעה לא תישלח אוטומטית (תיקון ידני ב-Supabase:
  לעדכן `payment_status` ל-`paid` ולהוסיף שורה ל-`rabanim_course_access`)

## תקלת תשתית שנמצאה ותוקנה: שני חשבונות Vercel
היה בלגן: ה-repo ב-GitHub (`iwah26/al-automat-website`) היה מחובר ל-**שני**
חשבונות Vercel נפרדים — אחד (`isaac-wahnon-s-projects`) מקבל push webhooks
אבל לא מחזיק את הדומיין, והשני (`onautomat-4917's projects`, שכן מחזיק את
`www.al-automat.co.il`) **לא היה מחובר ל-git בכלל** — עלה פעם ידנית, ולכן
"Redeploy" רק חזר שוב על אותה גרסה ישנה. תוקן: חיברנו את `onautomat-4917`
ל-git repo כמו שצריך. **מכאן והלאה, git push ל-main אמור לפרוס אוטומטית.**

⚠️ **לזכור לפרויקטים אחרים:** יש אצל יצחק בלגן דומה בין GitHub/Vercel/Supabase
בפרויקטים אחרים גם (הוא אמר את זה במפורש). אם דפלוי לא "נתפס" בפעם הבאה —
לבדוק קודם כל **איזה חשבון Vercel מחזיק את הדומיין** לפני שמנסים לאבחן את הקוד.

## קבצים
- `src/lib/rabanimSupabase.ts`, `src/lib/greenApi.ts`, `src/lib/courseSession.ts`
- `src/app/api/rabanim/checkout` — שומר הרשמה, מחזיר לינק PayPal
- `src/app/api/rabanim/paypal-webhook` — מאמת IPN, מתאים לפי מייל, מסמן "שולם", שולח WhatsApp
- `src/app/api/rabanim/course-login` + `src/app/course-login` — הגנת סיסמה, עד 2 מכשירים
- `src/app/api/rabanim/reminders` + `vercel.json` — תזכורות אוטומטיות
- `supabase/rabanim-schema.sql` — הסכמה (כבר רצה בפרויקט `rabanim-workshop`)
