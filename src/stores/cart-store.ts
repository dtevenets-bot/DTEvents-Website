import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  updateQuantity: (productId: string, quantity: number) => void;
  itemCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item: CartItem) => {
    const { items } = get();
    const existingIndex = items.findIndex(
      (i) => i.productId === item.productId
    );

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += item.quantity;
      set({ items: updated });
    } else {
      set({ items: [...items, item] });
    }
  },

  removeItem: (productId: string) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
  },

  clearCart: () => {
    set({ items: [] });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const { items } = get();
    const updated = items.map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    set({ items: updated });
  },

  itemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  totalPrice: () => {
    return get().items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  },
}));
