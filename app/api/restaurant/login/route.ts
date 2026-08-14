import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const { data: access } = await supabase
    .from("restaurant_users")
    .select("establishment_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!access) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Este usuário não está vinculado a um restaurante." }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
