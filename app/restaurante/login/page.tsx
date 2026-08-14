"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/restaurant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setLoading(false);
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/restaurante/pratos");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-neutral-050 px-6">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-neutral-000 p-5">
        <h1 className="text-xl font-semibold text-neutral-900">Painel do restaurante</h1>
        <p className="mt-1 text-sm text-ink-soft">Entre com o acesso fornecido pela plataforma.</p>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="username" placeholder="E-mail" className="mt-5 w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" placeholder="Senha" className="mt-3 w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
        {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
        <Button className="mt-4" onClick={login} disabled={loading || !email || !password}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </div>
    </main>
  );
}
