import { NextResponse } from "next/server";
import { normalizePhone, sendCustomOtp } from "@/lib/auth/custom-otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = String(body.nome ?? "").trim();
    const telefone = normalizePhone(String(body.telefone ?? ""));
    if (!nome || telefone.replace(/\D/g, "").length < 12) {
      return NextResponse.json({ error: "Nome e telefone válidos são obrigatórios." }, { status: 400 });
    }
    await sendCustomOtp(telefone, nome);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível enviar o código." }, { status: 502 });
  }
}
