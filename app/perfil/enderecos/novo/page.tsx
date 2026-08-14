"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";

const emptyAddress = {
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  latitude: "",
  longitude: "",
};

type AddressForm = typeof emptyAddress;

const inputClass =
  "mt-2 w-full rounded-xl border border-border-strong bg-neutral-000 px-3.5 py-3.5 text-sm text-neutral-900 outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-red-dark";

const AddressMapPicker = dynamic(
  () => import("@/components/address-map-picker").then((module) => module.AddressMapPicker),
  { ssr: false },
);

function formatAddress(address: AddressForm) {
  const street = [address.rua.trim(), address.numero.trim()].filter(Boolean).join(", ");
  const locality = [address.bairro.trim(), address.cidade.trim()].filter(Boolean).join(", ");
  const stateAndCep = [address.estado.trim().toUpperCase(), address.cep.trim()]
    .filter(Boolean)
    .join(" · ");

  return [street, address.complemento.trim(), locality, stateAndCep]
    .filter(Boolean)
    .join(" - ");
}

export default function NovoEnderecoPage() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapPosition, setMapPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [confirmingPosition, setConfirmingPosition] = useState(false);

  function setField(field: keyof AddressForm, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function useCurrentLocation() {
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não disponível neste navegador.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setMapPosition({ latitude: coords.latitude, longitude: coords.longitude });
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
          });
          const response = await fetch(`/api/geocode/reverse?${params}`, {
            cache: "no-store",
          });
          const result = await response.json();

          if (!response.ok) {
            setError(result.error ?? "Não foi possível localizar o endereço.");
            return;
          }

          const found = result.location;
          setAddress((current) => ({
            ...current,
            cep: found.cep ?? "",
            rua: found.endereco ?? "",
            numero: found.numero ?? "",
            bairro: found.bairro ?? "",
            cidade: found.cidade ?? "",
            estado: found.estado ?? "",
            latitude: found.latitude ?? String(coords.latitude),
            longitude: found.longitude ?? String(coords.longitude),
          }));
        } catch {
          setError("Não foi possível consultar o endereço.");
        } finally {
          setLocating(false);
        }
      },
      (locationError) => {
        setLocating(false);
        setError(
          locationError.code === locationError.PERMISSION_DENIED
            ? "Permita o acesso à localização no navegador."
            : "Não foi possível obter sua localização.",
        );
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  }

  async function confirmMapPosition() {
    if (!mapPosition) return;
    setConfirmingPosition(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: String(mapPosition.latitude),
        lon: String(mapPosition.longitude),
      });
      const response = await fetch(`/api/geocode/reverse?${params}`, { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Não foi possível localizar o endereço selecionado.");
        return;
      }

      const found = result.location;
      setAddress((current) => ({
        ...current,
        cep: found.cep ?? "",
        rua: found.endereco ?? "",
        numero: found.numero ?? "",
        bairro: found.bairro ?? "",
        cidade: found.cidade ?? "",
        estado: found.estado ?? "",
        latitude: found.latitude ?? String(mapPosition.latitude),
        longitude: found.longitude ?? String(mapPosition.longitude),
      }));

      if (!found.endereco || !found.numero) {
        setError("Ponto atualizado. Confira a rua e informe o número caso ele não esteja cadastrado no mapa.");
      }
    } catch {
      setError("Não foi possível consultar o endereço selecionado.");
    } finally {
      setConfirmingPosition(false);
    }
  }

  async function save() {
    if (
      !label.trim() ||
      !address.rua.trim() ||
      !address.numero.trim() ||
      !address.bairro.trim() ||
      !address.cidade.trim() ||
      !address.estado.trim()
    ) {
      setError("Preencha rótulo, rua, número, bairro, cidade e estado.");
      return;
    }

    const formattedAddress = formatAddress(address);
    setSaving(true);
    setError(null);
    const response = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      rotulo: label.trim(),
      endereco: formattedAddress,
      padrao: isDefault,
      cep: address.cep.trim() || null,
      rua: address.rua.trim(),
      numero: address.numero.trim(),
      complemento: address.complemento.trim() || null,
      bairro: address.bairro.trim(),
      cidade: address.cidade.trim(),
      estado: address.estado.trim().toUpperCase(),
      latitude: address.latitude ? Number(address.latitude) : null,
      longitude: address.longitude ? Number(address.longitude) : null,
    }) });
    const result = await response.json();

    setSaving(false);
    if (!response.ok) {
      if (response.status === 401) return router.replace("/login");
      setError(result.error ?? "Não foi possível salvar o endereço.");
      return;
    }

    router.push("/perfil");
    router.refresh();
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
        <Link href="/perfil" aria-label="Voltar">
          <ArrowLeft size={19} />
        </Link>
        <h1 className="text-base font-medium">Novo endereço</h1>
      </header>

      <div className="px-5 pb-7 pt-6">
        <label className={labelClass}>Rótulo</label>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Casa, Trabalho..."
          maxLength={40}
          className={`${inputClass} mb-4`}
        />

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500 px-3.5 py-3 text-sm font-semibold text-primary-700 disabled:opacity-50"
        >
          {locating ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <LocateFixed size={17} />
          )}
          {locating ? "Localizando..." : "Preencher com minha localização"}
        </button>

        {mapPosition && (
          <div className="mb-5 space-y-3">
            <div>
              <p className={labelClass}>Ajuste a localização</p>
              <p className="mt-1 text-xs text-ink-soft">
                Mova o mapa até o marcador ficar sobre a entrada da sua casa.
              </p>
            </div>
            <AddressMapPicker
              latitude={mapPosition.latitude}
              longitude={mapPosition.longitude}
              onPositionChange={(latitude, longitude) => setMapPosition({ latitude, longitude })}
            />
            <button
              type="button"
              onClick={confirmMapPosition}
              disabled={confirmingPosition}
              className="w-full rounded-xl bg-primary-500 px-3.5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {confirmingPosition ? "Consultando endereço..." : "Confirmar ponto no mapa"}
            </button>
          </div>
        )}

        <div className="grid grid-cols-[1fr_110px] gap-3">
          <div>
            <label className={labelClass}>CEP</label>
            <input
              value={address.cep}
              onChange={(event) => setField("cep", event.target.value)}
              placeholder="00000-000"
              inputMode="numeric"
              maxLength={9}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Número</label>
            <input
              value={address.numero}
              onChange={(event) => setField("numero", event.target.value)}
              placeholder="123"
              maxLength={20}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Rua</label>
          <input
            value={address.rua}
            onChange={(event) => setField("rua", event.target.value)}
            placeholder="Rua ou avenida"
            maxLength={150}
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass}>Complemento</label>
          <input
            value={address.complemento}
            onChange={(event) => setField("complemento", event.target.value)}
            placeholder="Apartamento, bloco, referência..."
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass}>Bairro</label>
          <input
            value={address.bairro}
            onChange={(event) => setField("bairro", event.target.value)}
            placeholder="Bairro"
            maxLength={100}
            className={inputClass}
          />
        </div>

        <div className="mt-4 grid grid-cols-[1fr_90px] gap-3">
          <div>
            <label className={labelClass}>Cidade</label>
            <input
              value={address.cidade}
              onChange={(event) => setField("cidade", event.target.value)}
              placeholder="Cidade"
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input
              value={address.estado}
              onChange={(event) => setField("estado", event.target.value.toUpperCase())}
              placeholder="UF"
              maxLength={2}
              className={inputClass}
            />
          </div>
        </div>

        {address.latitude && address.longitude && (
          <div className="mt-4 rounded-xl bg-green-tint px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-green">
              <LocateFixed size={14} /> Localização salva neste endereço
            </p>
            <p className="mt-1 text-[10px] text-ink-soft">
              {address.latitude}, {address.longitude} · © OpenStreetMap contributors
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsDefault((value) => !value)}
          className="mt-4 flex items-center gap-2.5 text-[13px]"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${isDefault ? "border-green bg-green text-bg" : "border-border-strong"
              }`}
          >
            {isDefault && <Check size={14} />}
          </span>
          Definir como endereço padrão
        </button>

        {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
        <div className="mt-6">
          <Button onClick={save} disabled={saving || locating}>
            {saving ? "Salvando..." : "Salvar endereço"}
          </Button>
        </div>
      </div>
    </main>
  );
}
