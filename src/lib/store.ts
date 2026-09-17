import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/lib/types";
import { getCartKey } from "@/lib/visitor";

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (productId) => {
        getCartKey();
        const items = [...get().items];
        const found = items.find((item) => item.productId === productId);
        if (found) found.qty += 1;
        else items.push({ productId, qty: 1 });
        set({ items, open: true });
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((item) => item.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, qty } : item,
          ),
        });
      },
      remove: (productId) =>
        set({ items: get().items.filter((item) => item.productId !== productId) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    { name: "velora-cart" },
  ),
);
