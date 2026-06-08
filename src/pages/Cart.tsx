import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, Tag, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, discountPercentage, voucherCode, applyVoucher, removeVoucher } = useCartStore();
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherError, setVoucherError] = useState('');
  const [loadingVoucher, setLoadingVoucher] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setLoadingVoucher(true);
    setVoucherError('');
    try {
      const q = query(collection(db, 'vouchers'), where('code', '==', voucherInput.trim().toUpperCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setVoucherError('Invalid or expired voucher code');
        return;
      }

      const doc = snap.docs[0].data();
      if (doc.isUsed) {
        setVoucherError('This voucher has already been used');
        return;
      }

      applyVoucher(doc.discountPercentage || 0, voucherInput.toUpperCase());
      setVoucherInput('');
    } catch (err) {
      setVoucherError('Error verifying voucher code');
    } finally {
      setLoadingVoucher(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added any premium footwear yet.</p>
        <Link to="/shop" className="inline-flex items-center text-white bg-black px-6 py-3 rounded-full hover:bg-gray-800">
          Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </div>
    );
  }

  const shipping = total > 5000 ? 0 : 150;
  const discountAmount = Math.round((total * discountPercentage) / 100);
  const finalTotal = total - discountAmount + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3 space-y-6">
          {items.map((item) => (
            <div key={item.cartItemId} className="flex gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.brand}</p>
                    <div className="mt-1 flex gap-4 text-sm text-gray-500">
                      <span>Size: {item.selectedSize}</span>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900">৳{item.price * item.quantity}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-2 hover:bg-gray-50 text-gray-600"><Minus className="w-4 h-4" /></button>
                    <span className="px-4 font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-2 hover:bg-gray-50 text-gray-600"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeItem(item.cartItemId)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
            
            {/* Voucher Section */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a voucher code?</label>
              {voucherCode ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium text-sm">{voucherCode} applied</span>
                  </div>
                  <button onClick={removeVoucher} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black focus:outline-none"
                  />
                  <button
                    onClick={handleApplyVoucher}
                    disabled={loadingVoucher || !voucherInput.trim()}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    {loadingVoucher ? '...' : 'Apply'}
                  </button>
                </div>
              )}
              {voucherError && <p className="text-xs text-red-500 mt-2">{voucherError}</p>}
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">৳{total}</span>
              </div>
              {discountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900">{shipping === 0 ? 'Free' : `৳${shipping}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>৳{finalTotal}</span>
              </div>
            </div>
            <Link to="/checkout" className="block w-full mt-8 py-3 px-4 bg-black text-white text-center font-bold rounded-xl hover:bg-gray-800 transition-colors">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
