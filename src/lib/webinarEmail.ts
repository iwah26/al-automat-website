const JOIN_URL = "https://www.al-automat.co.il/api/webinar/join";
const ZOOM_MEETING_ID = "885 6367 6021";
const ICS_URL = "https://www.al-automat.co.il/api/webinar/calendar";

const EVENT_TITLE = "וובינר פתוח - אל תישאר מאחור";
const EVENT_DETAILS = `וובינר פתוח "אל תישאר מאחור" - הטמעת AI בארגון. קישור הזום: ${JOIN_URL}`;

const GOOGLE_CAL_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  "&dates=20260820T180000Z/20260820T193000Z" +
  `&details=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(JOIN_URL)}`;

const OUTLOOK_CAL_URL =
  "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
  "&startdt=2026-08-20T18:00:00Z&enddt=2026-08-20T19:30:00Z" +
  `&subject=${encodeURIComponent(EVENT_TITLE)}` +
  `&body=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(JOIN_URL)}`;

/**
 * לינק הצטרפות אישי — נושא את שם הנרשם והמייל שלו, כדי שדוח המשתתפים של זום
 * יזהה אותו. בלי זה זום מדווח על שם המכשיר ("Samsung SM-S948B") ובלי מייל.
 */
function personalJoinUrl(fullName: string | null, email: string | null): string {
  const params = new URLSearchParams();
  if (fullName) params.set("u", fullName);
  if (email) params.set("e", email);
  const qs = params.toString();
  return qs ? `${JOIN_URL}?${qs}` : JOIN_URL;
}

export function buildWebinarConfirmationEmail(
  fullName: string | null,
  email: string | null = null
) {
  const greeting = fullName ? `שלום ${fullName} 🙏` : "שלום 🙏";
  const joinUrl = personalJoinUrl(fullName, email);
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>${greeting}</p>
      <p>תודה שנרשמת לוובינר הפתוח <strong>"אל תישאר מאחור"</strong>.</p>
      <p><strong>יום חמישי, 20.8</strong></p>
      <ul>
        <li>🇮🇱 ישראל — 21:00</li>
        <li>🇪🇸🇫🇷 ספרד/צרפת — 20:00</li>
        <li>🇬🇧 אנגליה — 19:00</li>
        <li>🇦🇷 ארגנטינה — 15:00</li>
        <li>🇺🇸🇻🇪 ארה"ב (מזרח)/ונצואלה — 14:00</li>
        <li>🇲🇽 מקסיקו — 12:00</li>
      </ul>
      <p><strong>פרטי הזום:</strong></p>
      <p>
        <a href="${joinUrl}" style="display:inline-block; padding:12px 28px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;">כניסה לוובינר</a>
      </p>
      <p style="font-size:13px; color:#666;">
        אם הכפתור לא עובד: <a href="${joinUrl}">${JOIN_URL}</a><br />
        Meeting ID: ${ZOOM_MEETING_ID}
      </p>
      <p style="color:#888; font-size: 13px;">הקישור פעיל מהתחלת הוובינר ועד שעה וחצי אחריו. אם תלחץ עליו מאוחר יותר, תופנה לדף הרשמה לסדנה.</p>
      <p><strong>מוסיפים ליומן עם תזכורת חצי שעה לפני:</strong></p>
      <p>
        <a href="${GOOGLE_CAL_URL}" style="display:inline-block; margin-left:8px; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">Google Calendar</a>
        <a href="${OUTLOOK_CAL_URL}" style="display:inline-block; margin-left:8px; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">Outlook / Hotmail</a>
        <a href="${ICS_URL}" style="display:inline-block; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">קובץ ליומן אחר (ICS)</a>
      </p>
      <p style="margin-top:24px; padding-top:16px; border-top:1px solid #ddd;">
        <strong>לתשומת לבך:</strong> הוובינר הוא גם מפגש הכנה לסדנה המעשית —
        יום שישי 21.8 ויום שישי 28.8, בשעות 9:30–12:30 בבוקר (שעון ישראל), בזום.
        כל הפרטים יינתנו בוובינר.
      </p>
      <p>נתראה!</p>
    </div>
  `;
}
