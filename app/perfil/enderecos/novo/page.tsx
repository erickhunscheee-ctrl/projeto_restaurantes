"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function NovoEnderecoPage() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!label.trim() || address.trim().length < 3) return setError("Preencha o rótulo e o endereço.");
    setSaving(true); setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.replace("/login");
    const { error: insertError } = await supabase.from("addresses").insert({
      user_id: user.id,
      rotulo: label.trim(),
      endereco: address.trim(),
      padrao: isDefault,
    });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    router.push("/perfil");
    router.refresh();
  }

  return <main className="flex flex-1 flex-col">
    <header className="flex items-center gap-3 border-b border-border px-5 py-[18px]">
      <Link href="/perfil" aria-label="Voltar"><ArrowLeft size={19} /></Link>
      <h1 className="text-base font-medium">Novo endereço</h1>
    </header>
    <div className="px-5 pt-6">
      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Rótulo</label>
      <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Casa, Trabalho..." maxLength={40} className="mb-4 mt-2 w-full rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Endereço completo</label>
      <textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Rua, número, complemento e bairro" rows={4} maxLength={300} className="mt-2 w-full resize-none rounded-xl border border-border-strong px-3.5 py-3.5 text-sm outline-none" />
      <button type="button" onClick={() => setIsDefault((value) => !value)} className="mt-4 flex items-center gap-2.5 text-[13px]">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${isDefault ? "border-green bg-green text-bg" : "border-border-strong"}`}>{isDefault && <Check size={14} />}</span>
        Definir como endereço padrão
      </button>
      {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
      <div className="mt-6"><Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar endereço"}</Button></div>
    </div>
  </main>;
}
