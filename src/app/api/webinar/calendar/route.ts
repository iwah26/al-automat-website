import { NextResponse } from "next/server";

const JOIN_URL = "https://www.al-automat.co.il/api/webinar/join";

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function GET() {
  const description = escapeICS(
    `וובינר פתוח "קלוד קוד לרבנים". קישור הזום: ${JOIN_URL}`
  );

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Al Automat//Webinar//HE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:rabanim-webinar-21-7-2026@al-automat.co.il",
    "DTSTAMP:20260718T000000Z",
    "DTSTART:20260721T180000Z",
    "DTEND:20260721T190000Z",
    `SUMMARY:${escapeICS('וובינר פתוח - קלוד קוד לרבנים')}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${escapeICS(JOIN_URL)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICS("הוובינר מתחיל בעוד חצי שעה - " + JOIN_URL)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="webinar-rabanim.ics"',
    },
  });
}
