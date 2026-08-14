"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DishOption = {
  id: string;
  grupo: "proteina" | "acompanhamento" | "extra";
  nome: string;
  preco_adicional: number;
  selecao_min: number;
  selecao_max: number;
  ordem: number;
};

type Dish = {
  id: string;
  nome: string;
  preco_base: number;
  categoria: string | null;
  disponivel_hoje: boolean;
  dish_options: DishOption[];
};

const inputClass = "w-full rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-900 outline-none";

export default function RestaurantDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishCategory, setDishCategory] = useState("");
  const [optionId, setOptionId] = useState<string | null>(null);
  const [optionName, setOptionName] = useState("");
  const [optionGroup, setOptionGroup] = useState<DishOption["grupo"]>("acompanhamento");
  const [optionPrice, setOptionPrice] = useState("0");
  const [optionMin, setOptionMin] = useState("0");
  const [optionMax, setOptionMax] = useState("1");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => dishes.find((dish) => dish.id === selectedId), [dishes, selectedId]);

  const loadDishes = useCallback(async () => {
    const response = await fetch("/api/restaurant/dishes", { cache: "no-store" });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return setError(result.error);
    setDishes(result.dishes);
    setSelectedId((current) => current || result.dishes[0]?.id || "");
  }, []);

  useEffect(() => { loadDishes(); }, [loadDishes]);
  useEffect(() => {
    if (!selected) return;
    setDishName(selected.nome);
    setDishPrice(String(selected.preco_base));
    setDishCategory(selected.categoria ?? "");
    resetOption();
  }, [selectedId, selected]);

  function resetOption() {
    setOptionId(null); setOptionName(""); setOptionGroup("acompanhamento");
    setOptionPrice("0"); setOptionMin("0"); setOptionMax("1");
  }

  async function createDish() {
    setError(null);
    const response = await fetch("/api/restaurant/dishes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: newName, preco_base: Number(newPrice), categoria: newCategory }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setNewName(""); setNewPrice(""); setNewCategory("");
    await loadDishes(); setSelectedId(result.dish.id);
  }

  async function saveDish() {
    if (!selected) return;
    const response = await fetch("/api/restaurant/dishes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, nome: dishName, preco_base: Number(dishPrice), categoria: dishCategory }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    await loadDishes();
  }

  async function toggleAvailability(dish: Dish) {
    await fetch("/api/restaurant/dishes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: dish.id, disponivel_hoje: !dish.disponivel_hoje }) });
    await loadDishes();
  }

  async function deleteDish(id: string) {
    const response = await fetch("/api/restaurant/dishes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setSelectedId(""); await loadDishes();
  }

  async function saveOption() {
    if (!selected || !optionName.trim()) return;
    const response = await fetch("/api/restaurant/dish-options", {
      method: optionId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: optionId, dish_id: selected.id, nome: optionName, grupo: optionGroup, preco_adicional: Number(optionPrice), selecao_min: Number(optionMin), selecao_max: Number(optionMax) }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    resetOption(); await loadDishes();
  }

  async function deleteOption(id: string) {
    const response = await fetch("/api/restaurant/dish-options", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    await loadDishes();
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 p-5">
      <section className="rounded-2xl border border-border bg-neutral-000 p-4">
        <h1 className="text-lg font-semibold text-neutral-900">Cardápio</h1>
        <p className="mt-1 text-xs text-ink-soft">Cadastre os pratos e os componentes escolhidos pelo cliente.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_130px_160px_auto]">
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Nome do prato" className={inputClass} />
          <input value={newPrice} onChange={(event) => setNewPrice(event.target.value)} type="number" min="0" step="0.01" placeholder="Preço" className={inputClass} />
          <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Categoria do cardápio" className={inputClass} />
          <Button className="w-full sm:w-auto" onClick={createDish} disabled={!newName.trim() || !newPrice}><Plus size={16} /> Adicionar</Button>
        </div>
        {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-border bg-neutral-000 p-3">
          <h2 className="px-1 pb-2 text-sm font-semibold">Pratos</h2>
          {loading && <p className="p-3 text-xs text-ink-soft">Carregando...</p>}
          <div className="space-y-2">
            {dishes.map((dish) => <button key={dish.id} onClick={() => setSelectedId(dish.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === dish.id ? "border-primary-500 bg-primary-50" : "border-border"}`}>
              <div className="flex justify-between gap-2"><span className="truncate text-sm font-semibold">{dish.nome}</span><span className="text-xs text-primary-700">R$ {Number(dish.preco_base).toFixed(2)}</span></div>
              <p className="mt-1 text-[11px] text-ink-soft">{dish.dish_options?.length ?? 0} componentes · {dish.disponivel_hoje ? "disponível" : "indisponível"}</p>
            </button>)}
          </div>
        </section>

        {selected ? <section className="rounded-2xl border border-border bg-neutral-000 p-4">
          <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Editar prato</h2><button onClick={() => deleteDish(selected.id)} className="text-red-dark"><Trash2 size={17} /></button></div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_160px]">
            <input value={dishName} onChange={(event) => setDishName(event.target.value)} className={inputClass} />
            <input value={dishPrice} onChange={(event) => setDishPrice(event.target.value)} type="number" min="0" step="0.01" className={inputClass} />
            <input value={dishCategory} onChange={(event) => setDishCategory(event.target.value)} placeholder="Categoria" className={inputClass} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><Button className="w-auto" onClick={saveDish}>Salvar prato</Button><button onClick={() => toggleAvailability(selected)} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold">{selected.disponivel_hoje ? "Marcar indisponível" : "Marcar disponível"}</button></div>

          <h3 className="mt-6 text-sm font-semibold">Componentes do prato</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(selected.dish_options ?? []).map((option) => <div key={option.id} className="flex items-center justify-between rounded-xl border border-border p-3">
              <button onClick={() => { setOptionId(option.id); setOptionName(option.nome); setOptionGroup(option.grupo); setOptionPrice(String(option.preco_adicional)); setOptionMin(String(option.selecao_min)); setOptionMax(String(option.selecao_max)); }} className="min-w-0 text-left"><p className="truncate text-sm font-semibold">{option.nome}</p><p className="text-[11px] text-ink-soft">{option.grupo} · + R$ {Number(option.preco_adicional).toFixed(2)}</p></button>
              <button onClick={() => deleteOption(option.id)} className="text-red-dark"><Trash2 size={15} /></button>
            </div>)}
          </div>

          <div className="mt-4 rounded-xl bg-neutral-050 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{optionId ? "Editar componente" : "Novo componente"}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input value={optionName} onChange={(event) => setOptionName(event.target.value)} placeholder="Ex.: Arroz, feijão, frango" className={inputClass} />
              <select value={optionGroup} onChange={(event) => setOptionGroup(event.target.value as DishOption["grupo"])} className={inputClass}><option value="proteina">Proteína</option><option value="acompanhamento">Acompanhamento</option><option value="extra">Extra</option></select>
              <input value={optionPrice} onChange={(event) => setOptionPrice(event.target.value)} type="number" min="0" step="0.01" placeholder="Preço adicional" className={inputClass} />
              <div className="grid grid-cols-2 gap-2"><input value={optionMin} onChange={(event) => setOptionMin(event.target.value)} type="number" min="0" placeholder="Mínimo" className={inputClass} /><input value={optionMax} onChange={(event) => setOptionMax(event.target.value)} type="number" min="1" placeholder="Máximo" className={inputClass} /></div>
            </div>
            <div className="mt-3 flex gap-3"><button onClick={saveOption} className="text-xs font-semibold text-primary-700">{optionId ? "Salvar componente" : "Adicionar componente"}</button>{optionId && <button onClick={resetOption} className="text-xs text-ink-soft">Cancelar</button>}</div>
          </div>
        </section> : <section className="rounded-2xl border border-border bg-neutral-000 p-5 text-sm text-ink-soft">Cadastre ou selecione um prato.</section>}
      </div>
    </main>
  );
}
