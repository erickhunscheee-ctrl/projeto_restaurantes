import Link from "next/link";
import { Wallet, UtensilsCrossed, Receipt, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-green-tint text-[13px] font-medium text-green">
            R
          </div>
          <div>
            <p className="text-[13px] font-medium">Meu restaurante</p>
            <p className="text-[11px] text-ink-soft">Painel do restaurante</p>
          </div>
        </div>
        <Settings size={19} />
      </div>

      <div className="flex-1 overflow-y-auto">{children}</div>

      <nav className="flex justify-around border-t border-border px-5 py-3">
        <Link href="/admin/carteira" className="flex flex-col items-center gap-0.5">
          <Wallet size={19} className="text-green" />
          <span className="text-[10px] font-medium text-green">Carteira</span>
        </Link>
        <Link href="/admin/pratos" className="flex flex-col items-center gap-0.5">
          <UtensilsCrossed size={19} className="text-ink-faint" />
          <span className="text-[10px] text-ink-faint">Pratos</span>
        </Link>
        <Link href="/admin/pedidos" className="flex flex-col items-center gap-0.5">
          <Receipt size={19} className="text-ink-faint" />
          <span className="text-[10px] text-ink-faint">Pedidos</span>
        </Link>
      </nav>
    </div>
  );
}
