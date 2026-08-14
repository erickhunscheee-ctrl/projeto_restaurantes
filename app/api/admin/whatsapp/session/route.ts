import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-response";
import { object, requiredString } from "@/lib/contracts/validation";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { createWhatsAppSession, findWhatsAppEstablishment, getWhatsAppSession, removeWhatsAppSession } from "@/lib/services/whatsapp-session-service";

export async function GET(request: Request) {
  const admin = await requirePlatformAdmin(); if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const establishment = await findWhatsAppEstablishment(admin, requiredString(new URL(request.url).searchParams.get("establishment_id"), "o restaurante")); const response = await getWhatsAppSession(establishment); return response ? proxyWhatsAppResponse(response) : NextResponse.json({ configured: false }); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  const admin = await requirePlatformAdmin(); if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const body = object(await request.json()); const establishment = await findWhatsAppEstablishment(admin, requiredString(body.establishment_id, "o restaurante")); return proxyWhatsAppResponse(await createWhatsAppSession(admin, establishment, body.telefone)); }
  catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin(); if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const body = object(await request.json()); const establishment = await findWhatsAppEstablishment(admin, requiredString(body.establishment_id, "o restaurante")); const response = await removeWhatsAppSession(admin, establishment); return response ? proxyWhatsAppResponse(response) : NextResponse.json({ configured: false }); }
  catch (error) { return apiError(error); }
}
