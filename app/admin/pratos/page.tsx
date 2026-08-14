"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { useAdminDishes, useAdminRestaurants } from "@/hooks/use-admin-resources";

type Restaurant = { id: string; nome: string };
type Dish = { id: string; nome: string; preco_base: number; categoria: string | null; disponivel_hoje: boolean };
const inputClass = "w-full rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-900 outline-none";

export default function AdminDishesPage() {
  const { data: restaurants = [] } = useAdminRestaurants();
  const [restaurantId, setRestaurantId] = useState("");
  const { data: dishes = [], refetch } = useAdminDishes(restaurantId);
  const [name, setName] = useState(""); const [price, setPrice] = useState(""); const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Dish | null>(null);
  const [editName, setEditName] = useState(""); const [editPrice, setEditPrice] = useState(""); const [editCategory, setEditCategory] = useState(""); const [editAvailable, setEditAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!restaurantId && restaurants[0]) setRestaurantId(restaurants[0].id); }, [restaurantId, restaurants]);

  async function create() {
    const response = await fetch("/api/admin/dishes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ establishment_id: restaurantId, nome: name, preco_base: Number(price), categoria: category }) });
    const result = await response.json(); if (!response.ok) return setError(result.error);
    setName(""); setPrice(""); setCategory(""); await refetch();
  }
  async function save() {
    if (!editing) return;
    const response = await fetch("/api/admin/dishes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, nome: editName, preco_base: Number(editPrice), categoria: editCategory || null, disponivel_hoje: editAvailable }) });
    const result = await response.json(); if (!response.ok) return setError(result.error);
    setEditing(null); await refetch();
  }
  async function remove(id: string) {
    const response = await fetch("/api/admin/dishes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const result = await response.json(); if (!response.ok) return setError(result.error); await refetch();
  }

  return <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <AdminPageHeading title="Pratos" description="Gerencie o cardápio de cada restaurante." />
    <section className="rounded-2xl border border-border bg-neutral-000 p-4 sm:p-5">
      <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Restaurante</label>
      <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)} className={`${inputClass} mt-2 max-w-xl`}>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.nome}</option>)}</select>
      <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_140px_180px_auto]">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do prato" className={inputClass} />
        <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" min="0" step="0.01" placeholder="Preço" className={inputClass} />
        <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Categoria do cardápio" className={inputClass} />
        <Button className="w-full lg:w-auto" onClick={create} disabled={!restaurantId || !name.trim() || !price}>Adicionar</Button>
      </div>
      {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
    </section>
    <section className="mt-5 overflow-hidden rounded-2xl border border-border bg-neutral-000">
      <div className="hidden grid-cols-[1fr_140px_180px_100px] gap-3 border-b border-border bg-neutral-050 px-5 py-3 text-xs font-semibold text-neutral-600 md:grid"><span>Prato</span><span>Preço</span><span>Categoria</span><span>Ações</span></div>
      {dishes.map((dish) => <div key={dish.id} className="border-b border-border p-4 last:border-0 md:px-5">
        {editing?.id === dish.id ? <div className="grid gap-3 md:grid-cols-[1fr_140px_180px_auto]"><input value={editName} onChange={(event) => setEditName(event.target.value)} className={inputClass} /><input value={editPrice} onChange={(event) => setEditPrice(event.target.value)} type="number" className={inputClass} /><input value={editCategory} onChange={(event) => setEditCategory(event.target.value)} className={inputClass} /><div className="flex items-center gap-3"><button onClick={save} className="text-xs font-semibold text-primary-700">Salvar</button><button onClick={() => setEditing(null)} className="text-xs text-ink-soft">Cancelar</button></div></div>
        : <div className="grid gap-2 md:grid-cols-[1fr_140px_180px_100px] md:items-center"><div><p className="text-sm font-semibold">{dish.nome}</p><p className="text-[11px] text-ink-soft md:hidden">{dish.categoria || "Sem categoria"}</p></div><span className="text-sm text-primary-700">R$ {Number(dish.preco_base).toFixed(2)}</span><span className="hidden text-sm text-ink-soft md:block">{dish.categoria || "—"}</span><div className="flex gap-3"><button onClick={() => { setEditing(dish); setEditName(dish.nome); setEditPrice(String(dish.preco_base)); setEditCategory(dish.categoria ?? ""); setEditAvailable(dish.disponivel_hoje); }}><Pencil size={15} className="text-primary-700" /></button><button onClick={() => remove(dish.id)}><Trash2 size={15} className="text-red-dark" /></button></div></div>}
      </div>)}
      {dishes.length === 0 && <p className="p-8 text-center text-sm text-ink-soft">Nenhum prato cadastrado.</p>}
    </section>
  </main>;
}
