import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const categoria = request.nextUrl.searchParams.get("categoria")?.trim();
  const supabase = await createClient();

  const query = categoria
    ? supabase
        .from("establishments")
        .select("*, establishment_categories!inner(categories!inner(slug))")
        .eq("establishment_categories.categories.slug", categoria)
        .order("nota_media", { ascending: false })
    : supabase
        .from("establishments")
        .select("*")
        .order("nota_media", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar os restaurantes." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { restaurants: data ?? [] },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
