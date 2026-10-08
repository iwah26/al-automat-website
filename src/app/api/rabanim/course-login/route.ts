import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { signSession, COURSE_COOKIE, COURSE_COOKIE_ROUND4, DEVICE_COOKIE } from "@/lib/courseSession";

const YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  // cohort: "round4" = אתר ההקלטות של מחזור ד׳. בלי = אתר הרבנים הישן.
  const { password, cohort } = await req.json();
  const wantsRound4 = cohort === "round4";
  if (!password) {
    return NextResponse.json({ error: "נא להזין סיסמה" }, { status: 400 });
  }

  const supabase = getRabanimSupabase();
  const { data: access, error } = await supabase
    .from("rabanim_course_access")
    .select("*")
    .eq("password", password)
    .single();

  if (error || !access) {
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  // כל סיסמה פותחת רק את אתר המחזור שלה
  const { data: reg } = await supabase
    .from("rabanim_registrations")
    .select("cohort")
    .eq("id", access.registration_id)
    .maybeSingle();
  const isRound4 = reg?.cohort === "round4";
  if (isRound4 !== wantsRound4) {
    return NextResponse.json({ error: "הסיסמה לא שייכת לאתר הזה" }, { status: 401 });
  }

  const deviceId = req.cookies.get(DEVICE_COOKIE)?.value ?? randomUUID();
  const deviceIds: string[] = access.device_ids ?? [];
  const alreadyKnown = deviceIds.includes(deviceId);

  if (!alreadyKnown) {
    if (deviceIds.length >= access.max_devices) {
      return NextResponse.json(
        { error: `הסיסמה כבר בשימוש במקסימום מכשירים (${access.max_devices})` },
        { status: 403 }
      );
    }
    await supabase
      .from("rabanim_course_access")
      .update({ device_ids: [...deviceIds, deviceId] })
      .eq("id", access.id);
  }

  const token = signSession({
    registrationId: access.registration_id,
    courseAccessId: access.id,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEVICE_COOKIE, deviceId, {
    maxAge: YEAR,
    httpOnly: false,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  res.cookies.set(wantsRound4 ? COURSE_COOKIE_ROUND4 : COURSE_COOKIE, token, {
    maxAge: YEAR,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: wantsRound4 ? "/sadna/course" : "/course",
  });
  return res;
}
