"use client";

import { use, useEffect, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const ETAPAS: { key: OrderStatus; titulo: string; descricao: string }[] = [
  { key: "recebido", titulo: "Pedido recebido", descricao: "O restaurante confirmou seu pedido" },
  { key: "preparando", titulo: "Preparando sua marmita", descricao: "Já está no fogo" },
  { key: "a_caminho", titulo: "A caminho", descricao: "Saiu para entrega" },
  { key: "entregue", titulo: "Entregue", descricao: "Bom apetite!" },
];

export default function PedidoPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.from("orders").select("*").eq("id", orderId).single().then(({ data }) => {
      if (data) setOrder(data as Order);
    });

    // Realtime: a linha do tempo atualiza sozinha quando o restaurante muda o status.
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setOrder(payload.new as Order)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (!order) {
    return <main className="flex flex-1 items-center justify-center text-sm text-ink-soft">Carregando...</main>;
  }

  const etapaAtualIndex = ETAPAS.findIndex((e) => e.key === order.status);

  return (
    <main className="flex flex-1 flex-col">
      <div className="bg-green px-5 pb-5.5 pt-6.5 text-center">
        <svg width={56} height={56} viewBox="0 0 56 56" className="mx-auto mb-2.5" aria-hidden="true">
          <circle cx="28" cy="28" r="25" fill="none" stroke="var(--color-bg)" strokeWidth="2" />
          <path d="M28 3 A25 25 0 0 1 28 53 Z" fill="var(--color-red)" opacity="0.85" />
          <line x1="28" y1="3" x2="28" y2="53" stroke="var(--color-bg)" strokeWidth="1.5" />
          <path d="M18 28 L25 35 L38 20" fill="none" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-[17px] font-medium text-bg">Pedido confirmado</p>
        {order.previsao_entrega && (
          <p className="mt-1 text-[13px] text-neutral-000/70">
            Chegará por volta das{" "}
            {new Date(order.previsao_entrega).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      <div className="flex items-baseline justify-between px-5 pt-4.5">
        <span className="text-xs font-medium uppercase tracking-wide text-red-dark">Status</span>
        <span className="rounded-full border border-primary-500 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
          pedido nº {order.id.slice(0, 8)}
        </span>
      </div>

      <div className="px-5 pt-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            {ETAPAS.map((etapa, i) => (
              <div key={etapa.key} className="flex flex-col items-center">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: i <= etapaAtualIndex ? "var(--color-red)" : "var(--color-bg)",
                    border: i <= etapaAtualIndex ? "none" : "1.5px solid var(--color-border-strong)",
                  }}
                />
                {i < ETAPAS.length - 1 && (
                  <div
                    className="h-[34px] w-[1.5px]"
                    style={{ background: i < etapaAtualIndex ? "var(--color-primary-500)" : "var(--color-border-strong)" }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex-1">
            {ETAPAS.map((etapa, i) => (
              <div key={etapa.key} className={i < ETAPAS.length - 1 ? "pb-5.5" : ""}>
                <p className={`text-[13px] font-medium ${i <= etapaAtualIndex ? "" : "text-ink-faint"}`}>
                  {etapa.titulo}
                  {i === etapaAtualIndex && <Check size={12} className="ml-1 inline text-green" />}
                </p>
                <p className={`mt-0.5 text-xs ${i <= etapaAtualIndex ? "text-ink-soft" : "text-ink-faint"}`}>
                  {etapa.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 pt-3">
        <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-green-tint text-[13px] font-medium text-green">
              R
            </div>
            <div>
              <p className="text-[13px] font-medium">Restaurante</p>
              <p className="mt-0.5 text-xs text-ink-soft">Pedido #{order.id.slice(0, 8)}</p>
            </div>
          </div>
          <MessageCircle size={19} className="text-red-dark" />
        </div>
      </div>

      <div className="px-5 pb-6 pt-4">
        <div className="flex justify-between border-t border-border pt-3">
          <span className="text-[13px] text-ink-soft">
            Total pago via {order.forma_pagamento === "pix" ? "Pix" : order.forma_pagamento}
          </span>
          <span className="text-sm font-medium text-red-dark">{formatBRL(order.total)}</span>
        </div>
      </div>
    </main>
  );
}
