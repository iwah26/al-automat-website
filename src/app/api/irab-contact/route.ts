import { sendMail } from "@/lib/mailer";

const TO = "director@irabadvice.com";

export async function POST(request: Request) {
  const { name, phone, email, message } = await request.json();

  if (!name || !phone || !email) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  await sendMail(
    TO,
    `פנייה חדשה מהאתר - ${name}`,
    `
      <div dir="rtl" style="font-family: Arial, sans-serif;">
        <h2>פנייה חדשה מ-al-automat.co.il/irab</h2>
        <p><strong>שם:</strong> ${name}</p>
        <p><strong>טלפון:</strong> ${phone}</p>
        <p><strong>אימייל:</strong> ${email}</p>
        <p><strong>הודעה:</strong></p>
        <p>${(message || "").replace(/\n/g, "<br>")}</p>
      </div>
    `
  );

  return Response.json({ ok: true });
}
