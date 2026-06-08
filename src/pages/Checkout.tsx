import { useState, FormEvent } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';

export default function Checkout() {
  const { items, total, clearCart, discountPercentage, voucherCode } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const shippingCost = total > 5000 ? 0 : 150;
  const discountAmount = Math.round((total * discountPercentage) / 100);
  const grandTotal = total - discountAmount + shippingCost;

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    // Require login
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      const orderId = doc(collection(db, 'orders')).id;
      const orderData = {
        userId: user.uid,
        items: items,
        totalAmount: grandTotal,
        discountApplied: discountAmount,
        voucherCode: voucherCode,
        status: 'pending',
        shippingAddress: shippingDetails,
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      
      if (voucherCode) {
        const q = query(collection(db, 'vouchers'), where('code', '==', voucherCode));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const vDoc = snap.docs[0];
          await updateDoc(doc(db, 'vouchers', vDoc.id), { isUsed: true });
        }
      }

      clearCart();
      setSuccess(true);
      
    } catch (err) {
      console.error("Failed to place order", err);
      alert("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
        <p className="text-lg text-gray-600 mb-8">Thank you for shopping with CHOPPOL. Your order is now pending confirmation.</p>
        <Link to="/dashboard" className="inline-flex py-3 px-6 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
          View Order in Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Details</h3>
            <form id="checkout-form" className="space-y-4" onSubmit={handlePlaceOrder}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-black focus:border-black" value={shippingDetails.fullName} onChange={e => setShippingDetails({...shippingDetails, fullName: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input required type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-black focus:border-black" value={shippingDetails.phone} onChange={e => setShippingDetails({...shippingDetails, phone: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Address</label>
                <textarea required rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-black focus:border-black" value={shippingDetails.address} onChange={e => setShippingDetails({...shippingDetails, address: e.target.value})}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Region</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-black focus:border-black" value={shippingDetails.city} onChange={e => setShippingDetails({...shippingDetails, city: e.target.value})}/>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'cod' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="cod" checked={shippingDetails.paymentMethod === 'cod'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Cash on Delivery</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="bkash" checked={shippingDetails.paymentMethod === 'bkash'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">bKash</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'nagad' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="nagad" checked={shippingDetails.paymentMethod === 'nagad'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Nagad</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'rocket' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="rocket" checked={shippingDetails.paymentMethod === 'rocket'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Rocket</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'upay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="upay" checked={shippingDetails.paymentMethod === 'upay'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Upay</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'sslcommerz' ? 'border-black bg-gray-100' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="sslcommerz" checked={shippingDetails.paymentMethod === 'sslcommerz'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-black focus:ring-black border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">SSLCommerz (Cards/Net Banking)</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'aamarpay' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="aamarpay" checked={shippingDetails.paymentMethod === 'aamarpay'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">aamarpay</span>
                </label>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="flex gap-3 items-center">
                    <img src={item.imageUrl} alt={item.title} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 border-t border-gray-200 pt-4 mb-4">
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
                <span className="font-medium text-gray-900">{shippingCost === 0 ? 'Free' : `৳${shippingCost}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>৳{grandTotal}</span>
              </div>
            </div>
            
            {!user ? (
               <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl mb-4 text-sm font-medium">
                 You must be logged in to place an order. <Link to="/login" className="underline font-bold">Login here</Link>
               </div>
            ) : null}

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || items.length === 0 || !user}
              className="w-full flex items-center justify-center py-3 px-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
