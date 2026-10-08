import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp, RABANIM_GROUP_INVITE_LINK } from "@/lib/greenApi";
import { signRegistrationId } from "@/lib/morning";
import { sendMail } from "@/lib/mailer";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string | null;
  cohort?: string;
}

interface CohortDetails {
  dates: string;
  hours: string;
  zoomLink: string;
  greeting: string;
  workshopName: string;
  // null = אין עדיין קבוצת וואטסאפ למחזור, לא שולחים הזמנה
  group: { name: string; link: string } | null;
  // טופס השאלות שממלאים אחרי התשלום (מחזור ד׳)
  detailsPath?: string;
  // אתר ההקלטות של המחזור (כל מחזור עם סיסמה משלו)
  coursePath: string;
  // מייל אישור עם כל הפרטים והסיסמה (מחזור ד׳)
  sendEmail?: boolean;
}

const RABBIS_GROUP = { name: "סדנת Claude Code לרבנים 🧠", link: RABANIM_GROUP_INVITE_LINK };

const COHORT_DETAILS: Record<string, CohortDetails> = {
  round1: {
    dates: "12.7 (כ״ז תמוז) + 19.7 (ה׳ אב)",
    hours: "18:00–21:00 שעון ישראל",
    zoomLink: "https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1",
    greeting: "שלום כבוד הרב",
    workshopName: "קלוד קוד לרבנים",
    group: RABBIS_GROUP,
    coursePath: "/course",
  },
  round2: {
    dates: "26.7 + 2.8",
    hours: "18:00–21:00 שעון ישראל",
    zoomLink: "https://us02web.zoom.us/j/87269000584?pwd=WmIURAVQAONHKboPHlekL0JoSuDmJz.1",
    greeting: "שלום כבוד הרב",
    workshopName: "קלוד קוד לרבנים",
    group: RABBIS_GROUP,
    coursePath: "/course",
  },
  round4: {
    dates: "שישי 9.10 + שישי 16.10",
    hours: "9:30–12:30 בבוקר",
    zoomLink: "https://us02web.zoom.us/j/85992619266",
    greeting: "שלום",
    workshopName: "Claude Code לחרדים",
    group: { name: "סדנת Claude Code לחרדים 🧠", link: "https://chat.whatsapp.com/HZtXYzt0bRg22cgSYOBYb7" },
    detailsPath: "/sadna/details",
    coursePath: "/sadna/course",
    sendEmail: true,
  },
};

