"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, UserRound, UtensilsCrossed } from "lucide-react";

const items = [
  {
    label: "Restaurantes",
    href: "/restaurantes",
    icon: UtensilsCrossed,
  },
  {
    label: "Pedidos",
    href: "/pedidos",
    icon: ReceiptText,
  },
  {
    label: "Perfil",
    href: "/perfil",
    icon: UserRound,
  },
] as const;

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <>
      <div aria-hidden="true" className="h-[76px] shrink-0" />

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-border bg-bg/95 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      >
        <ul className="grid grid-cols-3">
          {items.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
                    isActive
                      ? "bg-red-tint text-red-dark"
                      : "text-ink-soft hover:bg-neutral-000 hover:text-ink"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
