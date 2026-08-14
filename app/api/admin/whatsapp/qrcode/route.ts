import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-response";
import { requiredString } from "@/lib/contracts/validation";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { findWhatsAppEstablishment, getWhatsAppQrCode } from "@/lib/services/whatsapp-session-service";
export async function GET(request: Request) { const admin = await requirePlatformAdmin(); if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { const establishment = await findWhatsAppEstablishment(admin, requiredString(new URL(request.url).searchParams.get("establishment_id"), "o restaurante")); return proxyWhatsAppResponse(await getWhatsAppQrCode(establishment)); } catch (error) { return apiError(error); } }
