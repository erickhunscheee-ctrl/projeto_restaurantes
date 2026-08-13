import { Grid2X2, Search, Star, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Category, Establishment } from "@/lib/types";
import { BottomNavbar } from "@/components/bottom-navbar";
import { DeliveryAddress } from "@/components/delivery-address";

type PageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function RestaurantesPage({ searchParams }: PageProps) {
  const { categoria } = await searchParams;
  const supabase = await createClient();

  const categoriesQuery = supabase
    .from("categories")
    .select("id,nome,slug,image_url,ordem,ativo")
    .eq("ativo", true)
    .order("ordem");

  const establishmentsQuery = categoria ? supabase
    .from("establishments")
    .select("*, establishment_categories!inner(categories!inner(slug))")
    .eq("establishment_categories.categories.slug", categoria)
    .order("nota_media", { ascending: false })
    : supabase
      .from("establishments")
      .select("*")
      .order("nota_media", { ascending: false });

  const [{ data: categories }, { data: establishments }] = await Promise.all([
    categoriesQuery,
    establishmentsQuery,
  ]);

  const categoryList = (categories ?? []) as Category[];
  const lista = (establishments ?? []) as Establishment[];

  return (
    <main className="flex flex-1 flex-col bg-neutral-050">
      <div className="flex items-center gap-3 px-5 py-4">
        <button aria-label="Entregas" className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-neutral-000">
          <img src="/icons/delivery.png" alt="" className="h-5 w-5 object-contain" />
        </button>
        <DeliveryAddress />
        <button aria-label="Notificações" className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-neutral-000">
          <img src="/icons/sino.png" alt="" className="h-4 w-4 object-contain" />
        </button>
        <button aria-label="Carrinho" className="flex h-10 w-10 items-center justify-center rounded-full border border-white bg-neutral-000">
          <img src="/icons/basket.png" alt="" className="h-5 w-5 object-contain" />
        </button>
      </div>

      <div className="flex gap-1 px-5 pt-3.5">
        <p className="opacity-50">Qual seu</p>
        <p className="font-bold">Rango</p>
        <p className="opacity-50">Hoje?</p>
      </div>

      <div className="flex gap-3 px-5 pt-3.5">
        <div className="flex flex-1 items-center gap-2 rounded-3xl border border-border bg-neutral-000 px-3.5 py-2.5">
          <Search size={18} className="text-ink-soft" />
          <span className="text-sm text-ink-faint">Buscar por nome ou tipo de comida</span>
        </div>
        <button aria-label="Filtrar" className="flex h-10 w-10 items-center justify-center">
          <img src="/icons/filtro.png" alt="" className="h-full w-full object-contain" />
        </button>
      </div>

      <section className="pt-5">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-base font-semibold text-neutral-900">Categorias</h2>
          {categoria && (
            <Link href="/restaurantes" className="text-xs font-medium text-ink-soft">
              Ver todas ›
            </Link>
          )}
        </div>
        <div className="mt-3 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/restaurantes"
            className={`flex shrink-0 items-center gap-2 rounded-2xl border px-2.5 py-2 pr-4 transition-colors ${!categoria
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-border bg-neutral-000 text-neutral-900"
              }`}
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${!categoria ? "bg-white/20" : "bg-neutral-050"}`}>
              <Grid2X2 size={18} />
            </span>
            <span className="whitespace-nowrap text-sm font-medium">Todos</span>
          </Link>

          {categoryList.map((category) => {
            const active = categoria === category.slug;
            return (
              <Link
                key={category.id}
                href={`/restaurantes?categoria=${category.slug}`}
                className={`flex shrink-0 items-center gap-2 rounded-2xl border px-2.5 py-2 pr-4 transition-colors ${active
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-border bg-neutral-000 text-neutral-900"
                  }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl ${active ? "bg-white/20" : "bg-neutral-050"}`}>
                  {category.image_url ? (
                    <img src={category.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UtensilsCrossed size={17} />
                  )}
                </span>
                <span className="whitespace-nowrap text-sm font-medium">{category.nome}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="px-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-red-dark">
          {lista.length} {lista.length === 1 ? "restaurante" : "restaurantes"} perto de você
        </p>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-6 pt-2.5">
        {lista.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-soft">
            Nenhum restaurante nesta categoria ainda.
          </p>
        )}

        {lista.map((restaurant) => {
          const fechado = restaurant.status === "fechado";
          return (
            <Link
              key={restaurant.id}
              href={fechado ? "#" : `/restaurantes/${restaurant.id}`}
              className={`flex items-center gap-3 rounded-2xl bg-neutral-000 p-2.5 ${fechado ? "pointer-events-none opacity-55" : ""}`}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                style={{
                  background: restaurant.foto_url
                    ? `url(${restaurant.foto_url}) center/cover`
                    : `linear-gradient(135deg, ${restaurant.avatar_cor ?? "var(--color-primary-500)"}, var(--color-primary-800))`,
                }}
              >
                {!restaurant.foto_url && <UtensilsCrossed size={20} className="text-bg opacity-85" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{restaurant.nome}</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {restaurant.tipo_cozinha} · {restaurant.distancia_km ?? "—"} km
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star size={12} className="fill-red text-red" />
                  <span className="text-xs font-medium">{restaurant.nota_media.toFixed(1)}</span>
                </div>
                <p className={`mt-0.5 text-[11px] ${fechado ? "text-ink-faint" : "text-green"}`}>
                  {fechado ? `Fecha às ${restaurant.horario_fechamento ?? "—"}` : "Aberto agora"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <BottomNavbar />
    </main>
  );
}
