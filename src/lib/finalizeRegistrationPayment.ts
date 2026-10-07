import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp, RABANIM_GROUP_INVITE_LINK } from "@/lib/greenApi";

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
  },
  round2: {
    dates: "26.7 + 2.8",
    hours: "18:00–21:00 שעון ישראל",
    zoomLink: "https://us02web.zoom.us/j/87269000584?pwd=WmIURAVQAONHKboPHlekL0JoSuDmJz.1",
    greeting: "שלום כבוד הרב",
    workshopName: "קלוד קוד לרבנים",
    group: RABBIS_GROUP,
  },
  round4: {
    dates: "שישי 9.10 + שישי 16.10",
    hours: "9:30–12:30 בבוקר",
    zoomLink: "https://us02web.zoom.us/j/85992619266",
    greeting: "שלום",
    workshopName: "AI כמו מקצוען — בונים מערכות ואפליקציות בלי קוד",
    group: null,
  },
};

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

✅ גישה להקלטות: https://www.al-automat.co.il/course
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
