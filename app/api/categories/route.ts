import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,nome,slug,image_url,ordem,ativo")
    .eq("ativo", true)
    .order("ordem");

  if (error) {
    return NextResponse.json(
      { error: "Não foi possível carregar as categorias." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { categories: data ?? [] },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
}
