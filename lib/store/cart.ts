import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";

type CartState = {
  establishmentId: string | null;
  establishmentNome: string | null;
  items: CartItem[];
  /** Retorna false quando o item é de outro estabelecimento — a UI deve
   *  perguntar ao usuário se quer esvaziar o carrinho antes de tentar de novo. */
  addItem: (item: CartItem, establishmentNome: string) => boolean;
  removeItem: (index: number) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      establishmentId: null,
      establishmentNome: null,
      items: [],

      addItem: (item, establishmentNome) => {
        const state = get();
        if (state.establishmentId && state.establishmentId !== item.establishment_id) {
          // Carrinho ativo é de outro estabelecimento — regra de negócio central.
          return false;
        }
        set({
          establishmentId: item.establishment_id,
          establishmentNome,
          items: [...state.items, item],
        });
        return true;
      },

      removeItem: (index) => {
        set((state) => {
          const items = state.items.filter((_, i) => i !== index);
          return {
            items,
            establishmentId: items.length ? state.establishmentId : null,
            establishmentNome: items.length ? state.establishmentNome : null,
          };
        });
      },

      clear: () => set({ establishmentId: null, establishmentNome: null, items: [] }),

      subtotal: () =>
        get().items.reduce((total, item) => {
          const opcoes = item.opcoes_selecionadas.reduce((s, o) => s + o.preco_adicional, 0);
          return total + (item.preco_unitario + opcoes) * item.quantidade;
        }, 0),
    }),
    { name: "marmita-ja-cart" }
  )
);
