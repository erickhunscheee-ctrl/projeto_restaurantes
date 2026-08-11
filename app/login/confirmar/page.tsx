"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmarLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ telefone?: string; nome?: string }>;
}) {
  const { telefone = "", nome = "" } = use(searchParams);
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConfirmar() {
    setLoading(true);
    setErro(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      phone: telefone,
      token: codigo,
      type: "sms",
    });

    if (error || !data.user) {
      setLoading(false);
      setErro(error?.message ?? "Código inválido.");
      return;
    }

    // Garante que o perfil (nome + telefone) existe na tabela `profiles`.
    await supabase.from("profiles").upsert({
      id: data.user.id,
      nome,
      telefone,
    });

    setLoading(false);
    router.push("/restaurantes");
  }

  return (
    <main className="flex flex-1 flex-col justify-center px-6">
      <p className="text-center text-lg font-medium">Confirme seu código</p>
      <p className="mt-1.5 text-center text-sm text-ink-soft">
        Enviamos um SMS para {telefone}
      </p>

      <div className="mt-6">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          className="w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-center text-lg tracking-[0.4em] focus:outline-none"
        />
      </div>

      {erro && <p className="mt-3 text-center text-xs text-red-dark">{erro}</p>}

      <div className="mt-5">
        <Button onClick={handleConfirmar} disabled={loading || codigo.length < 4}>
          {loading ? "Confirmando..." : "Confirmar"}
        </Button>
      </div>
    </main>
  );
}
