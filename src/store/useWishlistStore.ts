import { create } from 'zustand';
import { Product } from './useProductStore';

interface WishlistStore {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  toggleWishlist: (product) => {
    set((state) => {
      const exists = state.items.some((i) => i.id === product.id);
      if (exists) {
        return { items: state.items.filter((i) => i.id !== product.id) };
      } else {
        return { items: [...state.items, product] };
      }
    });
  },
  isInWishlist: (productId) => {
    return get().items.some((i) => i.id === productId);
  },
}));
