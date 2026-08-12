import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reverseGeocode } from "@/lib/geocoding";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  const url = new URL(request.url);
  const result = await reverseGeocode(Number(url.searchParams.get("lat")), Number(url.searchParams.get("lon")));
  return NextResponse.json(result.body, { status: result.status });
}
