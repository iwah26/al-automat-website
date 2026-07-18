const JOIN_URL = "https://www.al-automat.co.il/api/webinar/join";
const ZOOM_MEETING_ID = "861 8382 1803";
const ZOOM_PASSCODE = "314248";
const ICS_URL = "https://www.al-automat.co.il/api/webinar/calendar";

const EVENT_TITLE = "וובינר פתוח - קלוד קוד לרבנים";
const EVENT_DETAILS = `וובינר פתוח "קלוד קוד לרבנים". קישור הזום: ${JOIN_URL}`;

const GOOGLE_CAL_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(EVENT_TITLE)}` +
  "&dates=20260721T180000Z/20260721T190000Z" +
  `&details=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(JOIN_URL)}`;

const OUTLOOK_CAL_URL =
  "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent" +
  "&startdt=2026-07-21T18:00:00Z&enddt=2026-07-21T19:00:00Z" +
  `&subject=${encodeURIComponent(EVENT_TITLE)}` +
  `&body=${encodeURIComponent(EVENT_DETAILS)}` +
  `&location=${encodeURIComponent(JOIN_URL)}`;

export function buildWebinarConfirmationEmail(fullName: string | null) {
  const greeting = fullName ? `שלום ${fullName} 🙏` : "שלום 🙏";
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6;">
      <p>${greeting}</p>
      <p>תודה שנרשמת לוובינר הפתוח <strong>"קלוד קוד לרבנים"</strong>!</p>
      <p><strong>יום שלישי, 21.7</strong></p>
      <ul>
        <li>🇮🇱 ישראל — 21:00</li>
        <li>🇬🇧 אנגליה — 19:00</li>
        <li>🇪🇸🇫🇷 ספרד/צרפת — 20:00</li>
        <li>🇦🇷 ארגנטינה — 15:00</li>
        <li>🇺🇸🇻🇪 ארה"ב (מזרח)/ונצואלה — 14:00</li>
        <li>🇲🇽 מקסיקו — 12:00</li>
      </ul>
      <p><strong>פרטי הזום:</strong></p>
      <p>
        קישור: <a href="${JOIN_URL}">${JOIN_URL}</a><br />
        Meeting ID: ${ZOOM_MEETING_ID}<br />
        Passcode: ${ZOOM_PASSCODE}
      </p>
      <p style="color:#888; font-size: 13px;">הקישור פעיל מהתחלת הוובינר ועד חצי שעה אחריו. אם תלחץ עליו מאוחר יותר, תופנה לדף הרשמה לסדנה.</p>
      <p><strong>מוסיפים ליומן עם תזכורת חצי שעה לפני:</strong></p>
      <p>
        <a href="${GOOGLE_CAL_URL}" style="display:inline-block; margin-left:8px; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">Google Calendar</a>
        <a href="${OUTLOOK_CAL_URL}" style="display:inline-block; margin-left:8px; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">Outlook / Hotmail</a>
        <a href="${ICS_URL}" style="display:inline-block; padding:8px 16px; background:#412a62; color:#fff; border-radius:6px; text-decoration:none;">קובץ ליומן אחר (ICS)</a>
      </p>
      <p>נתראה!</p>
    </div>
  `;
}
