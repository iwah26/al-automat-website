import { NextRequest, NextResponse } from "next/server";
import { getRabanimSupabase } from "@/lib/rabanimSupabase";
import { MASHOV_HOMEWORK_NUMBER, buildMashovItems } from "@/lib/coachingHomeworkMashov";

export async function GET() {
  const supabase = getRabanimSupabase();
  const { data: homeworks, error: hwError } = await supabase
    .from("coaching_homeworks")
    .select("*")
    .order("number", { ascending: true });

  if (hwError) return NextResponse.json({ error: "DB error" }, { status: 500 });

  const { data: items, error: itemsError } = await supabase
    .from("coaching_homework_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (itemsError) return NextResponse.json({ error: "DB error" }, { status: 500 });

  let allItems = items ?? [];
  const mashovHw = (homeworks ?? []).find((h) => h.number === MASHOV_HOMEWORK_NUMBER);
  if (mashovHw) {
    const mashovItems = await buildMashovItems(supabase, mashovHw.id);
    allItems = allItems.filter((it) => it.homework_id !== mashovHw.id).concat(mashovItems);
  }

  return NextResponse.json({ homeworks: homeworks ?? [], items: allItems });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { number, title } = body;

  if (!number || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getRabanimSupabase();
  const { data, error } = await supabase
    .from("coaching_homeworks")
    .insert([{ number, title }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
  return NextResponse.json({ homework: data });
}
