import { useState, FormEvent, useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Tag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { StoreSettings } from '../types';

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
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    senderAccount: '',
    trxId: ''
  });

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        const storeSnap = await getDoc(doc(db, 'settings', 'store'));
        if (storeSnap.exists()) {
          setStoreSettings(storeSnap.data() as StoreSettings);
        }

        if (user) {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) {
            const uData = userSnap.data();
            setShippingDetails(prev => ({
              ...prev,
              fullName: uData.displayName || (user.displayName ? user.displayName : ''),
              phone: uData.phone || '',
              address: uData.address || '',
              city: uData.city || ''
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching defaults", err);
      } finally {
        setLoadingDefaults(false);
      }
    };
    fetchDefaults();
  }, [user]);

  const activeDiscountPercentage = Math.max(
    discountPercentage, 
    (user && storeSettings?.signupDiscountEnabled) ? storeSettings.signupDiscountPercentage : 0
  );

  const shippingCost = total > 5000 ? 0 : 150;
  const discountAmount = Math.round((total * activeDiscountPercentage) / 100);
  const grandTotal = total - discountAmount + shippingCost;

  const handlePlaceOrder = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (items.length === 0) return;

    if (shippingDetails.paymentMethod !== 'cod' && !showPaymentGateway) {
      setShowPaymentGateway(true);
      return;
    }

    if (showPaymentGateway && shippingDetails.paymentMethod !== 'cod') {
      if (!paymentInfo.senderAccount || !paymentInfo.trxId) {
        alert("Please submit the missing information: Account details and Transaction ID are required.");
        return;
      }
      if (paymentInfo.trxId.length < 5) {
        alert("Please provide a valid Transaction ID. Please submit again.");
        return;
      }
    }

    setLoading(true);

    try {
      const orderId = doc(collection(db, 'orders')).id;
      const orderData = {
        userId: user ? user.uid : 'guest',
        items: items,
        totalAmount: grandTotal,
        discountApplied: discountAmount,
        voucherCode: voucherCode || (activeDiscountPercentage > discountPercentage ? 'SIGNUP_DISCOUNT' : null),
        status: 'pending',
        paymentInfo: shippingDetails.paymentMethod !== 'cod' ? paymentInfo : null,
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

      if (shippingDetails.paymentMethod !== 'cod') {
        alert("Payment submitted complete!");
      } else {
        alert("Order successfully submitted!");
      }

      clearCart();
      setSuccess(true);
      
    } catch (err) {
      console.error("Failed to place order", err);
      alert("Payment not complete. Please submit again.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDefaults) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Loading checkout...</div>;
  }

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Congratulations! Order Successfully completed!</h2>
        <p className="text-lg text-gray-600 mb-8">Thank you for shopping with CHOPPOL. Your order is now confirmed and pending processing.</p>
        <Link to={user ? "/dashboard" : "/shop"} className="inline-flex py-3 px-6 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition">
          {user ? 'View Order in Dashboard' : 'Continue Shopping'}
        </Link>
      </div>
    );
  }

  if (showPaymentGateway) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 capitalize mb-2">Pay with {shippingDetails.paymentMethod}</h2>
            <p className="text-gray-500">Please complete your payment of <span className="font-bold text-black">৳{grandTotal}</span> to confirm the order.</p>
          </div>

          <div className="space-y-6">
            {shippingDetails.paymentMethod === 'bank' ? (
               <div className="space-y-6">
                 <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">1. Enter Your Card / Bank Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Card / Account Number</label>
                      <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date / Branch</label>
                        <input type="text" placeholder="MM/YY or Branch" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secure PIN / CVC</label>
                        <input type="text" placeholder="XXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                      </div>
                    </div>
                 </div>

                 <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-4">
                    <h3 className="font-bold text-gray-900 border-b pb-2">2. Complete Transfer</h3>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm whitespace-pre-wrap">
                      <span className="font-medium">Please transfer <span className="font-bold">৳{grandTotal}</span> to our account:</span>
                      <span className="block mt-2 font-bold text-lg">{storeSettings?.paymentMethods.bank || 'Bank details will be provided soon.'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Bank Account Name / Number</label>
                      <input type="text" value={paymentInfo.senderAccount} onChange={e => setPaymentInfo({...paymentInfo, senderAccount: e.target.value})} placeholder="Enter your name or account number" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Reference / Transaction ID</label>
                      <input type="text" value={paymentInfo.trxId} onChange={e => setPaymentInfo({...paymentInfo, trxId: e.target.value})} placeholder="Enter reference ID" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                    </div>
                 </div>
               </div>
            ) : shippingDetails.paymentMethod === 'bkash' || shippingDetails.paymentMethod === 'nagad' || shippingDetails.paymentMethod === 'upay' ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  Send Money <span className="font-bold">৳{grandTotal}</span> to our {shippingDetails.paymentMethod} Personal Number: 
                  <span className="font-bold text-lg block mt-2">{storeSettings?.paymentMethods[shippingDetails.paymentMethod as keyof typeof storeSettings.paymentMethods] || 'Not configured'}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your {shippingDetails.paymentMethod} Number</label>
                  <input type="text" value={paymentInfo.senderAccount} onChange={e => setPaymentInfo({...paymentInfo, senderAccount: e.target.value})} placeholder="01XXXXXXXXX" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (TrxID)</label>
                  <input type="text" value={paymentInfo.trxId} onChange={e => setPaymentInfo({...paymentInfo, trxId: e.target.value})} placeholder="Enter TrxID" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-black focus:border-black" />
                </div>
              </div>
            ) : (
                <div className="p-4 bg-gray-50 text-center rounded-xl">
                  Redirecting to {shippingDetails.paymentMethod} Gateway...
                </div>
            )}

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setShowPaymentGateway(false)}
                className="w-1/3 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
              >
                Back
              </button>
              <button 
                onClick={() => handlePlaceOrder()}
                disabled={loading}
                className="w-2/3 flex items-center justify-center py-3 px-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Confirm Payment`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      {!user && storeSettings?.signupDiscountEnabled && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center text-blue-800">
            <Tag className="w-5 h-5 mr-3 flex-shrink-0" />
            <span><span className="font-bold">Sign up now</span> and get an instant <span className="font-bold">{storeSettings.signupDiscountPercentage}% discount</span> on your first order!</span>
          </div>
          <Link to="/register" className="whitespace-nowrap px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
            Create Account
          </Link>
        </div>
      )}

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
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'upay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="upay" checked={shippingDetails.paymentMethod === 'upay'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Upay</span>
                </label>
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${shippingDetails.paymentMethod === 'bank' ? 'border-black bg-gray-100' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" value="bank" checked={shippingDetails.paymentMethod === 'bank'} onChange={e => setShippingDetails({...shippingDetails, paymentMethod: e.target.value})} className="h-4 w-4 text-black focus:ring-black border-gray-300" />
                  <span className="ml-3 font-medium text-gray-900">Direct Bank Transfer</span>
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
              {activeDiscountPercentage > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({activeDiscountPercentage}%)</span>
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

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || items.length === 0}
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
