"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, UtensilsCrossed } from "lucide-react";
import type { Establishment } from "@/lib/types";

type RestaurantListProps = {
  categorySlug?: string;
};

export function RestaurantList({ categorySlug }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (categorySlug) params.set("categoria", categorySlug);

    setLoading(true);
    setError(false);

    fetch(`/api/restaurants${params.size ? `?${params}` : ""}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar restaurantes");
        return response.json() as Promise<{ restaurants?: Establishment[] }>;
      })
      .then((result) => setRestaurants(result.restaurants ?? []))
      .catch((requestError) => {
        if (requestError instanceof Error && requestError.name !== "AbortError") {
          setRestaurants([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [categorySlug]);

  return (
    <>
      <div className="px-5 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-red-dark">
          {loading
            ? "Carregando restaurantes..."
            : `${restaurants.length} ${restaurants.length === 1 ? "restaurante" : "restaurantes"} perto de você`}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-6 pt-2.5">
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-20 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-ink-soft">
            Não foi possível carregar os restaurantes.
          </p>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-soft">
            Nenhum restaurante nesta categoria ainda.
          </p>
        )}

        {!loading && restaurants.map((restaurant) => {
          const fechado = restaurant.status === "fechado";
          return (
            <Link
              key={restaurant.id}
              href={fechado ? "#" : `/restaurantes/${restaurant.id}`}
              className={`flex items-center gap-3 rounded-2xl bg-neutral-000 py-2.5 pl-2.5 pr-3 ${fechado ? "pointer-events-none opacity-55" : ""}`}
            >
              <div
                className="relative z-10 -my-3 -ml-2 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-4 ring-white"
                style={{
                  background: restaurant.foto_url
                    ? `url(${restaurant.foto_url}) center/cover`
                    : `linear-gradient(135deg, ${restaurant.avatar_cor ?? "var(--color-primary-500)"}, var(--color-primary-800))`,
                }}
              >
                {!restaurant.foto_url && (
                  <UtensilsCrossed size={24} className="text-bg opacity-85" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="type-normal-12">{restaurant.nome}</p>
                <p className="mt-0.5 text-sm text-ink-soft">
                  {restaurant.tipo_cozinha} · {restaurant.distancia_km ?? "—"} km
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star size={13} className="fill-red text-red" />
                  <span className="text-sm font-medium">
                    {restaurant.nota_media.toFixed(1)}
                  </span>
                </div>
                <p className={`mt-0.5 text-xs ${fechado ? "text-ink-faint" : "text-green"}`}>
                  {fechado ? `Fecha às ${restaurant.horario_fechamento ?? "—"}` : "Aberto agora"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
