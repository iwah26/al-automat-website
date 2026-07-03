import { createHmac, timingSafeEqual } from "node:crypto";

export const COURSE_COOKIE = "rabanim_course_session";
export const DEVICE_COOKIE = "rabanim_device_id";

interface SessionPayload {
  registrationId: string;
  courseAccessId: string;
}

function secret(): string {
  const s = process.env.COURSE_SESSION_SECRET;
  if (!s) throw new Error("COURSE_SESSION_SECRET missing");
  return s;
}

export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
