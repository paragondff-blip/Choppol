import { create } from 'zustand';
import { MOCK_PRODUCTS } from '../lib/data';

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  category: string;
  brand: string;
  badge?: string;
  description?: string;
  colors?: string[];
  stock: number;
  rating: number;
  reviews: number;
  sizes: (string | number)[];
}

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: MOCK_PRODUCTS as unknown as Product[],
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  }))
}));
