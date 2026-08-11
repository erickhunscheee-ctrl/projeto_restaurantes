"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  async function entrar() {
    const digits = telefone.replace(/\D/g, "");
    if (digits.length < 10 || !nome.trim()) return setErro("Informe seu nome e um telefone válido.");
    setLoading(true); setErro(null);
    const phone = `+55${digits}`;
    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: phone, nome: nome.trim() }),
    });
    const result = await response.json();
    setLoading(false);
    if (!response.ok) return setErro(result.error ?? "Não foi possível enviar o código.");
    router.push(`/admin/login/confirmar?telefone=${encodeURIComponent(phone)}&nome=${encodeURIComponent(nome)}`);
  }
  return <main className="flex flex-1 flex-col justify-center gap-3 px-6">
    <h1 className="text-xl font-semibold text-red-dark">Acesso do restaurante</h1>
    <p className="text-sm text-ink-soft">Entre ou cadastre seu estabelecimento usando seu telefone.</p>
    <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do responsável" className="rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
    <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(51) 99999-0000" inputMode="tel" className="rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
    {erro && <p className="text-xs text-red-dark">{erro}</p>}
    <Button onClick={entrar} disabled={loading}>{loading ? "Enviando código..." : "Continuar"}</Button>
  </main>;
}
