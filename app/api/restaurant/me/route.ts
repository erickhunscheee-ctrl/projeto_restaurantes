import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";

export async function GET() {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Acesso de restaurante não encontrado." }, { status: 403 });
  return NextResponse.json({ establishment: context.establishment });
}
