import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { respondent_name } = body;

    if (!respondent_name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getRabanimSupabase();
    const { error } = await supabase.from("mashov_responses").insert([body]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
