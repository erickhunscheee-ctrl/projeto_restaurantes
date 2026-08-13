"use client";

import { useEffect, useState } from "react";
import { ImagePlus, LoaderCircle, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

type Restaurant = {
  id: string;
  nome: string;
  tipo_cozinha: string;
  status: string;
  telefone?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  establishment_categories?: { category_id: string }[];
};

type Category = {
  id: string;
  nome: string;
  slug: string;
  image_url: string | null;
  ordem: number;
  ativo: boolean;
};

type Dish = {
  id: string;
  nome: string;
  preco_base: number;
  disponivel_hoje: boolean;
};

type Details = {
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: string;
  longitude: string;
};

const emptyDetails: Details = {
  telefone: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  latitude: "",
  longitude: "",
};

const inputClass = "w-full rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

export default function PlatformRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryOrder, setCategoryOrder] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryEditName, setCategoryEditName] = useState("");
  const [categoryEditOrder, setCategoryEditOrder] = useState("");
  const [categoryEditActive, setCategoryEditActive] = useState(true);
  const [categoryEditImage, setCategoryEditImage] = useState<File | null>(null);
  const [selected, setSelected] = useState("");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [name, setName] = useState("");
  const [dishName, setDishName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(null);
  const [restaurantEditName, setRestaurantEditName] = useState("");
  const [editingDish, setEditingDish] = useState<string | null>(null);
  const [dishEditName, setDishEditName] = useState("");
  const [dishEditPrice, setDishEditPrice] = useState("");

  const selectedRestaurant = restaurants.find((item) => item.id === selected);

  async function loadRestaurants() {
    const response = await fetch("/api/admin/restaurants", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setRestaurants(result.restaurants);
    if (!selected && result.restaurants[0]) setSelected(result.restaurants[0].id);
  }

  async function loadDishes(id: string) {
    if (!id) return setDishes([]);
    const response = await fetch(`/api/admin/dishes?establishment_id=${id}`, { cache: "no-store" });
    const result = await response.json();
    if (response.ok) setDishes(result.dishes);
  }

  async function loadCategories() {
    const response = await fetch("/api/admin/categories", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setCategories(result.categories);
  }

  async function createCategory() {
    if (!categoryName.trim() || !categoryImage) return;
    setSavingCategory(true);
    setError(null);
    const form = new FormData();
    form.set("nome", categoryName.trim());
    form.set("ordem", categoryOrder || "0");
    form.set("image", categoryImage);
    const response = await fetch("/api/admin/categories", { method: "POST", body: form });
    const result = await response.json();
    setSavingCategory(false);
    if (!response.ok) return setError(result.error);
    setCategoryName("");
    setCategoryOrder("");
    setCategoryImage(null);
    await loadCategories();
  }

  async function saveCategory(id: string) {
    if (!categoryEditName.trim()) return;
    setSavingCategory(true);
    setError(null);
    const form = new FormData();
    form.set("id", id);
    form.set("nome", categoryEditName.trim());
    form.set("ordem", categoryEditOrder || "0");
    form.set("ativo", String(categoryEditActive));
    if (categoryEditImage) form.set("image", categoryEditImage);
    const response = await fetch("/api/admin/categories", { method: "PATCH", body: form });
    const result = await response.json();
    setSavingCategory(false);
    if (!response.ok) return setError(result.error);
    setEditingCategory(null);
    setCategoryEditImage(null);
    await loadCategories();
  }

  async function deleteCategory(id: string) {
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setSelectedCategoryIds((current) => current.filter((categoryId) => categoryId !== id));
    await loadCategories();
  }

  useEffect(() => { loadRestaurants(); loadCategories(); }, []);
  useEffect(() => { loadDishes(selected); }, [selected]);
  useEffect(() => {
    if (!selectedRestaurant) return;
    setDetails({
      telefone: selectedRestaurant.telefone ?? "",
      cep: selectedRestaurant.cep ?? "",
      endereco: selectedRestaurant.endereco ?? "",
      numero: selectedRestaurant.numero ?? "",
      complemento: selectedRestaurant.complemento ?? "",
      bairro: selectedRestaurant.bairro ?? "",
      cidade: selectedRestaurant.cidade ?? "",
      estado: selectedRestaurant.estado ?? "",
      latitude: selectedRestaurant.latitude?.toString() ?? "",
      longitude: selectedRestaurant.longitude?.toString() ?? "",
    });
    setSelectedCategoryIds(
      selectedRestaurant.establishment_categories?.map((item) => item.category_id) ?? [],
    );
  }, [selectedRestaurant]);

  async function createRestaurant() {
    const response = await fetch("/api/admin/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: name }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setName("");
    await loadRestaurants();
    setSelected(result.restaurant.id);
  }

  async function saveRestaurant(id: string) {
    if (!restaurantEditName.trim()) return;
    const response = await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nome: restaurantEditName.trim() }),
    });
    if (!response.ok) return setError((await response.json()).error);
    setEditingRestaurant(null);
    await loadRestaurants();
  }

  async function deleteRestaurant(id: string) {
    const response = await fetch("/api/admin/restaurants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return setError((await response.json()).error);
    setSelected("");
    await loadRestaurants();
  }

  async function saveDetails() {
    const response = await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected,
        ...details,
        latitude: details.latitude ? Number(details.latitude) : null,
        longitude: details.longitude ? Number(details.longitude) : null,
        category_ids: selectedCategoryIds,
      }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    await loadRestaurants();
  }

  function useCurrentLocation() {
    setError(null);
    if (!navigator.geolocation) return setError("Geolocalização não disponível neste navegador.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/admin/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) return setError(result.error ?? "Não foi possível localizar o endereço.");
        setDetails((current) => ({ ...current, ...result.location }));
      } catch {
        setError("Não foi possível consultar o endereço.");
      } finally {
        setLocating(false);
      }
    }, (locationError) => {
      setLocating(false);
      setError(locationError.code === 1
        ? "Permita o acesso à localização no navegador."
        : "Não foi possível obter sua localização.");
    }, { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 });
  }

  async function createDish() {
    const response = await fetch("/api/admin/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ establishment_id: selected, nome: dishName, preco_base: Number(price) }),
    });
    const result = await response.json();
    if (!response.ok) return setError(result.error);
    setDishName("");
    setPrice("");
    await loadDishes(selected);
  }

  async function saveDish(id: string) {
    if (!dishEditName.trim() || !dishEditPrice) return;
    const response = await fetch("/api/admin/dishes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, nome: dishEditName.trim(), preco_base: Number(dishEditPrice) }),
    });
    if (!response.ok) return setError((await response.json()).error);
    setEditingDish(null);
    await loadDishes(selected);
  }

  async function deleteDish(id: string) {
    const response = await fetch("/api/admin/dishes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) return setError((await response.json()).error);
    await loadDishes(selected);
  }

  function detailInput(key: keyof Details, label: string, type = "text") {
    return <input
      key={key}
      value={details[key]}
      onChange={(event) => setDetails({ ...details, [key]: event.target.value })}
      placeholder={label}
      type={type}
      className={inputClass}
    />;
  }

  return <main className="space-y-5 bg-neutral-050 px-5 py-5">
    <section className="rounded-2xl border border-border bg-neutral-000 p-4">
      <h1 className="text-xl font-semibold text-neutral-900">Restaurantes</h1>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do restaurante" className={`${inputClass} flex-1`} />
        <Button className="w-full sm:w-auto" onClick={createRestaurant} disabled={!name.trim()}>Adicionar</Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-dark">{error}</p>}
      <div className="mt-4 space-y-2">
        {restaurants.map((item) => <div key={item.id} className="rounded-xl border border-border p-3">
          {editingRestaurant === item.id ? <div className="flex gap-2">
            <input autoFocus value={restaurantEditName} onChange={(event) => setRestaurantEditName(event.target.value)} className={inputClass} />
            <button onClick={() => saveRestaurant(item.id)} className="text-xs font-semibold text-primary-700">Salvar</button>
            <button onClick={() => setEditingRestaurant(null)} className="text-xs text-neutral-500">Cancelar</button>
          </div> : <div className="flex items-center gap-2">
            <button onClick={() => setSelected(item.id)} className={`min-w-0 flex-1 text-left text-sm font-semibold ${selected === item.id ? "text-primary-500" : "text-neutral-900"}`}>
              {item.nome}<span className="ml-2 text-xs font-normal text-neutral-500">{item.status}</span>
            </button>
            <button onClick={() => { setEditingRestaurant(item.id); setRestaurantEditName(item.nome); }} className="text-xs text-primary-700">Editar</button>
            <button onClick={() => deleteRestaurant(item.id)} className="text-xs text-red-dark">Excluir</button>
          </div>}
        </div>)}
      </div>
    </section>

    <section className="rounded-2xl border border-border bg-neutral-000 p-4">
      <h2 className="text-lg font-semibold text-neutral-900">Categorias</h2>
      <p className="mt-1 text-xs text-neutral-500">Cadastre a imagem que aparecerá na página de restaurantes.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_100px_1fr_auto]">
        <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Nome da categoria" className={inputClass} />
        <input value={categoryOrder} onChange={(event) => setCategoryOrder(event.target.value)} placeholder="Ordem" type="number" className={inputClass} />
        <label className={`${inputClass} flex cursor-pointer items-center gap-2 text-neutral-600`}>
          <ImagePlus size={17} />
          <span className="min-w-0 truncate">{categoryImage?.name ?? "Selecionar imagem"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => setCategoryImage(event.target.files?.[0] ?? null)} />
        </label>
        <Button className="w-full sm:w-auto" onClick={createCategory} disabled={savingCategory || !categoryName.trim() || !categoryImage}>
          {savingCategory ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
      <p className="mt-2 text-[10px] text-neutral-500">JPEG, PNG, WebP ou AVIF, com no máximo 3 MB.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border border-border p-3">
            {editingCategory === category.id ? (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_90px] gap-2">
                  <input autoFocus value={categoryEditName} onChange={(event) => setCategoryEditName(event.target.value)} className={inputClass} />
                  <input value={categoryEditOrder} onChange={(event) => setCategoryEditOrder(event.target.value)} type="number" placeholder="Ordem" className={inputClass} />
                </div>
                <label className={`${inputClass} flex cursor-pointer items-center gap-2 text-neutral-600`}>
                  <ImagePlus size={17} />
                  <span className="min-w-0 truncate">{categoryEditImage?.name ?? "Trocar imagem"}</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(event) => setCategoryEditImage(event.target.files?.[0] ?? null)} />
                </label>
                <label className="flex items-center gap-2 text-xs text-neutral-700">
                  <input type="checkbox" checked={categoryEditActive} onChange={(event) => setCategoryEditActive(event.target.checked)} />
                  Categoria ativa
                </label>
                <div className="flex gap-3">
                  <button onClick={() => saveCategory(category.id)} disabled={savingCategory} className="text-xs font-semibold text-primary-700">Salvar</button>
                  <button onClick={() => { setEditingCategory(null); setCategoryEditImage(null); }} className="text-xs text-neutral-500">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-050 text-neutral-400">
                  {category.image_url ? <img src={category.image_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{category.nome}</p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">Ordem {category.ordem} · {category.ativo ? "ativa" : "inativa"}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <button onClick={() => {
                    setEditingCategory(category.id);
                    setCategoryEditName(category.nome);
                    setCategoryEditOrder(String(category.ordem));
                    setCategoryEditActive(category.ativo);
                    setCategoryEditImage(null);
                  }} className="text-xs text-primary-700">Editar</button>
                  <button onClick={() => deleteCategory(category.id)} className="text-xs text-red-dark">Excluir</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>

    <section className="rounded-2xl border border-border bg-neutral-000 p-4">
      <h2 className="text-lg font-semibold text-neutral-900">Dados do restaurante</h2>
      {!selected ? <p className="mt-3 text-sm text-neutral-500">Selecione um restaurante.</p> : <>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">Contato e localização</h3>
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="flex items-center gap-1.5 rounded-lg border border-primary-500 px-2.5 py-2 text-xs font-semibold text-primary-700 disabled:opacity-50">
            {locating ? <LoaderCircle size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            {locating ? "Localizando..." : "Usar localização atual"}
          </button>
        </div>
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-600">Categorias</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const checked = selectedCategoryIds.includes(category.id);
              return <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryIds((current) =>
                  checked
                    ? current.filter((id) => id !== category.id)
                    : [...current, category.id]
                )}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold ${checked ? "border-primary-500 bg-primary-500 text-white" : "border-border bg-neutral-000 text-neutral-700"}`}
              >
                {category.image_url && <img src={category.image_url} alt="" className="mr-1.5 inline-block h-5 w-5 rounded-md object-cover" />}{category.nome}
              </button>;
            })}
          </div>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {detailInput("telefone", "Telefone / WhatsApp")}
          {detailInput("cep", "CEP")}
          {detailInput("endereco", "Rua / avenida")}
          {detailInput("numero", "Número")}
          {detailInput("complemento", "Complemento")}
          {detailInput("bairro", "Bairro")}
          {detailInput("cidade", "Cidade")}
          {detailInput("estado", "Estado / UF")}
          {detailInput("latitude", "Latitude", "number")}
          {detailInput("longitude", "Longitude", "number")}
        </div>
        <p className="mt-2 text-[10px] text-neutral-500">Endereço obtido com dados de © OpenStreetMap contributors.</p>
        <Button className="mt-3" onClick={saveDetails}>Salvar dados do restaurante</Button>

        <h3 className="mt-6 text-sm font-semibold text-neutral-900">Pratos</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
          <input value={dishName} onChange={(event) => setDishName(event.target.value)} placeholder="Nome do prato" className={inputClass} />
          <input value={price} onChange={(event) => setPrice(event.target.value)} placeholder="Preço" type="number" min="0" step="0.01" className={inputClass} />
          <Button className="w-full sm:w-auto" onClick={createDish} disabled={!dishName.trim() || !price}>Adicionar</Button>
        </div>
        <div className="mt-4 space-y-2">
          {dishes.map((item) => <div key={item.id} className="rounded-xl border border-border p-3 text-sm text-neutral-900">
            {editingDish === item.id ? <div className="grid gap-2 sm:grid-cols-[1fr_120px_auto_auto]">
              <input autoFocus value={dishEditName} onChange={(event) => setDishEditName(event.target.value)} className={inputClass} />
              <input value={dishEditPrice} onChange={(event) => setDishEditPrice(event.target.value)} type="number" min="0" step="0.01" className={inputClass} />
              <button onClick={() => saveDish(item.id)} className="text-xs font-semibold text-primary-700">Salvar</button>
              <button onClick={() => setEditingDish(null)} className="text-xs text-neutral-500">Cancelar</button>
            </div> : <div className="flex items-center justify-between">
              <span>{item.nome} <b className="ml-2 text-primary-700">R$ {Number(item.preco_base).toFixed(2)}</b></span>
              <span className="flex gap-3">
                <button onClick={() => { setEditingDish(item.id); setDishEditName(item.nome); setDishEditPrice(String(item.preco_base)); }} className="text-xs text-primary-700">Editar</button>
                <button onClick={() => deleteDish(item.id)} className="text-xs text-red-dark">Excluir</button>
              </span>
            </div>}
          </div>)}
        </div>
      </>}
    </section>
  </main>;
}
