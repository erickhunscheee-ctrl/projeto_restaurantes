import { NextResponse } from "next/server";
import { requireUser } from "@/lib/user-auth";
import { apiError } from "@/lib/api-response";
import { object, requiredString } from "@/lib/contracts/validation";

export async function GET() {
  const context = await requireUser(); if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    const [{ data: profile }, { data: addresses }, { count }] = await Promise.all([
      context.supabase.from("profiles").select("id,nome,telefone,endereco_padrao,notificacoes_ativas,role").eq("id", context.user.id).maybeSingle(),
      context.supabase.from("addresses").select("*").eq("user_id", context.user.id).order("padrao", { ascending: false }).order("criado_em"),
      context.supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", context.user.id),
    ]);
    return NextResponse.json({ profile: profile ?? { id: context.user.id, nome: context.user.user_metadata?.nome ?? "Meu perfil", telefone: context.user.phone ?? null, notificacoes_ativas: true }, addresses: addresses ?? [], totalOrders: count ?? 0 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  const context = await requireUser(); if (!context) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  try {
    const body = object(await request.json()); const changes: Record<string, unknown> = {};
    if (body.nome !== undefined) changes.nome = requiredString(body.nome, "seu nome");
    if (body.telefone !== undefined) changes.telefone = String(body.telefone);
    if (body.notificacoes_ativas !== undefined) changes.notificacoes_ativas = Boolean(body.notificacoes_ativas);
    const { data, error } = await context.supabase.from("profiles").upsert({ id: context.user.id, nome: changes.nome ?? context.user.user_metadata?.nome ?? "Usuário", telefone: changes.telefone ?? context.user.phone ?? null, ...changes }).select().single();
    if (error) throw new Error(error.message); return NextResponse.json({ profile: data });
  } catch (error) { return apiError(error); }
}
