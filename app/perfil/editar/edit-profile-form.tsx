"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditProfileForm({ initialName, phone }: { initialName: string; phone: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return setError("Informe seu nome.");
    setSaving(true); setError(null);
    const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome: name.trim() }) });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setError(result.error ?? "Não foi possível atualizar o perfil.");
    router.push("/perfil");
    router.refresh();
  }

  return (
    <div className="px-5 pt-6">
      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Seu nome</label>
      <div className="mb-4 mt-2 flex items-center gap-2.5 rounded-xl border border-border-strong px-3.5 py-3.5">
        <User size={18} className="text-ink-faint" />
        <input value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent text-sm outline-none" />
      </div>
      <label className="text-xs font-medium uppercase tracking-wide text-red-dark">Telefone</label>
      <div className="mt-2 rounded-xl border border-border bg-green-tint px-3.5 py-3.5 text-sm text-ink-soft">{phone || "Não informado"}</div>
      <p className="mt-1.5 text-xs text-ink-faint">O telefone é usado para entrar e não pode ser alterado.</p>
      {error && <p className="mt-3 text-xs text-red-dark">{error}</p>}
      <div className="mt-6"><Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar alterações"}</Button></div>
    </div>
  );
}
