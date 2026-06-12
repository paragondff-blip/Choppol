import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, TrendingUp, Truck, Heart, Headphones, RotateCcw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { HomePageData } from '../types';

const IconMap: any = {
  Truck: Truck,
  Headphones: Headphones,
  RotateCcw: RotateCcw,
  ShieldCheck: ShieldCheck,
  Star: Star,
  TrendingUp: TrendingUp
};

export default function Home() {
  const { products } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState<HomePageData>({
    hero: {
      title: 'Step Into Style',
      subtitle: 'Discover the latest collection of premium footwear designed for ultimate comfort and elegance.',
      ctaText: 'Shop New Arrivals',
      ctaUrl: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=2000'
    },
    heroSlides: [],
    features: [
      { title: 'Free Shipping', desc: 'On all orders over ৳5000', icon: 'Truck' },
      { title: 'Premium Quality', desc: '30-day wear guarantee', icon: 'Star' },
      { title: 'Secure Payment', desc: 'bKash, Nagad & Cards', icon: 'ShieldCheck' }
    ],
    banners: [
      { title: 'Sneakers', subtitle: '', cta: 'Shop Collection', url: '/shop?category=sneakers', image: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&q=80&w=1000', color: '' },
      { title: 'Formal & Loafers', subtitle: '', cta: 'Shop Collection', url: '/shop?category=formal', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1000', color: '' }
    ]
  });

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'home'));
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as HomePageData;
          if (!fetchedData.heroSlides || fetchedData.heroSlides.length === 0) {
            fetchedData.heroSlides = [fetchedData.hero];
          }
          setData(fetchedData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHome();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (data.heroSlides?.length || 1));
  }, [data.heroSlides]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (data.heroSlides?.length || 1)) % (data.heroSlides?.length || 1));
  };

  useEffect(() => {
    if (!loading && data.heroSlides && data.heroSlides.length > 1) {
      const interval = setInterval(nextSlide, 5000); // 5 seconds per slide
      return () => clearInterval(interval);
    }
  }, [loading, data.heroSlides, nextSlide]);

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="space-y-16 pb-16 animate-in fade-in duration-700">
      {/* Hero Slider Section */}
      <section className="relative h-[80vh] bg-gray-900 text-white overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute inset-0 z-0">
              <img 
                src={data.heroSlides[currentSlide]?.imageUrl || data.hero.imageUrl} 
                alt={data.heroSlides[currentSlide]?.title || data.hero.title} 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
            </div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase leading-[0.9]"
              >
                {data.heroSlides[currentSlide]?.title || data.hero.title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
              >
                {data.heroSlides[currentSlide]?.subtitle || data.hero.subtitle}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              >
                <Link 
                  to={data.heroSlides[currentSlide]?.ctaUrl || data.hero.ctaUrl} 
                  className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {data.heroSlides[currentSlide]?.ctaText || data.hero.ctaText}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        {data.heroSlides?.length > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-8 flex justify-center gap-2 z-20">
              {data.heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'w-8 bg-white' : 'bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition text-white hidden md:block z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition text-white hidden md:block z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 py-10 border-y border-gray-100">
          {data.features.map((feature, idx) => {
            const Icon = IconMap[feature.icon] || Truck;
            return (
              <div key={idx} className="flex items-center gap-4 justify-center">
                <div className="p-3 bg-gray-50 text-black border border-gray-100 rounded-2xl"><Icon className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Trending Now</h2>
            <p className="text-sm text-gray-500 mt-1">Our most popular styles this week.</p>
          </div>
          <Link to="/shop" className="px-4 py-2 border border-gray-200 rounded-full text-black font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {featuredProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] md:aspect-square overflow-hidden rounded-2xl bg-gray-50 mb-4 block group/img">
                <Link to={`/product/${product.id}`} className="w-full h-full block">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="object-cover w-full h-full group-hover/img:scale-110 transition-transform duration-700"
                  />
                </Link>
                {product.originalPrice && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full pointer-events-none">
                    SALE
                  </span>
                )}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    toggleWishlist(product);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all z-10 scale-90 md:scale-100
                    ${isInWishlist(product.id) ? 'bg-red-50 text-red-500' : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500'}
                  `}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
              <div className="space-y-1 px-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
                <h3 className="font-bold text-gray-900 line-clamp-1 text-sm md:text-base">
                  <Link to={`/product/${product.id}`} className="hover:underline">{product.title}</Link>
                </h3>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900">৳{product.price}</p>
                  {product.originalPrice && (
                    <p className="text-xs text-gray-400 line-through">৳{product.originalPrice}</p>
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
          {data.banners.map((banner, idx) => (
            <div key={idx} className="relative h-[400px] rounded-3xl overflow-hidden group">
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                <p className="text-white/70 text-sm font-medium mb-1">{banner.subtitle}</p>
                <h3 className="text-4xl font-bold text-white mb-4 leading-tight">{banner.title}</h3>
                <Link to={banner.url} className="w-fit px-6 py-2.5 bg-white text-black font-bold text-sm rounded-full hover:bg-gray-100 transition-all flex items-center gap-2 group/btn">
                  {banner.cta} 
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
