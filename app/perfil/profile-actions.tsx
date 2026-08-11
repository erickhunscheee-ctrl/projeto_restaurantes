"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function NotificationToggle({ userId, initialValue }: { userId: string; initialValue: boolean }) {
  const [active, setActive] = useState(initialValue);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (saving) return;
    const next = !active;
    setActive(next);
    setSaving(true);
    const { error } = await createClient()
      .from("profiles")
      .update({ notificacoes_ativas: next })
      .eq("id", userId);
    if (error) setActive(!next);
    setSaving(false);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label="Ativar notificações"
      disabled={saving}
      onClick={toggle}
      className={`relative h-5 w-[34px] rounded-full transition-colors ${active ? "bg-green" : "bg-border-strong"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg transition-all ${active ? "right-0.5" : "left-0.5"}`} />
    </button>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-border px-3 py-3 text-[13px] font-medium text-red-dark disabled:opacity-50"
    >
      <LogOut size={16} /> {loading ? "Saindo..." : "Sair da conta"}
    </button>
  );
}
