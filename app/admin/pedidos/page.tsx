import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default async function AdminPedidosPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: establishment } = await supabase
    .from("establishments")
    .select("id")
    .eq("owner_id", userData.user?.id)
    .single();

  const { data: orders } = establishment
    ? await supabase
        .from("orders")
        .select("*")
        .eq("establishment_id", establishment.id)
        .order("criado_em", { ascending: false })
    : { data: [] };

  const pedidos = (orders ?? []) as Order[];

  return (
    <div className="px-5 pt-5 pb-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-red-dark">Pedidos recebidos</p>
      {pedidos.length === 0 && <p className="py-10 text-center text-sm text-ink-soft">Nenhum pedido ainda.</p>}
      <div className="flex flex-col gap-2.5">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="flex items-center justify-between rounded-2xl border border-border p-3">
            <div>
              <p className="text-[13px] font-medium">#{pedido.id.slice(0, 8)}</p>
              <p className="mt-0.5 text-xs capitalize text-ink-soft">{pedido.status.replace("_", " ")}</p>
            </div>
            <span className="text-[13px] font-medium text-red-dark">{formatBRL(pedido.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
