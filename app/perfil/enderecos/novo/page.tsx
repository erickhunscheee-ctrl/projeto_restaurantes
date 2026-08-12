"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const emptyLocation = {
  cep: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  latitude: "",
  longitude: "",
};

export default function NovoEnderecoPage() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState(emptyLocation);

  function useCurrentLocation() {
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não disponível neste navegador.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
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
          setAddress(
            found.endereco_completo ||
              [found.endereco, found.numero, found.bairro, found.cidade, found.estado]
                .filter(Boolean)
                .join(", "),
          );
          setLocation({
            cep: found.cep ?? "",
            numero: found.numero ?? "",
            bairro: found.bairro ?? "",
            cidade: found.cidade ?? "",
            estado: found.estado ?? "",
            latitude: found.latitude ?? String(coords.latitude),
            longitude: found.longitude ?? String(coords.longitude),
          });
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

  async function save() {
    if (!label.trim() || address.trim().length < 3) {
      setError("Preencha o rótulo e o endereço.");
      return;
    }

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const { error: insertError } = await supabase.from("addresses").insert({
      user_id: user.id,
      rotulo: label.trim(),
      endereco: address.trim(),
      padrao: isDefault,
      cep: location.cep || null,
      numero: location.numero || null,
      bairro: location.bairro || null,
      cidade: location.cidade || null,
      estado: location.estado || null,
      latitude: location.latitude ? Number(location.latitude) : null,
      longitude: location.longitude ? Number(location.longitude) : null,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
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

      <div className="px-5 pt-6">
        <label className="text-xs font-medium uppercase tracking-wide text-red-dark">
          Rótulo
        </label>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Casa, Trabalho..."
          maxLength={40}
          className="mb-4 mt-2 w-full rounded-xl border border-border-strong bg-neutral-000 px-3.5 py-3.5 text-sm text-neutral-900 outline-none"
        />

        <label className="text-xs font-medium uppercase tracking-wide text-red-dark">
          Endereço completo
        </label>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-primary-500 px-3.5 py-3 text-sm font-semibold text-primary-700 disabled:opacity-50"
        >
          {locating ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <LocateFixed size={17} />
          )}
          {locating ? "Localizando..." : "Usar minha localização atual"}
        </button>
        <textarea
          value={address}
          onChange={(event) => {
            setAddress(event.target.value);
            setLocation(emptyLocation);
          }}
          placeholder="Rua, número, complemento e bairro"
          rows={4}
          maxLength={300}
          className="mt-2 w-full resize-none rounded-xl border border-border-strong bg-neutral-000 px-3.5 py-3.5 text-sm text-neutral-900 outline-none"
        />
        {location.latitude && (
          <p className="mt-1.5 text-[10px] text-ink-soft">
            Endereço obtido com dados de © OpenStreetMap contributors.
          </p>
        )}

        <button
          type="button"
          onClick={() => setIsDefault((value) => !value)}
          className="mt-4 flex items-center gap-2.5 text-[13px]"
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-md border ${
              isDefault ? "border-green bg-green text-bg" : "border-border-strong"
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
