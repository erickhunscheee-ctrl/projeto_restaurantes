import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const admin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    : supabase;
  const body = await request.json();
  const { data: existing } = await admin.from("establishments").select("id").eq("owner_id", user.id).maybeSingle();
  if (existing) return NextResponse.json(existing);
  const { data: establishment, error } = await admin.from("establishments").insert({ owner_id: user.id, nome: body.nome || "Meu restaurante", tipo_cozinha: "caseira", status: "aberto" }).select("id").single();
  if (error || !establishment) return NextResponse.json({ error: error?.message ?? "Falha ao criar estabelecimento" }, { status: 400 });
  const { error: walletError } = await admin.from("wallets").upsert(
    { establishment_id: establishment.id, saldo_disponivel: 0, recebido_hoje: 0, a_receber: 0 },
    { onConflict: "establishment_id", ignoreDuplicates: true }
  );
  if (walletError) return NextResponse.json({ error: walletError.message }, { status: 400 });
  return NextResponse.json(establishment, { status: 201 });
}
