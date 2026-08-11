import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DishIcon } from "@/components/ui/dish-icon";
import { formatBRL } from "@/lib/utils";
import type { Dish, DishOption } from "@/lib/types";

const CHIP_STYLE: Record<DishOption["grupo"], string> = {
  proteina: "bg-red-tint text-red-dark",
  acompanhamento: "bg-green-tint text-green",
  extra: "bg-[#F0EEE6] text-ink-soft",
};

export default async function PratosPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: establishment } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", userData.user?.id)
    .single();

  const { data: dishes } = establishment
    ? await supabase.from("dishes").select("*, dish_options(*)").eq("establishment_id", establishment.id)
    : { data: [] };

  const pratos = (dishes ?? []) as (Dish & { dish_options: DishOption[] })[];

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-red-dark">Pratos cadastrados</span>
        <Link href="/admin/pratos/novo" className="flex items-center gap-1 text-xs font-medium text-red">
          <Plus size={14} /> novo prato
        </Link>
      </div>

      <div className="flex flex-col gap-2.5 pb-6 pt-2.5">
        {pratos.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-soft">Nenhum prato cadastrado ainda.</p>
        )}

        {pratos.map((prato, i) => (
          <div
            key={prato.id}
            className={`rounded-2xl border border-border p-3 ${prato.disponivel_hoje ? "" : "opacity-55"}`}
          >
            <div className="flex items-center gap-3">
              <DishIcon size={44} split={0.35 + (i % 3) * 0.2} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{prato.nome}</p>
                <p className={`mt-0.5 text-xs ${prato.disponivel_hoje ? "font-medium text-red-dark" : "text-ink-soft"}`}>
                  {prato.disponivel_hoje ? formatBRL(prato.preco_base) : "Indisponível hoje"}
                </p>
              </div>
              <Link href={`/admin/pratos/${prato.id}/editar`}>
                <Pencil size={17} className="text-ink-soft" />
              </Link>
            </div>
            {prato.dish_options?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                {prato.dish_options.map((opt) => (
                  <span
                    key={opt.id}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${CHIP_STYLE[opt.grupo]}`}
                  >
                    {opt.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
