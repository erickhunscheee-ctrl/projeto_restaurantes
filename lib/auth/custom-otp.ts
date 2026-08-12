import { createHash, createHmac, randomInt } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function hashCode(phone: string, code: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "otp-secret")
    .update(`${phone}:${code}`).digest("hex");
}

function authEmail(phone: string) {
  return `${createHash("sha256").update(phone).digest("hex").slice(0, 32)}@auth.marmita-ja.local`;
}

function authPassword(phone: string, code: string) {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "otp-secret")
    .update(`login:${phone}:${code}`).digest("hex");
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
}

export async function sendCustomOtp(phone: string, nome: string) {
  const supabase = adminClient();
  const code = String(randomInt(100000, 1000000));
  const { data: existing } = await supabase.from("phone_otp_challenges").select("enviado_em")
    .eq("telefone", phone).maybeSingle();
  if (existing?.enviado_em && Date.now() - new Date(existing.enviado_em).getTime() < 60_000) {
    throw new Error("Aguarde 60 segundos antes de solicitar outro código.");
  }

  const response = await fetch(process.env.WHATSAPP_API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key": process.env.WHATSAPP_API_KEY! },
    body: JSON.stringify({
      telefone_origem: (process.env.WHATSAPP_TELEFONE_ORIGEM ?? "5551999129161").replace(/\D/g, ""),
      telefone: phone.replace(/\D/g, ""), nome,
      mensagem: `Olá ${nome}, seu código de acesso ao Marmita Já é ${code}.`,
    }),
    signal: AbortSignal.timeout(4_000), cache: "no-store",
  });
  if (!response.ok) throw new Error("A API do WhatsApp recusou o envio.");

  const { error } = await supabase.from("phone_otp_challenges").upsert({
    telefone: phone, codigo_hash: hashCode(phone, code), nome,
    expira_em: new Date(Date.now() + 10 * 60_000).toISOString(), tentativas: 0,
    enviado_em: new Date().toISOString(),
  });
  if (error) throw new Error("Não foi possível registrar o código.");
}

export async function verifyCustomOtp(phone: string, code: string) {
  const supabase = adminClient();
  const { data: challenge } = await supabase.from("phone_otp_challenges").select("*")
    .eq("telefone", phone).maybeSingle();
  if (!challenge || new Date(challenge.expira_em).getTime() < Date.now()) {
    throw new Error("Código expirado ou inexistente.");
  }
  if (challenge.tentativas >= 5) throw new Error("Número máximo de tentativas atingido.");
  if (hashCode(phone, code) !== challenge.codigo_hash) {
    await supabase.from("phone_otp_challenges").update({ tentativas: challenge.tentativas + 1 })
      .eq("telefone", phone);
    throw new Error("Código inválido.");
  }

  // A credencial determinística permite repetir a confirmação por até 10 min
  // se a conexão cair depois que o usuário já foi criado.
  const email = authEmail(phone);
  const password = authPassword(phone, code);
  let user: { id: string; email?: string | null; phone?: string | null } | null = null;
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    user = data.users.find((item) => item.email === email || item.phone === phone) ?? null;
    if (user || data.users.length < 1000) break;
  }

  if (user) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email, email_confirm: true, password, phone, phone_confirm: true,
      user_metadata: { nome: challenge.nome },
    });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email, email_confirm: true, password, phone, phone_confirm: true,
      user_metadata: { nome: challenge.nome },
    });
    if (data.user) {
      user = data.user;
    } else if (error) {
      // Trata corrida ou queda logo após createUser.
      const { data: users, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (listError) throw listError;
      user = users.users.find((item) => item.email === email || item.phone === phone) ?? null;
      if (!user) throw error;
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password, phone, phone_confirm: true, user_metadata: { nome: challenge.nome },
      });
      if (updateError) throw updateError;
    }
  }

  if (!user) throw new Error("Não foi possível criar o usuário.");
  const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({ email, password });
  if (sessionError || !session.session) throw sessionError ?? new Error("Não foi possível iniciar a sessão.");

  // Não removemos imediatamente: permite repetir a requisição em caso de
  // perda de conexão. O desafio expira em 10 minutos.
  return { userId: user.id, session: session.session };
}
