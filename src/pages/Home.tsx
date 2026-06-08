import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Truck, Heart } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';

export default function Home() {
  const { products } = useProductStore();
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1556906781-9a412961c28c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase">Walk Your Style</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Discover premium footwear engineered for comfort and designed for distinction. Step into the future with CHOPPOL.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link 
              to="/shop" 
              className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Shop New Arrivals
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-200">
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-black text-white rounded-full"><Truck className="w-6 h-6" /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Free Nationwide Delivery</h3>
              <p className="text-sm text-gray-500">On orders over ৳5000</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:border-x border-gray-200">
            <div className="p-3 bg-black text-white rounded-full"><Star className="w-6 h-6" /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Premium Quality</h3>
              <p className="text-sm text-gray-500">30-day wear guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <div className="p-3 bg-black text-white rounded-full"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Payments</h3>
              <p className="text-sm text-gray-500">bKash, Nagad & Cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Trending Now</h2>
          <Link to="/shop" className="text-black font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 mb-4 block group/img">
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
              <div className="space-y-1">
                <p className="text-sm text-gray-500">{product.brand}</p>
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  <Link to={`/product/${product.id}`} className="hover:underline">{product.title}</Link>
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">৳{product.price}</p>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">৳{product.originalPrice}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Sneakers" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-2">Sneakers</h3>
              <Link to="/shop?category=sneakers" className="text-white hover:underline flex items-center gap-2">Shop Collection <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Formal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8">
              <h3 className="text-3xl font-bold text-white mb-2">Formal & Loafers</h3>
              <Link to="/shop?category=formal" className="text-white hover:underline flex items-center gap-2">Shop Collection <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
