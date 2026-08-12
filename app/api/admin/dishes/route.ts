import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const establishmentId = new URL(request.url).searchParams.get("establishment_id");
  const query = admin.from("dishes").select("*, dish_options(*)").order("criado_em", { ascending: false });
  const { data, error } = establishmentId ? await query.eq("establishment_id", establishmentId) : await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ dishes: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const { data, error } = await admin.from("dishes").insert({
    establishment_id: body.establishment_id,
    nome: String(body.nome ?? "").trim(),
    preco_base: Number(body.preco_base),
    categoria: body.categoria || null,
    disponivel_hoje: body.disponivel_hoje !== false,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ dish: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const { id, ...changes } = body;
  const { data, error } = await admin.from("dishes").update(changes).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ dish: data });
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await request.json();
  const { error } = await admin.from("dishes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
