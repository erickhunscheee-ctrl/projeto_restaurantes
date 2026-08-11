"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart";
import { formatBRL } from "@/lib/utils";
import type { Dish, DishOption } from "@/lib/types";

const GRUPOS = [
  { key: "proteina" as const, label: "Proteína", shape: "circle", corSelecionada: "red" },
  { key: "acompanhamento" as const, label: "Acompanhamentos", shape: "square", corSelecionada: "green" },
  { key: "extra" as const, label: "Ponto extra", shape: "square", corSelecionada: "green" },
];

export function DishCustomizer({
  dish,
  options,
  establishmentId,
  establishmentNome,
}: {
  dish: Dish;
  options: DishOption[];
  establishmentId: string;
  establishmentNome: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [observacoes, setObservacoes] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [conflito, setConflito] = useState(false);

  function toggle(option: DishOption, grupoOptions: DishOption[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const jaSelecionado = next.has(option.id);

      if (jaSelecionado) {
        next.delete(option.id);
        return next;
      }

      const selecionadosDoGrupo = grupoOptions.filter((o) => next.has(o.id));
      // Seleção única (ex: proteína com max 1) troca a escolha anterior.
      if (option.selecao_max === 1 && selecionadosDoGrupo.length >= 1) {
        selecionadosDoGrupo.forEach((o) => next.delete(o.id));
      } else if (selecionadosDoGrupo.length >= option.selecao_max) {
        return next; // limite do grupo atingido
      }
      next.add(option.id);
      return next;
    });
  }

  const precoExtras = useMemo(
    () => options.filter((o) => selected.has(o.id)).reduce((s, o) => s + o.preco_adicional, 0),
    [options, selected]
  );
  const precoTotal = (dish.preco_base + precoExtras) * quantidade;

  function handleAdicionar() {
    const opcoesSelecionadas = options
      .filter((o) => selected.has(o.id))
      .map((o) => ({ dish_option_id: o.id, nome: o.nome, preco_adicional: o.preco_adicional }));

    const ok = addItem(
      {
        dish_id: dish.id,
        dish_nome: dish.nome,
        establishment_id: establishmentId,
        quantidade,
        opcoes_selecionadas: opcoesSelecionadas,
        observacoes,
        preco_unitario: dish.preco_base,
      },
      establishmentNome
    );

    if (!ok) {
      setConflito(true);
      return;
    }
    router.push(`/restaurantes/${establishmentId}`);
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <button onClick={() => router.back()}><ArrowLeft size={19} /></button>
        <div>
          <span className="block text-[15px] font-medium">Monte seu prato</span>
          <span className="text-xs text-ink-soft">{establishmentNome}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        {GRUPOS.map((grupo) => {
          const grupoOptions = options.filter((o) => o.grupo === grupo.key);
          if (grupoOptions.length === 0) return null;
          const primeiraOpcao = grupoOptions[0];

          return (
            <div key={grupo.key}>
              <div className="flex items-center justify-between px-5 pt-4.5">
                <span className="text-xs font-medium uppercase tracking-wide text-red-dark">{grupo.label}</span>
                <span className="text-[11px] text-ink-faint">
                  {primeiraOpcao.selecao_max === 1 ? "escolha 1" : `escolha até ${primeiraOpcao.selecao_max}`}
                  {primeiraOpcao.selecao_min === 0 && primeiraOpcao.grupo === "extra" ? " · opcional" : ""}
                </span>
              </div>
              <div className="flex flex-col gap-2 px-5 pt-2">
                {grupoOptions.map((option) => {
                  const isSelected = selected.has(option.id);
                  const isCircle = grupo.shape === "circle";
                  const corAtiva = grupo.corSelecionada === "red" ? "var(--color-red)" : "var(--color-green)";
                  const bgAtivo = grupo.corSelecionada === "red" ? "var(--color-red-tint)" : "var(--color-green-tint)";

                  return (
                    <button
                      key={option.id}
                      onClick={() => toggle(option, grupoOptions)}
                      className="flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left"
                      style={{
                        borderColor: isSelected ? corAtiva : "var(--color-border)",
                        borderWidth: isSelected ? 1.5 : 0.5,
                        background: isSelected ? bgAtivo : "transparent",
                      }}
                    >
                      <span className={`text-sm ${isSelected ? "font-medium" : ""}`}>
                        {option.nome}
                        {option.preco_adicional > 0 && (
                          <span className="ml-1 text-xs text-ink-soft">
                            (+{formatBRL(option.preco_adicional)})
                          </span>
                        )}
                      </span>
                      <span
                        className={`flex h-[18px] w-[18px] items-center justify-center ${isCircle ? "rounded-full" : "rounded"}`}
                        style={{
                          background: isSelected ? corAtiva : "transparent",
                          border: isSelected ? "none" : "1.5px solid var(--color-border-strong)",
                        }}
                      >
                        {isSelected && <Check size={12} className="text-bg" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="px-5 pt-4.5">
          <span className="text-xs font-medium uppercase tracking-wide text-red-dark">Observações</span>
          <div className="mt-2 rounded-xl border border-border px-3.5 py-2.5">
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: sem cebola, pouco sal..."
              rows={2}
              className="w-full resize-none bg-transparent text-sm placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>
      </div>

      {conflito && (
        <div className="mx-5 mb-2 rounded-xl border border-[#E24B4A] bg-red-tint px-3.5 py-2.5 text-xs text-red-dark">
          Sua sacola já tem itens de outro restaurante. Esvazie a sacola atual antes de adicionar este prato.
        </div>
      )}

      <div className="border-t border-border px-5 pb-5 pt-3.5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border-strong"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium">{quantidade}</span>
            <button
              onClick={() => setQuantidade((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-bg"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-[15px] font-medium text-red-dark">{formatBRL(precoTotal)}</span>
        </div>
        <Button onClick={handleAdicionar}>Adicionar à sacola</Button>
      </div>
    </main>
  );
}
