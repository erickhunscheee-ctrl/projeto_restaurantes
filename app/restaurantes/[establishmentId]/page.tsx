import { ArrowLeft, Heart, Clock, ImageIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DishIcon } from "@/components/ui/dish-icon";
import { formatBRL } from "@/lib/utils";
import { AddDishButton } from "./add-dish-button";
import { CartBar } from "./cart-bar";
import type { Dish, Establishment } from "@/lib/types";

export default async function CardapioPage({
  params,
}: {
  params: Promise<{ establishmentId: string }>;
}) {
  const { establishmentId } = await params;
  const supabase = await createClient();

  const [{ data: establishment }, { data: dishes }] = await Promise.all([
    supabase.from("establishments").select("*").eq("id", establishmentId).single(),
    supabase
      .from("dishes")
      .select("*")
      .eq("establishment_id", establishmentId)
      .eq("disponivel_hoje", true),
  ]);

  const r = establishment as Establishment | null;
  const pratos = (dishes ?? []) as Dish[];

  if (!r) {
    return <main className="p-6 text-sm text-ink-soft">Restaurante não encontrado.</main>;
  }

  return (
    <main className="flex flex-1 flex-col">
      <div
        className="relative h-[150px]"
        style={{
          background: r.foto_url
            ? `url(${r.foto_url}) center/cover`
            : "linear-gradient(135deg, #C0392B, #7A2318)",
        }}
      >
        {!r.foto_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={34} className="text-bg opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <Link href="/restaurantes" className="rounded-full bg-black/25 p-1.5">
            <ArrowLeft size={19} className="text-bg" />
          </Link>
          <button className="rounded-full bg-black/25 p-1.5">
            <Heart size={19} className="text-bg" />
          </button>
        </div>
        <div className="absolute inset-x-5 bottom-3.5">
          <p className="text-lg font-medium text-bg">{r.nome}</p>
          <div className="mt-1 flex items-center gap-2.5 text-xs text-[#F0DED9]">
            <span>{r.tipo_cozinha} · {r.distancia_km ?? "—"} km</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 pt-3.5">
        <span className="flex items-center gap-1 rounded-full bg-green-tint px-3 py-1 text-[11px] font-medium text-green">
          <Clock size={12} /> {r.status === "aberto" ? "Aberto agora" : "Fechado"}
        </span>
        {r.horario_fechamento && (
          <span className="rounded-full border border-border bg-[#FBF8F1] px-3 py-1 text-[11px] font-medium text-ink-soft">
            Fecha às {r.horario_fechamento}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between px-5 pt-4.5">
        <span className="text-sm font-medium">Cardápio de hoje</span>
        <span className="rounded-full border border-[#E24B4A] px-2.5 py-0.5 text-[11px] font-medium text-red-dark">
          {new Date().toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pt-2.5 pb-28">
        {pratos.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-soft">
            Nenhum prato disponível hoje.
          </p>
        )}
        {pratos.map((prato, i) => (
          <div key={prato.id} className="flex items-center gap-3 rounded-2xl border border-border p-2.5">
            <DishIcon split={0.35 + (i % 3) * 0.2} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{prato.nome}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{r.distancia_km ?? "—"} km</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium text-red-dark">{formatBRL(prato.preco_base)}</p>
              <AddDishButton
                dish={prato}
                establishmentId={r.id}
                establishmentNome={r.nome}
              />
            </div>
          </div>
        ))}
      </div>

      <CartBar establishmentId={r.id} />
    </main>
  );
}
