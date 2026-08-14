import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { apiError } from "@/lib/api-response";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { reconnectWhatsAppSession } from "@/lib/services/whatsapp-session-service";
export async function POST() { const context = await requireRestaurant(); if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { return proxyWhatsAppResponse(await reconnectWhatsAppSession(context.establishment)); } catch (error) { return apiError(error); } }