function buildConfirmationEmail({
  cohort,
  firstName,
  password,
  detailsUrl,
}: {
  cohort: CohortDetails;
  firstName: string;
  password: string;
  detailsUrl: string | null;
}): string {
  const btn = "display:inline-block; padding:12px 26px; background:#412a62; color:#fff; border-radius:8px; text-decoration:none; font-weight:bold;";
  const courseUrl = `https://www.al-automat.co.il${cohort.coursePath}`;
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.7; max-width: 560px;">
      <h2 style="margin:0 0 8px; color:#412a62;">${cohort.workshopName}</h2>
      <p>${cohort.greeting} ${firstName} 🙏</p>
      <p><strong>ההרשמה שלך התקבלה בהצלחה!</strong></p>
      <p>📅 <strong>${cohort.dates}</strong><br />🕘 ${cohort.hours} · בזום</p>
      <p><a href="${cohort.zoomLink}" style="${btn}">קישור הזום (לשני המפגשים)</a></p>
      <hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />
      <p><strong>🔑 אתר ההקלטות של הסדנה</strong><br />
      אחרי כל מפגש ההקלטה עולה לאתר. הכניסה רק עם הסיסמה האישית שלך (עד 2 מכשירים):</p>
      <p style="font-size:28px; font-weight:bold; letter-spacing:4px; margin:6px 0;">${password}</p>
      <p><a href="${courseUrl}" style="${btn}">כניסה לאתר ההקלטות</a></p>
      ${
        cohort.group
          ? `<hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />
      <p><strong>💬 קבוצת המשתתפים בוואטסאפ</strong> — עדכונים, שאלות ובוט שעונה מיד:</p>
      <p><a href="${cohort.group.link}" style="${btn}">הצטרפות לקבוצה</a></p>`
          : ""
      }
      ${
        detailsUrl
          ? `<hr style="border:none; border-top:1px solid #ddd; margin:20px 0;" />
      <p>📝 עוד לא מילאת את השאלות הקצרות? הן עוזרות לנו להתאים את הסדנה לעבודה שלך:<br />
      <a href="${detailsUrl}">למילוי השאלות</a></p>`
          : ""
      }
      <p style="margin-top:24px;">נתראה בזום!<br />יצחק ווחנון · על אוטומט</p>
    </div>
  `;
}

function generateCoursePassword(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function finalizeRegistrationPayment(registration: Registration) {
  const supabase = getRabanimSupabase();

  await supabase
    .from("rabanim_registrations")
    .update({ payment_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", registration.id);

  const password = generateCoursePassword();
  await supabase.from("rabanim_course_access").insert({
    registration_id: registration.id,
    password,
  });

  const cohort = COHORT_DETAILS[registration.cohort ?? "round1"] ?? COHORT_DETAILS.round1;

  const message = `${cohort.greeting} ${registration.first_name} ${registration.last_name} 🙏

ההרשמה שלך לסדנת *"${cohort.workshopName}"* התקבלה בהצלחה!

📅 שני מפגשים: ${cohort.dates}
🕕 ${cohort.hours}
🔗 לינק זום (לשני המפגשים):
${cohort.zoomLink}

${cohort.detailsPath ? `📝 עוד כמה שאלות קצרות כדי שנתאים לך את הסדנה:\nhttps://www.al-automat.co.il${cohort.detailsPath}?rid=${registration.id}&sig=${signRegistrationId(registration.id)}\n\n` : ""}✅ גישה להקלטות: https://www.al-automat.co.il${cohort.coursePath}
🔑 סיסמת הכניסה שלך: ${password}
(הסיסמה אישית — עד 2 מכשירים)

לפני המפגש הראשון נשלח לך רשימת הכנה קצרה.
שאלות? תכתוב כאן.

נתראה בזום!`;

  try {
    await sendWhatsApp(registration.phone, message);
  } catch (err) {
    console.error("finalizeRegistrationPayment: WhatsApp send failed", err);
  }

  if (cohort.sendEmail && registration.email) {
    const detailsUrl = cohort.detailsPath
      ? `https://www.al-automat.co.il${cohort.detailsPath}?rid=${registration.id}&sig=${signRegistrationId(registration.id)}`
      : null;
    try {
      await sendMail(
        registration.email,
        `ההרשמה ל${cohort.workshopName} התקבלה — כל הפרטים והסיסמה`,
        buildConfirmationEmail({ cohort, firstName: registration.first_name, password, detailsUrl })
      );
    } catch (err) {
      console.error("finalizeRegistrationPayment: confirmation email failed", err);
    }
  }

  if (cohort.group) {
    try {
      await sendWhatsApp(
        registration.phone,
        `הצטרף לקבוצת *"${cohort.group.name}"* בוואטסאפ — שם נעדכן על הסדנה ונענה על שאלות:\n${cohort.group.link}`
      );
    } catch (err) {
      console.error("finalizeRegistrationPayment: group invite send failed", err);
    }
  }

  const ownerPhone = process.env.OWNER_NOTIFY_PHONE;
  if (ownerPhone) {
    const ownerMessage = `🎉 נרשם חדש שילם! (${registration.cohort ?? "round1"})

${registration.first_name} ${registration.last_name}
📞 ${registration.phone}
✉️ ${registration.email}
📍 ${registration.location ?? ""}`;
    try {
      await sendWhatsApp(ownerPhone, ownerMessage);
    } catch (err) {
      console.error("finalizeRegistrationPayment: owner notification failed", err);
    }
  }
}
