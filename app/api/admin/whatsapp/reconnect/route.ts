import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-response";
import { object, requiredString } from "@/lib/contracts/validation";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { findWhatsAppEstablishment, reconnectWhatsAppSession } from "@/lib/services/whatsapp-session-service";
export async function POST(request: Request) { const admin = await requirePlatformAdmin(); if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { const body = object(await request.json()); const establishment = await findWhatsAppEstablishment(admin, requiredString(body.establishment_id, "o restaurante")); return proxyWhatsAppResponse(await reconnectWhatsAppSession(establishment)); } catch (error) { return apiError(error); } }
