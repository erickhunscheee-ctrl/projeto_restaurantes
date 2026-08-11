import { NextResponse } from "next/server";
import { normalizePhone, verifyCustomOtp } from "@/lib/auth/custom-otp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const telefone = normalizePhone(String(body.telefone ?? ""));
    const codigo = String(body.codigo ?? "").replace(/\D/g, "");
    if (codigo.length !== 6) return NextResponse.json({ error: "Informe o código de 6 dígitos." }, { status: 400 });
    const result = await verifyCustomOtp(telefone, codigo);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível validar o código." }, { status: 400 });
  }
}
