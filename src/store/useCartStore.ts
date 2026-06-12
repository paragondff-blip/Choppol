import { create } from 'zustand';
import { Product } from './useProductStore';

interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedSize: string | number | null;
  selectedColor: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedSize: string | number | null, selectedColor: string | null) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyVoucher: (discountPercentage: number, code: string) => void;
  removeVoucher: () => void;
  total: number;
  discountPercentage: number;
  voucherCode: string | null;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  discountPercentage: 0,
  voucherCode: null,
  applyVoucher: (discountPercentage, code) => {
    set({ discountPercentage, voucherCode: code });
  },
  removeVoucher: () => {
    set({ discountPercentage: 0, voucherCode: null });
  },
  addItem: (product, quantity, selectedSize, selectedColor) => {
    set((state) => {
      let activePrice = product.price;
      if (product.sizeVariants && product.sizeVariants.length > 0) {
        const sizeObj = product.sizeVariants.find(s => s.size === selectedSize);
        if (sizeObj && sizeObj.priceModifier) activePrice += sizeObj.priceModifier;
      }

      const existingItem = state.items.find(
        (i) => i.id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map((i) =>
          i.cartItemId === existingItem.cartItemId
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        newItems = [
          ...state.items,
          {
            ...product,
            price: activePrice,
            cartItemId: Math.random().toString(36).substring(7),
            quantity,
            selectedSize,
            selectedColor,
          },
        ];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    });
  },
  removeItem: (cartItemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.cartItemId !== cartItemId);
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    });
  },
  updateQuantity: (cartItemId, quantity) => {
    set((state) => {
      if (quantity < 1) return state;
      const newItems = state.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, quantity } : i
      );
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return { items: newItems, total: newTotal };
    });
  },
  clearCart: () => set({ items: [], total: 0, discountPercentage: 0, voucherCode: null }),
}));
