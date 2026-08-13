"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Grid2X2, UtensilsCrossed } from "lucide-react";
import type { Category } from "@/lib/types";

type RestaurantCategoriesProps = {
  selectedSlug?: string;
};

export function RestaurantCategories({ selectedSlug }: RestaurantCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/categories", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar categorias");
        return response.json();
      })
      .then((result) => setCategories(result.categories ?? []))
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") setCategories([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <section className="pt-5">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-lg type-normal-14 text-neutral-900">Categorias</h2>
        {selectedSlug && (
          <Link
            href="/restaurantes"
            className="flex items-center gap-0.5 text-xs font-medium text-neutral-400"
          >
            Ver todas
            <span aria-hidden="true">›</span>
          </Link>
        )}
      </div>
      <div className="mt-3 flex gap-2.5 overflow-x-auto overflow-y-visible px-5 pt-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CategoryLink href="/restaurantes" label="Todos" active={!selectedSlug} />

        {categories.map((category) => (
          <CategoryLink
            key={category.id}
            href={`/restaurantes?categoria=${category.slug}`}
            label={category.nome}
            imageUrl={category.image_url}
            active={selectedSlug === category.slug}
          />
        ))}

        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-[52px] w-32 shrink-0 animate-pulse rounded-full bg-neutral-100"
            />
          ))}
      </div>
    </section>
  );
}

function CategoryLink({
  href,
  label,
  imageUrl,
  active,
}: {
  href: string;
  label: string;
  imageUrl?: string | null;
  active: boolean;
}) {
  return (
    <Link href={href} className="flex shrink-0 items-center">
      {/* IMAGEM */}
      <span
        className="
          relative z-10 h-12 w-12 shrink-0
          flex items-center justify-center
          overflow-hidden rounded-2xl
          bg-neutral-000
          ring-4 ring-white
        "
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-6 w-6 object-cover" />
        ) : label === "Todos" ? (
          <img
            src="/categorias/todos.png"
            alt=""
            className="h-6 w-6 object-contain"
          />
        ) : (
          <UtensilsCrossed size={16} className="m-auto" />
        )}
      </span>

      {/* PILL DE TEXTO */}
      <span
        className={`
          -ml-4 flex h-11 items-center whitespace-nowrap
          rounded-2xl border pl-7 pr-4
          type-normal-14 transition-colors
          ${active
            ? "border-primary-500 bg-primary-500 text-white"
            : "border-neutral-200 bg-white text-neutral-900"
          }
        `}
      >
        {label}
      </span>
    </Link>
  );
}