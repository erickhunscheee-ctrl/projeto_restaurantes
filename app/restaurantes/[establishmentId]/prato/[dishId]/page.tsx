"use client";

import { use, useEffect, useState } from "react";
import type { Dish, DishOption, Establishment } from "@/lib/types";
import { DishCustomizer } from "./dish-customizer";

type DishResponse = {
  dish: Dish;
  options: DishOption[];
  restaurant: Pick<Establishment, "nome"> | null;
};

export default function PratoPage({
  params,
}: {
  params: Promise<{ establishmentId: string; dishId: string }>;
}) {
  const { establishmentId, dishId } = use(params);
  const [data, setData] = useState<DishResponse | null>();

  useEffect(() => {
    let active = true;
    fetch(`/api/restaurants/${establishmentId}/dishes/${dishId}`, { cache: "no-store" })
      .then(async (response) => response.ok ? response.json() : null)
      .then((result) => { if (active) setData(result); });
    return () => { active = false; };
  }, [dishId, establishmentId]);

  if (data === undefined) {
    return <main className="flex flex-1 items-center justify-center text-sm text-ink-soft">Carregando...</main>;
  }

  if (!data) {
    return <main className="p-6 text-sm text-ink-soft">Prato não encontrado.</main>;
  }

  return (
    <DishCustomizer
      dish={data.dish}
      options={data.options}
      establishmentId={establishmentId}
      establishmentNome={data.restaurant?.nome ?? ""}
    />
  );
}
