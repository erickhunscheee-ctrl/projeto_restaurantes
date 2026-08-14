import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { apiError } from "@/lib/api-response";
import { parseDishOption } from "@/lib/contracts/dish";
import { object, requiredString } from "@/lib/contracts/validation";
import { createDishOption, deleteDishOption, updateDishOption } from "@/lib/services/dish-service";

export async function POST(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const input = parseDishOption(await request.json()); const dishId = requiredString(input.dishId, "o prato"); return NextResponse.json({ option: await createDishOption(context.supabase, dishId, input.data, context.establishment.id) }, { status: 201 }); }
  catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const input = parseDishOption(await request.json()); const id = requiredString(input.id, "o componente"); return NextResponse.json({ option: await updateDishOption(context.supabase, id, input.data, context.establishment.id) }); }
  catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const id = requiredString(object(await request.json()).id, "o componente"); await deleteDishOption(context.supabase, id, context.establishment.id); return NextResponse.json({ ok: true }); }
  catch (error) { return apiError(error); }
}
