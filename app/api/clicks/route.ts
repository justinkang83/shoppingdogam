import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { product_id } = await request.json().catch(() => ({ product_id: null }));
  if (!product_id) return NextResponse.json({ error: "product_id is required" }, { status: 400 });
  if (!supabase) return NextResponse.json({ ok: true, skipped: "supabase env missing" });

  const { error } = await supabase.from("click_logs").insert({
    product_id,
    clicked_at: new Date().toISOString(),
    referrer: request.headers.get("referer"),
    user_agent: request.headers.get("user-agent")
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
