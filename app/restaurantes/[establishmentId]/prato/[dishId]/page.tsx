import { createClient } from "@/lib/supabase/server";
import type { Dish, DishOption, Establishment } from "@/lib/types";
import { DishCustomizer } from "./dish-customizer";

export default async function PratoPage({
  params,
}: {
  params: Promise<{ establishmentId: string; dishId: string }>;
}) {
  const { establishmentId, dishId } = await params;
  const supabase = await createClient();

  const [{ data: dish }, { data: options }, { data: establishment }] = await Promise.all([
    supabase.from("dishes").select("*").eq("id", dishId).single(),
    supabase.from("dish_options").select("*").eq("dish_id", dishId),
    supabase.from("establishments").select("nome").eq("id", establishmentId).single(),
  ]);

  if (!dish) {
    return <main className="p-6 text-sm text-ink-soft">Prato não encontrado.</main>;
  }

  return (
    <DishCustomizer
      dish={dish as Dish}
      options={(options ?? []) as DishOption[]}
      establishmentId={establishmentId}
      establishmentNome={(establishment as Establishment | null)?.nome ?? ""}
    />
  );
}
