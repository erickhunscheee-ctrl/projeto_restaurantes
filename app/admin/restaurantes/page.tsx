"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { LoaderCircle, LocateFixed, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { useAdminCategories, useAdminRestaurants } from "@/hooks/use-admin-resources";

type Restaurant = {
  id: string; nome: string; status: string; telefone?: string | null; cep?: string | null;
  endereco?: string | null; numero?: string | null; complemento?: string | null; bairro?: string | null;
  cidade?: string | null; estado?: string | null; latitude?: number | null; longitude?: number | null;
  establishment_categories?: { category_id: string }[];
};
type Category = { id: string; nome: string; image_url: string | null; ativo: boolean };
type Details = { telefone: string; cep: string; endereco: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; latitude: string; longitude: string };
const emptyDetails: Details = { telefone: "", cep: "", endereco: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", latitude: "", longitude: "" };
const inputClass = "w-full rounded-xl border border-border-strong bg-neutral-000 px-3 py-3 text-sm text-neutral-900 outline-none";
const AddressMapPicker = dynamic(
  () => import("@/components/address-map-picker").then((module) => module.AddressMapPicker),
  { ssr: false },
);

export default function AdminRestaurantsPage() {
  const { data: restaurants = [], refetch: refetchRestaurants } = useAdminRestaurants();
  const { data: categories = [] } = useAdminCategories();
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [name, setName] = useState("");
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [accessEmail, setAccessEmail] = useState("");
  const [accessPassword, setAccessPassword] = useState("");
  const [locating, setLocating] = useState(false);
  const [confirmingPosition, setConfirmingPosition] = useState(false);
  const [mapPosition, setMapPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(() => restaurants.find((item) => item.id === selectedId), [restaurants, selectedId]);

  useEffect(() => { if (!selectedId && restaurants[0]) setSelectedId(restaurants[0].id); }, [restaurants, selectedId]);
  useEffect(() => { if (!selected) return; setName(selected.nome); setDetails({ telefone: selected.telefone ?? "", cep: selected.cep ?? "", endereco: selected.endereco ?? "", numero: selected.numero ?? "", complemento: selected.complemento ?? "", bairro: selected.bairro ?? "", cidade: selected.cidade ?? "", estado: selected.estado ?? "", latitude: selected.latitude?.toString() ?? "", longitude: selected.longitude?.toString() ?? "" }); setMapPosition(selected.latitude != null && selected.longitude != null ? { latitude: Number(selected.latitude), longitude: Number(selected.longitude) } : null); setCategoryIds(selected.establishment_categories?.map((item) => item.category_id) ?? []); setAccessEmail(""); setAccessPassword(""); }, [selected]);

  async function create() {
    const response = await fetch("/api/admin/restaurants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: newName }) }); const result = await response.json();
    if (!response.ok) return setError(result.error); setNewName(""); await refetchRestaurants(); setSelectedId(result.restaurant.id);
  }
  async function save() {
    setSaving(true); setError(null);
    const response = await fetch("/api/admin/restaurants", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedId, nome: name.trim(), ...details, latitude: details.latitude ? Number(details.latitude) : null, longitude: details.longitude ? Number(details.longitude) : null, category_ids: categoryIds }) }); const result = await response.json(); setSaving(false);
    if (!response.ok) return setError(result.error); await refetchRestaurants();
  }
  async function remove() {
    const response = await fetch("/api/admin/restaurants", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedId }) }); const result = await response.json();
    if (!response.ok) return setError(result.error); setSelectedId(""); await refetchRestaurants();
  }
  async function saveAccess() {
    const response = await fetch("/api/admin/restaurants/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ establishment_id: selectedId, email: accessEmail, password: accessPassword }) }); const result = await response.json();
    if (!response.ok) return setError(result.error); setAccessPassword("");
  }
  function useLocation() {
    if (!navigator.geolocation) return setError("Geolocalização indisponível."); setLocating(true);
    navigator.geolocation.getCurrentPosition(async ({ coords }) => { setMapPosition({ latitude: coords.latitude, longitude: coords.longitude }); try { const response = await fetch(`/api/admin/geocode/reverse?lat=${coords.latitude}&lon=${coords.longitude}`, { cache: "no-store" }); const result = await response.json(); if (!response.ok) return setError(result.error); const location = result.location; setDetails((current) => ({ ...current, cep: location.cep ?? "", endereco: location.endereco ?? "", numero: location.numero ?? "", bairro: location.bairro ?? "", cidade: location.cidade ?? "", estado: location.estado ?? "", latitude: location.latitude ?? String(coords.latitude), longitude: location.longitude ?? String(coords.longitude) })); } finally { setLocating(false); } }, () => { setLocating(false); setError("Não foi possível obter a localização."); }, { enableHighAccuracy: true, timeout: 12000 });
  }
  async function confirmMapPosition() {
    if (!mapPosition) return;
    setConfirmingPosition(true); setError(null);
    try {
      const response = await fetch(`/api/admin/geocode/reverse?lat=${mapPosition.latitude}&lon=${mapPosition.longitude}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) return setError(result.error ?? "Não foi possível consultar o ponto selecionado.");
      const location = result.location;
      setDetails((current) => ({ ...current, cep: location.cep ?? "", endereco: location.endereco ?? "", numero: location.numero || current.numero, bairro: location.bairro ?? "", cidade: location.cidade ?? "", estado: location.estado ?? "", latitude: location.latitude ?? String(mapPosition.latitude), longitude: location.longitude ?? String(mapPosition.longitude) }));
    } catch { setError("Não foi possível consultar o ponto selecionado."); }
    finally { setConfirmingPosition(false); }
  }
  function field(key: keyof Details, placeholder: string, type = "text") { return <input value={details[key]} onChange={(event) => setDetails({ ...details, [key]: event.target.value })} placeholder={placeholder} type={type} className={inputClass} />; }

  return <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <AdminPageHeading title="Restaurantes" description="Cadastre estabelecimentos, responsáveis e localização." />
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border border-border bg-neutral-000 p-4 xl:sticky xl:top-8">
        <div className="flex gap-2"><input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Novo restaurante" className={inputClass} /><button onClick={create} disabled={!newName.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white disabled:opacity-50"><Plus size={18} /></button></div>
        <div className="mt-4 space-y-2">{restaurants.map((restaurant) => <button key={restaurant.id} onClick={() => setSelectedId(restaurant.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === restaurant.id ? "border-primary-500 bg-primary-50" : "border-border"}`}><p className="truncate text-sm font-semibold">{restaurant.nome}</p><p className="mt-1 text-[11px] text-ink-soft">{restaurant.status}</p></button>)}</div>
      </section>

      {!selected ? <section className="rounded-2xl border border-border bg-neutral-000 p-8 text-center text-sm text-ink-soft">Selecione um restaurante.</section> : <div className="space-y-5">
        <section className="rounded-2xl border border-border bg-neutral-000 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Dados do restaurante</h2><button onClick={remove} className="flex items-center gap-1.5 text-xs font-semibold text-red-dark"><Trash2 size={14} /> Excluir</button></div>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome" className={`${inputClass} mt-4`} />
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-neutral-600">Categorias vinculadas</h3>
          <div className="mt-2 flex flex-wrap gap-2">{categories.filter((item) => item.ativo).map((category) => { const active = categoryIds.includes(category.id); return <button key={category.id} onClick={() => setCategoryIds((current) => active ? current.filter((id) => id !== category.id) : [...current, category.id])} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${active ? "border-primary-500 bg-primary-500 text-white" : "border-border"}`}>{category.image_url && <img src={category.image_url} alt="" className="h-5 w-5 rounded-md object-cover" />}{category.nome}</button>; })}</div>
          <div className="mt-5 flex items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Contato e localização</h3><button onClick={useLocation} disabled={locating} className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">{locating ? <LoaderCircle size={14} className="animate-spin" /> : <LocateFixed size={14} />} Localização atual</button></div>
          {mapPosition && <div className="mt-3 space-y-3"><div><p className="text-sm font-semibold text-neutral-900">Ajuste o ponto exato</p><p className="mt-1 text-xs text-ink-soft">Arraste o mapa até o marcador ficar sobre a entrada do restaurante.</p></div><AddressMapPicker key={selectedId} latitude={mapPosition.latitude} longitude={mapPosition.longitude} onPositionChange={(latitude, longitude) => { setMapPosition({ latitude, longitude }); setDetails((current) => ({ ...current, latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) })); }} /><button type="button" onClick={confirmMapPosition} disabled={confirmingPosition} className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{confirmingPosition ? "Consultando endereço..." : "Confirmar ponto no mapa"}</button></div>}
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{field("telefone", "Telefone / WhatsApp")}{field("cep", "CEP")}{field("endereco", "Rua / avenida")}{field("numero", "Número")}{field("complemento", "Complemento")}{field("bairro", "Bairro")}{field("cidade", "Cidade")}{field("estado", "Estado / UF")}{field("latitude", "Latitude", "number")}{field("longitude", "Longitude", "number")}</div>
          <Button className="mt-4 sm:w-auto" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar restaurante"}</Button>
        </section>
        <section className="rounded-2xl border border-border bg-neutral-000 p-4 sm:p-5"><h2 className="text-base font-semibold">Acesso do responsável</h2><p className="mt-1 text-xs text-ink-soft">Credenciais para /restaurante/login.</p><div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]"><input value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} type="email" placeholder="E-mail" className={inputClass} /><input value={accessPassword} onChange={(event) => setAccessPassword(event.target.value)} type="password" placeholder="Senha com 8 caracteres" className={inputClass} /><Button className="w-full lg:w-auto" onClick={saveAccess} disabled={!accessEmail || accessPassword.length < 8}>Criar acesso</Button></div></section>
        {error && <p className="rounded-xl bg-red-50 p-3 text-xs text-red-dark">{error}</p>}
      </div>}
    </div>
  </main>;
}
