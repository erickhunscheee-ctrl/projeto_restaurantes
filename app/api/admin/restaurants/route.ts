import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { data, error } = await admin
    .from("establishments")
    .select("*, establishment_categories(category_id)")
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ restaurants: data ?? [] });
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const categoryIds = Array.isArray(body.category_ids) ? body.category_ids : [];
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

  if (categoryIds.length > 0) {
    const { error: categoriesError } = await admin.from("establishment_categories").insert(
      categoryIds.map((categoryId: string) => ({
        establishment_id: data.id,
        category_id: categoryId,
      })),
    );
    if (categoriesError) {
      return NextResponse.json({ error: categoriesError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ restaurant: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const body = await request.json();
  const { id, ...changes } = body;
  const categoryIds = Array.isArray(changes.category_ids) ? changes.category_ids : null;
  delete changes.owner_id;
  delete changes.category_ids;

  let restaurant = null;
  if (Object.keys(changes).length > 0) {
    const { data, error } = await admin
      .from("establishments")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    restaurant = data;
  }

  if (categoryIds) {
    const { error: deleteError } = await admin
      .from("establishment_categories")
      .delete()
      .eq("establishment_id", id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

    if (categoryIds.length > 0) {
      const { error: insertError } = await admin.from("establishment_categories").insert(
        categoryIds.map((categoryId: string) => ({
          establishment_id: id,
          category_id: categoryId,
        })),
      );
      if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ restaurant });
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const { id } = await request.json();
  const { error } = await admin.from("establishments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
