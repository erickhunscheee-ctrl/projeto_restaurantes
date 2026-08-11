import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";

export const runtime = "nodejs";

type SendSmsPayload = {
  user?: { id?: string; phone?: string; user_metadata?: { nome?: string } };
  sms?: { otp?: string };
};

function hookError(status: number, message: string) {
  return NextResponse.json({ error: { http_code: status, message } }, { status });
}

export async function POST(request: Request) {
  const hookSecret = process.env.SUPABASE_SEND_SMS_HOOK_SECRET;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;
  const originPhone = process.env.WHATSAPP_TELEFONE_ORIGEM ?? "5551999129161";

  if (!hookSecret || !apiUrl || !apiKey) {
    return hookError(500, "Integração do WhatsApp não configurada.");
  }

  const rawBody = await request.text();
  let payload: SendSmsPayload;
  try {
    payload = new Webhook(hookSecret).verify(rawBody, {
      "webhook-id": request.headers.get("webhook-id") ?? "",
      "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": request.headers.get("webhook-signature") ?? "",
    }) as SendSmsPayload;
  } catch {
    return hookError(401, "Assinatura do hook inválida.");
  }

  const otp = payload.sms?.otp;
  const destinationPhone = payload.user?.phone?.replace(/\D/g, "");
  if (!otp || !destinationPhone) {
    return hookError(400, "Telefone ou código ausente no evento.");
  }

  let name = payload.user?.user_metadata?.nome?.trim();
  if (!name && payload.user?.id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
    const { data: profile } = await admin.from("profiles").select("nome").eq("id", payload.user.id).maybeSingle();
    name = profile?.nome?.trim();
  }
  name ||= "cliente";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      body: JSON.stringify({
        telefone_origem: originPhone.replace(/\D/g, ""),
        telefone: destinationPhone,
        nome: name,
        mensagem: `Olá ${name}, seu código de acesso ao Marmita Já é ${otp}.`,
      }),
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    if (!response.ok) return hookError(502, "A API do WhatsApp recusou o envio.");
  } catch {
    return hookError(504, "A API do WhatsApp não respondeu a tempo.");
  }

  return new NextResponse(null, { status: 200 });
}
