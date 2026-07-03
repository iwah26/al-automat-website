import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { sendWhatsApp } from "@/lib/greenApi";

interface Registration {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  location: string | null;
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

  const message = `שלום כבוד הרב ${registration.first_name} ${registration.last_name} 🙏

ההרשמה שלך לסדנת *"קלוד קוד לרבנים"* התקבלה בהצלחה!

📅 שני מפגשים: 12.7 (כ״ז תמוז) + 19.7 (ה׳ אב)
🕕 18:00–21:00 שעון ישראל
🔗 לינק זום (לשני המפגשים):
https://us02web.zoom.us/j/81000618945?pwd=hCmFZOH5MbK3B4FwwKSmBpVTLyB1Um.1

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

  const ownerPhone = process.env.OWNER_NOTIFY_PHONE;
  if (ownerPhone) {
    const ownerMessage = `🎉 נרשם חדש שילם!

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
