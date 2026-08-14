"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, MessageCircle, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SessionStatus = Record<string, unknown> & {
  configured?: boolean;
  telefone?: string;
  logado?: boolean;
  qr_disponivel?: boolean;
  status?: string;
};

export default function RestaurantWhatsAppPage() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/restaurant/whatsapp/session", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível consultar a sessão.");
      setStatus(result);
      if (result.telefone) setPhone(String(result.telefone));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível consultar a sessão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const interval = window.setInterval(loadStatus, 5_000);
    return () => window.clearInterval(interval);
  }, [loadStatus]);

  useEffect(() => () => { if (qrUrl) URL.revokeObjectURL(qrUrl); }, [qrUrl]);

  async function createSession() {
    setAction("create");
    setError(null);
    const response = await fetch("/api/restaurant/whatsapp/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: phone }),
    });
    const result = await response.json().catch(() => ({}));
    setAction(null);
    if (!response.ok && response.status !== 409) return setError(result.error ?? result.detail ?? "Não foi possível criar a sessão.");
    await loadStatus();
  }

  async function reconnect() {
    setAction("reconnect");
    setError(null);
    const response = await fetch("/api/restaurant/whatsapp/reconnect", { method: "POST" });
    const result = await response.json().catch(() => ({}));
    setAction(null);
    if (!response.ok) return setError(result.error ?? result.detail ?? "Não foi possível reconectar.");
    await loadStatus();
  }

  async function loadQrCode() {
    setAction("qr");
    setError(null);
    const response = await fetch("/api/restaurant/whatsapp/qrcode", { cache: "no-store" });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setAction(null);
      return setError(result.error ?? result.detail ?? "QR Code ainda não disponível.");
    }
    const blobUrl = URL.createObjectURL(await response.blob());
    setQrUrl((current) => { if (current) URL.revokeObjectURL(current); return blobUrl; });
    setAction(null);
  }

  async function removeSession() {
    setAction("remove");
    setError(null);
    const response = await fetch("/api/restaurant/whatsapp/session", { method: "DELETE" });
    const result = await response.json().catch(() => ({}));
    setAction(null);
    if (!response.ok && response.status !== 404) return setError(result.error ?? "Não foi possível remover a sessão.");
    if (qrUrl) URL.revokeObjectURL(qrUrl);
    setQrUrl(null);
    setStatus({ configured: false });
    setPhone("");
  }

  const configured = status?.configured !== false && Boolean(status);
  const connected = status?.logado === true || status?.status === "conectada" || status?.status === "logada";

  return (
    <main className="mx-auto w-full max-w-3xl p-5">
      <section className="rounded-2xl border border-border bg-neutral-000 p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-tint text-green"><MessageCircle size={21} /></span>
          <div><h1 className="text-lg font-semibold text-neutral-900">WhatsApp do restaurante</h1><p className="text-xs text-ink-soft">Conecte o número usado para enviar mensagens.</p></div>
        </div>

        {loading ? <div className="flex items-center gap-2 py-8 text-sm text-ink-soft"><LoaderCircle size={17} className="animate-spin" /> Consultando sessão...</div> : (
          <>
            <div className="mt-5 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs text-ink-soft">Status</p><p className={`mt-1 text-sm font-semibold ${connected ? "text-green" : "text-neutral-900"}`}>{!configured ? "Não configurada" : connected ? "Conectada" : String(status?.status ?? "Aguardando conexão")}</p></div>
                <span className={`h-3 w-3 rounded-full ${connected ? "bg-green" : "bg-neutral-300"}`} />
              </div>
            </div>

            {!configured ? (
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Telefone da sessão</label>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="5551999999999" inputMode="tel" className="mt-2 w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
                <p className="mt-1.5 text-[11px] text-ink-soft">Informe DDI 55, DDD e número, somente dígitos.</p>
                <Button className="mt-4" onClick={createSession} disabled={action !== null || phone.replace(/\D/g, "").length < 12}>{action === "create" ? "Criando..." : "Criar sessão"}</Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-neutral-700">Número: <b>{phone}</b></p>
                {!connected && <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={reconnect} disabled={action !== null}><RefreshCw size={16} /> {action === "reconnect" ? "Reconectando..." : "Reconectar"}</Button>
                  <button onClick={loadQrCode} disabled={action !== null} className="flex items-center justify-center gap-2 rounded-xl border border-primary-500 px-4 py-3 text-sm font-semibold text-primary-700"><QrCode size={16} /> {action === "qr" ? "Carregando..." : "Mostrar QR Code"}</button>
                </div>}
                {qrUrl && <div className="flex justify-center rounded-xl border border-border bg-white p-4"><img src={qrUrl} alt="QR Code do WhatsApp" className="h-64 w-64 object-contain" /></div>}
                <button onClick={removeSession} disabled={action !== null} className="flex items-center gap-1.5 text-xs font-semibold text-red-dark"><Trash2 size={14} /> {action === "remove" ? "Removendo..." : "Remover sessão"}</button>
              </div>
            )}
          </>
        )}
        {error && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-3 text-xs text-red-dark">{error}</p>}
      </section>
    </main>
  );
}
