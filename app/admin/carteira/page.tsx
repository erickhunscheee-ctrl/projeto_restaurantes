import { Wallet as WalletIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import type { Wallet } from "@/lib/types";

export default async function CarteiraPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: establishment } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", userData.user?.id)
    .single();

  const { data: wallet } = establishment
    ? await supabase.from("wallets").select("*").eq("establishment_id", establishment.id).single()
    : { data: null };

  const w = wallet as Wallet | null;

  return (
    <div className="px-5 pt-4">
      <div className="rounded-2xl bg-green px-4.5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-neutral-000/70">Saldo disponível</p>
            <p className="mt-1 text-[26px] font-semibold text-bg">
              {formatBRL(w?.saldo_disponivel ?? 0)}
            </p>
          </div>
          <WalletIcon size={22} className="text-neutral-000/70" />
        </div>
        <div className="mt-3.5 flex gap-4.5 border-t border-white/15 pt-3">
          <div>
            <p className="text-[10px] text-neutral-000/70">Recebido hoje</p>
            <p className="mt-0.5 text-[13px] font-medium text-bg">{formatBRL(w?.recebido_hoje ?? 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-000/70">A receber</p>
            <p className="mt-0.5 text-[13px] font-medium text-bg">{formatBRL(w?.a_receber ?? 0)}</p>
          </div>
        </div>
        <button className="mt-3.5 w-full rounded-[10px] bg-bg py-2.5 text-[13px] font-medium text-green">
          Sacar saldo
        </button>
      </div>

      {!w && (
        <p className="mt-4 text-center text-xs text-ink-soft">
          Nenhuma carteira encontrada para este estabelecimento ainda.
        </p>
      )}
    </div>
  );
}
