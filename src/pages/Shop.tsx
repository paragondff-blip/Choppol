import { useState, useEffect } from 'react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { Link, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Shop() {
  const { products } = useProductStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search')?.toLowerCase() || '';
  const initialCategory = queryParams.get('category') || 'all';

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  let filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery) ||
      (p as any).brand?.toLowerCase().includes(searchQuery) ||
      p.description?.toLowerCase().includes(searchQuery)
    );
  }

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {searchQuery && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Search results for "{searchQuery}"</h2>
          <p className="text-gray-500">{filteredProducts.length} items found</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 space-y-8 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    selectedCategory === cat ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No products found for this search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                  <div className="relative aspect-square overflow-hidden bg-gray-100 block group/img">
                    <Link to={`/product/${product.id}`} className="w-full h-full block">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="object-cover w-full h-full group-hover/img:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    {product.originalPrice && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded pointer-events-none">
                        SALE
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-colors z-10 
                        ${isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500'}
                      `}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <div className="p-5 flex flex-col flex-1 hide-scrollbar">
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <Link to={`/product/${product.id}`} className="font-semibold text-gray-900 mb-2 truncate hover:underline">{product.title}</Link>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-lg font-bold text-gray-900">৳{product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-500 line-through">৳{product.originalPrice}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => addItem(product, 1, product.sizes?.[0] ?? null, product.colors?.[0] ?? null)}
                      className="mt-auto w-full py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Quick Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
