"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEntrar() {
    if (!nome.trim() || telefone.trim().length < 10) {
      setErro("Preencha nome e telefone válidos.");
      return;
    }
    setLoading(true);
    setErro(null);

    const phone = `+55${telefone.replace(/\D/g, "")}`;

    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefone: phone, nome: nome.trim() }),
    });
    const result = await response.json();

    setLoading(false);
    if (!response.ok) {
      setErro(result.error ?? "Não foi possível enviar o código.");
      return;
    }
    router.push(`/login/confirmar?telefone=${encodeURIComponent(phone)}&nome=${encodeURIComponent(nome)}`);
  }

  return (
    <main className="flex flex-1 flex-col px-6">
      <div className="pt-11 text-center">
        <img src="/logo/logo.png" alt="Logo" className="mx-auto h-30 w-auto" />
      </div>
      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Seu nome</label>
      <div className="mt-2 mb-4 flex items-center gap-2.5 rounded-xl border border-border px-3.5 py-3.5">
        <User size={18} className="text-ink-faint" />
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Como podemos te chamar"
          className="w-full bg-transparent text-sm placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Telefone</label>
      <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-border-strong px-3.5 py-3.5">
        <span className="text-sm font-medium">+55</span>
        <div className="h-4 w-px bg-border-strong" />
        <Smartphone size={18} className="text-ink-faint" />
        <input
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(51) 99999-0000"
          inputMode="tel"
          className="w-full bg-transparent text-sm placeholder:text-ink-faint focus:outline-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">Enviaremos um código pelo WhatsApp para confirmar.</p>

      {erro && <p className="mt-3 text-xs text-red-dark">{erro}</p>}

      <div className="mt-6">
        <Button onClick={handleEntrar} disabled={loading}>
          {loading ? "Enviando código..." : "Entrar"}
        </Button>
      </div>

      <p className="mt-4 mb-8 text-center text-xs leading-relaxed text-ink-faint">
        Ao continuar, você aceita os <span className="font-medium text-red-dark">termos de uso</span> e a{" "}
        <span className="font-medium text-red-dark">política de privacidade</span>.
      </p>
    </main>
  );
}
