import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Usuário não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("addresses")
    .select("id, rotulo, endereco, padrao")
    .eq("user_id", user.id)
    .eq("padrao", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Não foi possível carregar o endereço." }, { status: 500 });
  }

  return NextResponse.json({ address: data ?? null });
}
