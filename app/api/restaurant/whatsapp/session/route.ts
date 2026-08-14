import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { apiError } from "@/lib/api-response";
import { object } from "@/lib/contracts/validation";
import { proxyWhatsAppResponse } from "@/lib/whatsapp-api";
import { createWhatsAppSession, getWhatsAppSession, removeWhatsAppSession } from "@/lib/services/whatsapp-session-service";
export async function GET() { const context = await requireRestaurant(); if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { const response = await getWhatsAppSession(context.establishment); return response ? proxyWhatsAppResponse(response) : NextResponse.json({ configured: false }); } catch (error) { return apiError(error); } }
export async function POST(request: Request) { const context = await requireRestaurant(); if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { const body = object(await request.json()); return proxyWhatsAppResponse(await createWhatsAppSession(context.supabase, context.establishment, body.telefone)); } catch (error) { return apiError(error); } }
export async function DELETE() { const context = await requireRestaurant(); if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 }); try { const response = await removeWhatsAppSession(context.supabase, context.establishment); return response ? proxyWhatsAppResponse(response) : NextResponse.json({ configured: false }); } catch (error) { return apiError(error); } }
