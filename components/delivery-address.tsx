"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";

type Address = { id: string; rotulo: string; endereco: string; padrao: boolean };

export function DeliveryAddress() {
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    fetch("/api/address", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setAddress(result?.address ?? null))
      .catch(() => setAddress(null));
  }, []);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] text-ink-soft">Entrega em:</p>
        <p className="max-w-[150px] truncate text-xs font-semibold text-ink">
          {address?.endereco ?? "Adicionar endereço"}
        </p>
      </div>
    </div>
  );
}
