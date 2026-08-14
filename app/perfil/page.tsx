"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bell, Building2, Check, ChevronRight,
  CreditCard, Home, Pencil, Plus, Receipt,
} from "lucide-react";
import type { Address, Profile } from "@/lib/types";
import { LogoutButton, NotificationToggle } from "./profile-actions";
import { BottomNavbar } from "@/components/bottom-navbar";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MJ";
}

function phone(value: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length === 11) return `+55 (${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  return value || "Telefone não informado";
}

export default function PerfilPage() {
  const router = useRouter();
  const [data, setData] = useState<{ profile: Profile; addresses: Address[]; totalOrders: number } | null>(null);
  useEffect(() => { fetch("/api/profile", { cache: "no-store" }).then(async (response) => { if (response.status === 401) { router.replace("/login"); return null; } return response.ok ? response.json() : null; }).then((result) => { if (result) setData(result); }); }, [router]);
  if (!data) return <main className="flex flex-1 items-center justify-center text-sm text-ink-soft">Carregando...</main>;
  const { profile, addresses, totalOrders } = data;

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-[18px]">
        <Link href="/restaurantes" aria-label="Voltar"><ArrowLeft size={19} /></Link>
        <h1 className="text-base font-medium">Meu perfil</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="flex flex-col items-center px-5 pb-2 pt-[22px]">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-tint text-[22px] font-semibold text-green">
            {initials(profile.nome)}
          </div>
          <p className="mt-2.5 text-base font-medium">{profile.nome}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{phone(profile.telefone ?? null)}</p>
          <Link href="/perfil/editar" className="mt-2 flex items-center gap-1 text-xs font-medium text-red-dark">
            <Pencil size={13} /> editar perfil
          </Link>
        </section>

        <section className="px-5 pb-1 pt-[18px]">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.4px] text-red-dark">Endereços</h2>
          <div className="flex flex-col gap-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`flex items-center justify-between rounded-xl px-3.5 py-[11px] ${address.padrao ? "border-[1.5px] border-green bg-green-tint" : "border border-border"}`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {address.rotulo.toLowerCase() === "casa"
                    ? <Home size={17} className={address.padrao ? "text-green" : "text-ink-soft"} />
                    : <Building2 size={17} className={address.padrao ? "text-green" : "text-ink-soft"} />}
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{address.endereco}</p>
                    <p className="mt-0.5 text-[11px] text-ink-soft">{address.rotulo}{address.padrao ? " · padrão" : ""}</p>
                  </div>
                </div>
                {address.padrao ? <Check size={16} className="shrink-0 text-green" /> : <ChevronRight size={16} className="shrink-0 text-ink-faint" />}
              </div>
            ))}
            {addresses.length === 0 && <p className="py-1 text-xs text-ink-soft">Nenhum endereço cadastrado.</p>}
            <Link href="/perfil/enderecos/novo" className="flex items-center gap-2 rounded-xl border border-dashed border-border-strong px-3.5 py-2.5 text-[13px] font-medium text-red-dark">
              <Plus size={15} /> Adicionar endereço
            </Link>
          </div>
        </section>

        <section className="px-5 pb-1 pt-[18px]">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.4px] text-red-dark">Pedidos</h2>
          <Link href="/pedidos" className="flex items-center justify-between rounded-xl border border-border px-3.5 py-[11px]">
            <span className="flex items-center gap-2.5 text-[13px] font-medium"><Receipt size={17} className="text-ink-soft" /> Meus pedidos</span>
            <span className="flex items-center gap-1.5 text-[11px] text-ink-soft">{totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"}<ChevronRight size={16} className="text-ink-faint" /></span>
          </Link>
        </section>

        <section className="px-5 pb-5 pt-[18px]">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.4px] text-red-dark">Preferências</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
              <span className="flex items-center gap-2.5 text-[13px]"><Bell size={17} className="text-ink-soft" /> Notificações</span>
              <NotificationToggle initialValue={profile.notificacoes_ativas} />
            </div>
            <Link href="/perfil/pagamento" className="flex items-center justify-between px-3.5 py-3">
              <span className="flex items-center gap-2.5 text-[13px]"><CreditCard size={17} className="text-ink-soft" /> Formas de pagamento</span>
              <ChevronRight size={16} className="text-ink-faint" />
            </Link>
          </div>
        </section>
      </div>

      <footer className="shrink-0 px-5 pb-5 pt-3.5"><LogoutButton /></footer>
      <BottomNavbar />
    </main>
  );
}
