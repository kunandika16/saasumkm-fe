import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem(item: {
    menuItemId: string;
    name: string;
    price: number;
    imageUrl: string | null;
  }): void;
  updateQuantity(menuItemId: string, quantity: number): void;
  removeItem(menuItemId: string): void;
  clearCart(): void;
  getTotal(): number;
  hasUnavailableItems(): boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item) {
        set((state) => {
          const existing = state.items.find(
            (i) => i.menuItemId === item.menuItemId
          );

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.menuItemId === item.menuItemId
                  ? { ...i, quantity: Math.min(i.quantity + 1, 99) }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: 1,
                imageUrl: item.imageUrl,
                isAvailable: true,
              },
            ],
          };
        });
      },

      updateQuantity(menuItemId, quantity) {
        if (quantity < 1) {
          get().removeItem(menuItemId);
          return;
        }

        const clamped = Math.min(Math.max(quantity, 1), 99);

        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: clamped } : i
          ),
        }));
      },

      removeItem(menuItemId) {
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      getTotal() {
        return get().items.reduce((sum, item) => {
          if (!item.isAvailable) return sum;
          return sum + item.price * item.quantity;
        }, 0);
      },

      hasUnavailableItems() {
        return get().items.some((item) => !item.isAvailable);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      skipHydration: true,
    }
  )
);
