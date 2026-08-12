"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, LocateFixed } from "lucide-react";
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

  useEffect(() => { loadRestaurants(); }, []);
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
      <h2 className="text-lg font-semibold text-neutral-900">Dados do restaurante</h2>
      {!selected ? <p className="mt-3 text-sm text-neutral-500">Selecione um restaurante.</p> : <>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-neutral-900">Contato e localização</h3>
          <button type="button" onClick={useCurrentLocation} disabled={locating} className="flex items-center gap-1.5 rounded-lg border border-primary-500 px-2.5 py-2 text-xs font-semibold text-primary-700 disabled:opacity-50">
            {locating ? <LoaderCircle size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            {locating ? "Localizando..." : "Usar localização atual"}
          </button>
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
