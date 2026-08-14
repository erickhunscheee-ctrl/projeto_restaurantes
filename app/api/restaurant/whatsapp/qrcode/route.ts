import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { apiError } from "@/lib/api-response";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { getWhatsAppQrCode } from "@/lib/services/whatsapp-session-service";
export async function GET() { const context = await requireRestaurant(); if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { return proxyWhatsAppResponse(await getWhatsAppQrCode(context.establishment)); } catch (error) { return apiError(error); } }
