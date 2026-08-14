import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const body = await request.json();
  const establishmentId = String(body.establishment_id ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!establishmentId || !email.includes("@") || password.length < 8) {
    return NextResponse.json({ error: "Informe e-mail válido e senha com pelo menos 8 caracteres." }, { status: 400 });
  }

  const { data: establishment, error: establishmentError } = await admin
    .from("establishments")
    .select("id,nome,telefone")
    .eq("id", establishmentId)
    .single();
  if (establishmentError) return NextResponse.json({ error: "Restaurante não encontrado." }, { status: 404 });

  let owner = null;
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    owner = data.users.find((user) => user.email?.toLowerCase() === email) ?? null;
    if (owner || data.users.length < 1000) break;
  }

  if (owner) {
    const { data: anotherRestaurant } = await admin
      .from("establishments")
      .select("id")
      .eq("owner_id", owner.id)
      .neq("id", establishmentId)
      .limit(1)
      .maybeSingle();
    if (anotherRestaurant) {
      return NextResponse.json({ error: "Este usuário já está vinculado a outro restaurante." }, { status: 409 });
    }
    const { error } = await admin.auth.admin.updateUserById(owner.id, {
      email,
      password,
      email_confirm: true,
      user_metadata: { ...owner.user_metadata, role: "restaurante", nome: establishment.nome },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "restaurante", nome: establishment.nome },
    });
    if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Não foi possível criar o acesso." }, { status: 400 });
    owner = data.user;
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: owner.id,
    nome: establishment.nome,
    telefone: establishment.telefone,
    role: "restaurante",
  });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  const { error: linkError } = await admin
    .from("establishments")
    .update({ owner_id: owner.id })
    .eq("id", establishmentId);
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 400 });

  return NextResponse.json({ ok: true, email });
}
