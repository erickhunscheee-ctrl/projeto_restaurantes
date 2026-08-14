import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-response";
import { parseRestaurantCreate, parseRestaurantUpdate } from "@/lib/contracts/restaurant";
import { object, requiredString } from "@/lib/contracts/validation";
import { createClient } from "@/lib/supabase/server";
import { createRestaurant, deleteRestaurant, listRestaurants, updateRestaurant } from "@/lib/services/restaurant-service";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { return NextResponse.json({ restaurants: await listRestaurants(admin) }); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try {
    const { data: { user } } = await (await createClient()).auth.getUser();
    const { restaurant, categoryIds } = parseRestaurantCreate(await request.json(), user?.id);
    if (!restaurant.owner_id) throw new Error("Não foi possível definir o responsável inicial.");
    return NextResponse.json({ restaurant: await createRestaurant(admin, restaurant, categoryIds) }, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const { id, changes, categoryIds } = parseRestaurantUpdate(await request.json()); return NextResponse.json({ restaurant: await updateRestaurant(admin, id, changes, categoryIds) }); }
  catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const id = requiredString(object(await request.json()).id, "o restaurante"); await deleteRestaurant(admin, id); return NextResponse.json({ ok: true }); }
  catch (error) { return apiError(error); }
}
