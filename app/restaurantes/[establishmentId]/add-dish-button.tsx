"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Dish } from "@/lib/types";

export function AddDishButton({
  dish,
  establishmentId,
}: {
  dish: Dish;
  establishmentId: string;
  establishmentNome: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/restaurantes/${establishmentId}/prato/${dish.id}`)}
      className="mt-1 inline-flex items-center justify-center rounded-full bg-primary-700 p-1 text-bg"
      aria-label={`Adicionar ${dish.nome}`}
    >
      <Plus size={16} />
    </button>
  );
}
