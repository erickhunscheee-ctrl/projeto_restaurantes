"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart";
import { formatBRL } from "@/lib/utils";

export function CartBar({ establishmentId }: { establishmentId: string }) {
  const { items, establishmentId: cartEstablishmentId, subtotal } = useCartStore();

  if (cartEstablishmentId !== establishmentId || items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md px-5 pb-5">
      <Link
        href="/checkout"
        className="flex items-center justify-between rounded-2xl bg-green px-4 py-3.5 text-bg"
      >
        <span className="text-sm font-medium">
          {items.length} {items.length === 1 ? "marmita" : "marmitas"} · {formatBRL(subtotal())}
        </span>
        <span className="flex items-center gap-1.5 text-sm font-medium">
          Ver sacola <ArrowRight size={15} />
        </span>
      </Link>
    </div>
  );
}
