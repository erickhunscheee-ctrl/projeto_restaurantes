import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { data, error } = await admin.from("establishments").select("*").order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurants: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const { data: { user } } = await (await import("@/lib/supabase/server")).createClient().then((client) => client.auth.getUser());
  const { data, error } = await admin.from("establishments").insert({
    owner_id: body.owner_id ?? user?.id,
    nome: String(body.nome ?? "").trim(),
    tipo_cozinha: body.tipo_cozinha ?? "caseira",
    status: body.status ?? "aberto",
    horario_abertura: body.horario_abertura || null,
    horario_fechamento: body.horario_fechamento || null,
    foto_url: body.foto_url || null,
    telefone: body.telefone || null,
    cep: body.cep || null,
    endereco: body.endereco || null,
    numero: body.numero || null,
    complemento: body.complemento || null,
    bairro: body.bairro || null,
    cidade: body.cidade || null,
    estado: body.estado || null,
    latitude: body.latitude || null,
    longitude: body.longitude || null,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ restaurant: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const { id, ...changes } = body;
  delete changes.owner_id;
  const { data, error } = await admin.from("establishments").update(changes).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ restaurant: data });
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await request.json();
  const { error } = await admin.from("establishments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
