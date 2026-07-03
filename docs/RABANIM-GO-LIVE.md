# סדנת רבנים — צ'קליסט לפני הפעלה בפרודקשן

הקוד מוכן ועובר build נקי. נשארו רק צעדים שדורשים ממך לפעול בדשבורדים חיצוניים
(לא ניתן לעשות דרך הקוד).

## 1. Supabase — ✅ בוצע
פרויקט `rabanim-workshop` נוצר, הסכמה רצה, `.env.local` מולא ונבדק (200 OK).

## 2. Green API — ✅ בוצע
הועתק אוטומטית מ-`whatsapp-green-api/.env`.

## 3. תשלום — PayPal IPN (לא Morning!)
**גילוי חשוב:** ל-Morning (Green Invoice) אין מסוף סליקה מחובר בחשבון —
התשלום בפועל עובר דרך PayPal (לינק סטטי). לכן ויתרנו על יצירת דף תשלום דינמי
דרך Morning API, ובמקום זה מאמתים תשלום דרך **PayPal IPN**, ומתאימים אותו
להרשמה לפי כתובת המייל (לא reference דינמי).

**מה שנשאר לעשות ב-PayPal:**
1. היכנס לחשבון ה-PayPal העסקי שלך → **Account Settings → Notifications → Instant Payment Notifications (IPN)**
2. הפעל IPN, וקבע URL:
   `https://www.al-automat.co.il/api/rabanim/paypal-webhook`
3. שמור

זהו — אין secret/API key נוסף לשמור מהצד הזה; PayPal IPN מאומת מול שרתי PayPal ישירות בקוד.

⚠️ **מגבלה שכדאי לדעת:** ההתאמה בין תשלום להרשמה נעשית לפי **כתובת המייל** של
המשלם מול המייל שהוזן בטופס. אם רב ישלם עם מייל PayPal שונה מהמייל שמילא
בטופס — ההודעה לא תישלח אוטומטית (אפשר לתקן ידנית ב-Supabase: לעדכן את
`payment_status` ל-`paid` בטבלת `rabanim_registrations` ולהוסיף שורה
ל-`rabanim_course_access` עם סיסמה).

## 4. סודות עצמאיים — ✅ בוצע
`COURSE_SESSION_SECRET` ו-`CRON_SECRET` נוצרו ונשמרו ב-`.env.local`.

## 5. Vercel — נשאר
- כל משתני הסביבה ב-`.env.local` חייבים להיות מוגדרים גם ב-**Vercel Project Settings → Environment Variables**
- `vercel.json` כבר מכיל שני cron jobs לתזכורות (11.7, 18.7 ב-18:00 שעון ישראל) — יתחילו לעבוד אוטומטית אחרי deploy

## מה נבנה (לצורך הבנה, לא צריך לגעת)
- `src/lib/rabanimSupabase.ts`, `src/lib/greenApi.ts`, `src/lib/courseSession.ts`
- `src/app/api/rabanim/checkout` — שומר הרשמה ב-Supabase (`payment_status: pending`), מחזיר לינק PayPal סטטי
- `src/app/api/rabanim/paypal-webhook` — מאמת IPN מול PayPal, מתאים לפי מייל, מסמן "שולם", מייצר סיסמה, שולח אישור WhatsApp
- `src/app/api/rabanim/course-login` + `src/app/course-login` — הגנת סיסמה ל-/course, עד 2 מכשירים
- `src/app/api/rabanim/reminders` + `vercel.json` — תזכורות אוטומטיות
