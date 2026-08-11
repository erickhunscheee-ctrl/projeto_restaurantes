"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmarDono({ searchParams }: { searchParams: Promise<{ telefone?: string; nome?: string }> }) {
  const { telefone = "", nome = "" } = use(searchParams);
  const router = useRouter(); const [codigo, setCodigo] = useState(""); const [erro, setErro] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  async function confirmar() {
    setLoading(true); setErro(null);
    const supabase = createClient(); const { data, error } = await supabase.auth.verifyOtp({ phone: telefone, token: codigo, type: "sms" });
    if (error || !data.user) { setLoading(false); return setErro(error?.message ?? "Código inválido."); }
    const result = await fetch("/api/admin/registrar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome }) });
    if (!result.ok) { setLoading(false); return setErro((await result.json()).error ?? "Não foi possível criar o acesso."); }
    router.push("/admin/carteira");
  }
  return <main className="flex flex-1 flex-col justify-center px-6"><h1 className="text-center text-lg font-medium">Confirme o código</h1><p className="mt-2 text-center text-sm text-ink-soft">Enviamos um SMS para {telefone}</p><input value={codigo} onChange={e => setCodigo(e.target.value)} maxLength={6} inputMode="numeric" placeholder="000000" className="mt-6 rounded-xl border border-border-strong px-3 py-4 text-center text-lg tracking-[.4em] outline-none" />{erro && <p className="mt-3 text-center text-xs text-red-dark">{erro}</p>}<div className="mt-5"><Button onClick={confirmar} disabled={loading || codigo.length < 4}>{loading ? "Confirmando..." : "Confirmar acesso"}</Button></div></main>;
}
