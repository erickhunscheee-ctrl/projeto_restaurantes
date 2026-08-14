import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, UtensilsCrossed } from "lucide-react";
import { requireRestaurant } from "@/lib/restaurant-auth";
import { RestaurantLogout } from "./restaurant-logout";

export default async function RestaurantLayout({ children }: { children: React.ReactNode }) {
  const context = await requireRestaurant();
  if (!context) redirect("/restaurante/login");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-050">
      <header className="flex items-center justify-between border-b border-border bg-neutral-000 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{context.establishment.nome}</p>
          <p className="text-[11px] text-ink-soft">Painel do restaurante</p>
        </div>
        <RestaurantLogout />
      </header>
      <nav className="flex gap-2 border-b border-border bg-neutral-000 px-5 py-3">
        <Link href="/restaurante/pratos" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary-700"><UtensilsCrossed size={15} /> Cardápio</Link>
        <Link href="/restaurante/whatsapp" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-primary-700"><MessageCircle size={15} /> WhatsApp</Link>
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
