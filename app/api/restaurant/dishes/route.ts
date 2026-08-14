import { NextResponse } from "next/server";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { apiError } from "@/lib/api-response";
import { parseDishCreate, parseDishUpdate } from "@/lib/contracts/dish";
import { object, requiredString } from "@/lib/contracts/validation";
import { createDish, deleteDish, listDishes, updateDish } from "@/lib/services/dish-service";

export async function GET() {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { return NextResponse.json({ dishes: await listDishes(context.supabase, context.establishment.id) }); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { return NextResponse.json({ dish: await createDish(context.supabase, parseDishCreate(await request.json(), context.establishment.id)) }, { status: 201 }); }
  catch (error) { return apiError(error); }
}
export async function PATCH(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const { id, changes } = parseDishUpdate(await request.json()); return NextResponse.json({ dish: await updateDish(context.supabase, id, changes, context.establishment.id) }); }
  catch (error) { return apiError(error); }
}
export async function DELETE(request: Request) {
  const context = await requireRestaurant();
  if (!context) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const id = requiredString(object(await request.json()).id, "o prato"); await deleteDish(context.supabase, id, context.establishment.id); return NextResponse.json({ ok: true }); }
  catch (error) { return apiError(error); }
}
