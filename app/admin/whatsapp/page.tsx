"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { useAdminRestaurants } from "@/hooks/use-admin-resources";

type Restaurant = { id: string; nome: string; whatsapp_telefone?: string | null };
type Status = { configured?: boolean; telefone?: string; logado?: boolean; status?: string };

export default function AdminWhatsAppPage() {
  const { data: restaurants = [] } = useAdminRestaurants();
  const [restaurantId, setRestaurantId] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!restaurantId && restaurants[0]) setRestaurantId(restaurants[0].id); }, [restaurantId, restaurants]);
  const loadStatus = useCallback(async () => {
    if (!restaurantId) return;
    const response = await fetch(`/api/admin/whatsapp/session?establishment_id=${restaurantId}`, { cache: "no-store" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return setError(result.error ?? "Não foi possível consultar a sessão.");
    setStatus(result); setPhone(String(result.telefone ?? restaurants.find((item) => item.id === restaurantId)?.whatsapp_telefone ?? ""));
  }, [restaurantId, restaurants]);
  useEffect(() => { setQrUrl(null); setStatus(null); loadStatus(); }, [loadStatus]);

  async function create() {
    setAction("create"); setError(null);
    const response = await fetch("/api/admin/whatsapp/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ establishment_id: restaurantId, telefone: phone }) });
    const result = await response.json().catch(() => ({})); setAction(null);
    if (!response.ok && response.status !== 409) return setError(result.error ?? "Não foi possível criar."); await loadStatus();
  }
  async function reconnect() {
    setAction("reconnect"); const response = await fetch("/api/admin/whatsapp/reconnect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ establishment_id: restaurantId }) });
    const result = await response.json().catch(() => ({})); setAction(null); if (!response.ok) return setError(result.error ?? "Não foi possível reconectar."); await loadStatus();
  }
  async function showQr() {
    setAction("qr"); const response = await fetch(`/api/admin/whatsapp/qrcode?establishment_id=${restaurantId}`, { cache: "no-store" });
    if (!response.ok) { const result = await response.json().catch(() => ({})); setAction(null); return setError(result.error ?? "QR Code indisponível."); }
    const url = URL.createObjectURL(await response.blob()); setQrUrl((current) => { if (current) URL.revokeObjectURL(current); return url; }); setAction(null);
  }
  async function remove() {
    setAction("remove"); const response = await fetch("/api/admin/whatsapp/session", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ establishment_id: restaurantId }) });
    const result = await response.json().catch(() => ({})); setAction(null); if (!response.ok) return setError(result.error ?? "Não foi possível remover."); setStatus({ configured: false }); setPhone(""); setQrUrl(null);
  }

  const configured = status?.configured !== false && Boolean(status);
  const connected = status?.logado === true || status?.status === "conectada" || status?.status === "logada";
  return <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
    <AdminPageHeading title="WhatsApp" description="Gerencie as sessões de envio dos restaurantes." />
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-2xl border border-border bg-neutral-000 p-4 sm:p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Restaurante</label>
        <select value={restaurantId} onChange={(event) => setRestaurantId(event.target.value)} className="mt-2 w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none">{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.nome}</option>)}</select>
        <div className="mt-5 rounded-xl bg-neutral-050 p-4"><p className="text-xs text-ink-soft">Status da sessão</p><div className="mt-1 flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${connected ? "bg-green" : "bg-neutral-300"}`} /><p className="text-sm font-semibold">{!configured ? "Não configurada" : connected ? "Conectada" : String(status?.status ?? "Aguardando conexão")}</p></div></div>
        {!configured ? <div className="mt-5"><input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="5551999999999" className="w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" /><Button className="mt-3" onClick={create} disabled={!restaurantId || phone.replace(/\D/g, "").length < 12 || action !== null}>{action === "create" ? "Criando..." : "Criar sessão"}</Button></div>
        : <div className="mt-5 space-y-3"><p className="text-sm">Telefone: <b>{phone}</b></p><div className="flex flex-wrap gap-2"><Button className="w-auto" onClick={reconnect} disabled={action !== null}><RefreshCw size={15} /> Reconectar</Button><button onClick={showQr} disabled={action !== null} className="flex items-center gap-2 rounded-xl border border-primary-500 px-4 py-3 text-sm font-semibold text-primary-700"><QrCode size={15} /> QR Code</button><button onClick={remove} disabled={action !== null} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-dark"><Trash2 size={14} /> Remover</button></div></div>}
        {error && <p className="mt-4 text-xs text-red-dark">{error}</p>}
      </div>
      <div className="flex min-h-80 items-center justify-center rounded-2xl border border-border bg-neutral-000 p-5">{qrUrl ? <img src={qrUrl} alt="QR Code do WhatsApp" className="h-72 w-72 object-contain" /> : <div className="text-center text-ink-soft"><MessageCircle size={36} className="mx-auto" /><p className="mt-2 text-sm">O QR Code aparecerá aqui.</p></div>}</div>
    </section>
  </main>;
}
