import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";

export async function GET() {
  const supabase = getRabanimSupabase();
  const { data, error } = await supabase
    .from("coaching_homework_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { homework_id, text, parent_item_id } = body;

  if (!homework_id || !text) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getRabanimSupabase();
  const { data, error } = await supabase
    .from("coaching_homework_items")
    .insert([{ homework_id, text, parent_item_id: parent_item_id ?? null }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ item: data });
}
