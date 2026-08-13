"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ReceiptText,
  UserRound,
  UtensilsCrossed,
} from "lucide-react";

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

const CIRCLE = 66; // diâmetro do lóbulo
const GAP = 60; // distância entre centros

export function BottomNavbar() {
  const pathname = usePathname();
  const trackWidth = items.length * GAP;

  return (
    <>
      <div aria-hidden="true" className="h-[100px] shrink-0" />

      {/* 
        Filtro "goo". IMPORTANTE: x/y/width/height ampliados
        pra dar margem suficiente ao blur (senão o SVG corta
        a mancha e ela sai do alinhamento com os ícones).
      */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter
            id="navbar-goo"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="8"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 22 -10
              "
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <nav
        aria-label="Navegação principal"
        className="
          fixed inset-x-0 bottom-0 z-50
          flex flex-col items-center
          px-4
          pb-[max(16px,env(safe-area-inset-bottom))]
        "
      >
        <div
          className="relative h-[66px] drop-shadow-[0_4px_5px_rgba(0,0,0,0.30)]"
          style={{ width: trackWidth }}
        >
          {/* CAMADA GOO (fundo) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{ filter: "url(#navbar-goo)" }}
          >
            {items.map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#101010]"
                style={{
                  left: i * GAP + GAP / 2,
                  top: "50%",
                  width: CIRCLE,
                  height: CIRCLE,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>

          {/* CAMADA DE ÍCONES (mesma referência: left = i*GAP + GAP/2, top: 50%) */}
          <div className="relative z-20 h-full w-full">
            {items.map(({ label, href, icon: Icon }, i) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    absolute flex h-[58px] w-[58px] items-center justify-center
                    rounded-full transition-colors duration-200
                    ${isActive
                      ? "bg-[#ff5a00] text-white"
                      : "bg-transparent text-[#a3a3a3] hover:text-white"
                    }
                  `}
                  style={{
                    left: i * GAP + GAP / 2,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-3 h-1 w-16 rounded-full bg-neutral-900" />
      </nav>
    </>
  );
}