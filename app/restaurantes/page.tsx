import { Search } from "lucide-react";
import { BottomNavbar } from "@/components/bottom-navbar";
import { DeliveryAddress } from "@/components/delivery-address";
import { RestaurantCategories } from "@/components/restaurant-categories";
import { RestaurantList } from "@/components/restaurant-list";

type PageProps = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function RestaurantesPage({ searchParams }: PageProps) {
  const { categoria } = await searchParams;

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
        <p className="type-normal-16 opacity-50">Qual seu</p>
        <p className="type-semibold-16">Rango</p>
        <p className="type-normal-16 opacity-50">Hoje?</p>
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

      <RestaurantCategories selectedSlug={categoria} />
      <RestaurantList categorySlug={categoria} />

      <BottomNavbar />
    </main>
  );
}
