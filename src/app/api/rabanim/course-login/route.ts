import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { signSession, COURSE_COOKIE, DEVICE_COOKIE } from "@/lib/courseSession";

const YEAR = 60 * 60 * 24 * 365;

export async function POST(req: NextRequest) {
  const { password } = await req.json();
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
  res.cookies.set(COURSE_COOKIE, token, {
    maxAge: YEAR,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/course",
  });
  return res;
}
