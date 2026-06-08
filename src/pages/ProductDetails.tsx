import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useProductStore } from '../store/useProductStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { ArrowLeft, Star, ShoppingCart, CheckCircle, Heart } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { products } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  
  const product = products.find(p => p.id === id);
  
  const [selectedSize, setSelectedSize] = useState<number | string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setMainImage(product.imageUrl);
      setSelectedSize(product.sizes?.[0] || null);
      if ((product as any).colors) {
        setSelectedColor((product as any).colors[0]);
      }
    }
  }, [product]);

  if (!product) {
    return <div className="p-12 text-center text-xl">Product not found.</div>;
  }

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addItem(product, quantity, selectedSize, selectedColor);
      navigate('/cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-black mb-8 transition">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {[product.imageUrl, ...product.images].map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 ${mainImage === img ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">{product.brand}</span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-4">{product.title}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-500">
              <Star className="w-5 h-5 fill-current" />
              <span className="ml-1 font-bold text-gray-900">{product.rating}</span>
            </div>
            <span className="text-gray-500 underline cursor-pointer">{product.reviews} reviews</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">৳{product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">৳{product.originalPrice}</span>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Select Size (EU)</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center rounded-lg font-medium border transition ${
                      selectedSize === size 
                      ? 'border-black bg-black text-white' 
                      : 'border-gray-200 text-gray-900 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Select Color</h3>
              <div className="flex gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action */}
          <div className="flex gap-4 mt-auto pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2 w-32 shrink-0">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl font-medium px-2 text-gray-500 hover:text-black">-</button>
              <span className="font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="text-xl font-medium px-2 text-gray-500 hover:text-black">+</button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="flex-1 flex justify-center items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-black/10"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`flex items-center justify-center p-4 border rounded-xl transition-colors shrink-0
                ${isInWishlist(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}
              `}
            >
              <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>
          
          <div className="mt-8 bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
            <p className="flex items-center gap-2 font-medium text-gray-900 mb-1"><CheckCircle className="w-4 h-4 text-green-500"/> In Stock ({product.stock} available)</p>
            <p>Free standard shipping on orders over ৳5000.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline icon since lucide might not import it
function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  )
}
