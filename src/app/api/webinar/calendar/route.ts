import { NextResponse } from "next/server";

const JOIN_URL = "https://www.al-automat.co.il/api/webinar/join";

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export async function GET() {
  const description = escapeICS(
    `קלוד קוד לחרדים: איך בונים מערכות ואפליקציות בלי לדעת קוד. קישור הזום: ${JOIN_URL}`
  );

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Al Automat//Webinar//HE",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:webinar-8-10-2026@al-automat.co.il",
    "DTSTAMP:20261007T000000Z",
    "DTSTART:20261008T180000Z",
    "DTEND:20261008T193000Z",
    `SUMMARY:${escapeICS('קלוד קוד לחרדים - וובינר חינם')}`,
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
      "Content-Disposition": 'attachment; filename="webinar-al-automat.ics"',
    },
  });
}
