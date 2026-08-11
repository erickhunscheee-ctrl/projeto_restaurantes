"use client";

import { ArrowLeft, MapPin, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DishIcon } from "@/components/ui/dish-icon";
import { useCartStore } from "@/lib/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/utils";
import Link from "next/link";

const TAXA_ENTREGA = 0;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, establishmentId, establishmentNome, subtotal, clear } = useCartStore();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [endereco, setEndereco] = useState<string | null>(null);

  const total = subtotal() + TAXA_ENTREGA;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: address } = await supabase
        .from("addresses")
        .select("endereco")
        .eq("user_id", data.user.id)
        .eq("padrao", true)
        .maybeSingle();
      setEndereco(address?.endereco ?? null);
    });
  }, []);

  async function confirmarPedido() {
    if (!establishmentId || items.length === 0) return;
    setEnviando(true);
    setErro(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }

    const { data: address } = await supabase
      .from("addresses")
      .select("endereco")
      .eq("user_id", userData.user.id)
      .eq("padrao", true)
      .maybeSingle();

    if (!address?.endereco) {
      setEnviando(false);
      router.push("/perfil/enderecos/novo");
      return;
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: userData.user.id,
        establishment_id: establishmentId,
        endereco_entrega: address.endereco,
        forma_pagamento: "pix",
        subtotal: subtotal(),
        taxa_entrega: TAXA_ENTREGA,
        total,
      })
      .select()
      .single();

    if (error || !order) {
      setEnviando(false);
      setErro(error?.message ?? "Não foi possível criar o pedido.");
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        dish_id: item.dish_id,
        quantidade: item.quantidade,
        opcoes_selecionadas: item.opcoes_selecionadas,
        observacoes: item.observacoes || null,
        preco_unitario: item.preco_unitario,
      }))
    );

    setEnviando(false);
    if (itemsError) {
      setErro(itemsError.message);
      return;
    }

    clear();
    router.push(`/pedidos/${order.id}`);
  }

  if (items.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm text-ink-soft">Sua sacola está vazia.</p>
        <button onClick={() => router.push("/restaurantes")} className="text-sm font-medium text-red-dark">
          Ver restaurantes
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button onClick={() => router.back()}><ArrowLeft size={19} /></button>
        <span className="text-base font-medium">Fechar pedido</span>
      </div>

      <div className="px-5 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-dark">Entrega</p>
        <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <MapPin size={18} className="text-green" />
            <div>
              <p className="max-w-[220px] truncate text-[13px] font-medium">{endereco ?? "Cadastre um endereço"}</p>
              <p className="mt-0.5 text-xs text-ink-soft">Chegue em ~30 min</p>
            </div>
          </div>
          <Link href="/perfil" className="text-xs font-medium text-red-dark">trocar</Link>
        </div>
      </div>

      <div className="px-5 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-dark">
          Seu pedido · {establishmentNome}
        </p>
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 py-2 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <DishIcon size={36} split={0.35 + (i % 3) * 0.2} />
            <div className="flex-1">
              <p className="text-[13px] font-medium">{item.dish_nome}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{item.quantidade}x</p>
            </div>
            <span className="text-[13px] font-medium">
              {formatBRL(item.preco_unitario * item.quantidade)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 pt-3.5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-red-dark">Pagamento</p>
        <div className="flex items-center justify-between rounded-xl border border-border px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <QrCode size={18} className="text-green" />
            <span className="text-[13px] font-medium">Pix</span>
          </div>
          <span className="text-xs font-medium text-red-dark">trocar</span>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex flex-col gap-1.5 border-t border-border pt-3">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatBRL(subtotal())}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-ink-soft">Entrega</span>
            <span className="font-medium text-green">
              {TAXA_ENTREGA === 0 ? "Grátis" : formatBRL(TAXA_ENTREGA)}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-medium">
            <span>Total</span>
            <span className="text-red-dark">{formatBRL(total)}</span>
          </div>
        </div>
      </div>

      {erro && <p className="px-5 pt-3 text-xs text-red-dark">{erro}</p>}

      <div className="mt-auto px-5 pb-6 pt-4.5">
        <Button onClick={confirmarPedido} disabled={enviando}>
          {enviando ? "Confirmando..." : `Confirmar pedido · ${formatBRL(total)}`}
        </Button>
      </div>
    </main>
  );
}
