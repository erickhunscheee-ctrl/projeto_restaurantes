import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { apiError } from "@/lib/api-response";
import { parseDishCreate, parseDishUpdate } from "@/lib/contracts/dish";
import { object, requiredString } from "@/lib/contracts/validation";
import { createDish, deleteDish, listDishes, updateDish } from "@/lib/services/dish-service";

export async function GET(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { return NextResponse.json({ dishes: await listDishes(admin, new URL(request.url).searchParams.get("establishment_id")) }); }
  catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { return NextResponse.json({ dish: await createDish(admin, parseDishCreate(await request.json())) }, { status: 201 }); }
  catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const { id, changes } = parseDishUpdate(await request.json()); return NextResponse.json({ dish: await updateDish(admin, id, changes) }); }
  catch (error) { return apiError(error); }
}

export async function DELETE(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  try { const id = requiredString(object(await request.json()).id, "o prato"); await deleteDish(admin, id); return NextResponse.json({ ok: true }); }
  catch (error) { return apiError(error); }
}
