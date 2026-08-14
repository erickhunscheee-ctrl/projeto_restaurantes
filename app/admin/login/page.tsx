"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true); setError(null);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const result = await response.json();
    if (!response.ok) { setLoading(false); return setError(result.error ?? "Não foi possível entrar."); }
    router.push("/admin/restaurantes");
  }

  return <main className="flex flex-1 flex-col justify-center gap-3 px-6"><h1 className="text-xl font-semibold text-red-dark">Administração da plataforma</h1><p className="text-sm text-ink-soft">Acesse para gerenciar restaurantes e pratos.</p><input value={username} onChange={e => setUsername(e.target.value)} placeholder="Usuário" autoComplete="username" className="rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" /><input value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" type="password" autoComplete="current-password" className="rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />{error && <p className="text-xs text-red-dark">{error}</p>}<Button onClick={login} disabled={loading || !username || !password}>{loading ? "Entrando..." : "Entrar"}</Button></main>;
}
