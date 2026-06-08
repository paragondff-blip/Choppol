import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/useWishlistStore';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function Wishlist() {
  const { items, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Wishlist is Empty</h2>
        <p className="text-gray-500 mb-8">You haven't saved any items yet. Start exploring and add your favorites!</p>
        <Link to="/shop" className="inline-flex items-center text-white bg-black px-6 py-3 rounded-full hover:bg-gray-800 transition-colors">
          Explore Products <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((product) => (
          <div key={product.id} className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
              />
              <button 
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 p-2 bg-white text-red-500 rounded-full shadow-sm hover:bg-red-50 transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-500 mb-1">{product.category}</p>
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                  <Link to={`/product/${product.id}`} className="hover:underline">{product.title}</Link>
                </h3>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="font-bold text-gray-900 text-lg">৳{product.price}</p>
                <button 
                  onClick={() => addItem(product, 1, product.sizes?.[0] ?? null, product.colors?.[0] ?? null)}
                  className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
