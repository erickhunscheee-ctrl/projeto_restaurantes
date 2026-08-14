import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  const expectedUsername = process.env.ADMIN_USUARIO ?? "";
  const expectedPassword = process.env.ADMIN_SENHA ?? "";

  if (!expectedUsername || !expectedPassword || username !== expectedUsername || password !== expectedPassword) {
    return NextResponse.json({ error: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@auth.marmita-ja.local";
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: users, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) return NextResponse.json({ error: "Não foi possível acessar o administrador." }, { status: 500 });
  let user = users.users.find((item) => item.email === email);
  if (user) {
    const { error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { platform_admin: true } });
    if (error) return NextResponse.json({ error: "Não foi possível atualizar o administrador." }, { status: 500 });
  } else {
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { platform_admin: true } });
    if (error || !data.user) return NextResponse.json({ error: error?.message ?? "Não foi possível criar o administrador." }, { status: 500 });
    user = data.user;
  }

  const sessionClient = await createSessionClient();
  const { data: session, error: sessionError } = await sessionClient.auth.signInWithPassword({ email, password });
  if (sessionError || !session.session) return NextResponse.json({ error: "Não foi possível iniciar a sessão." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
