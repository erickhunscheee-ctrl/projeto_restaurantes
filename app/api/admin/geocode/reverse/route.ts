import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-auth";
import { reverseGeocode } from "@/lib/geocoding";

export async function GET(request: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  const url = new URL(request.url);
  const result = await reverseGeocode(Number(url.searchParams.get("lat")), Number(url.searchParams.get("lon")));
  return NextResponse.json(result.body, { status: result.status });
}
