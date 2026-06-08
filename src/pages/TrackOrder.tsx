import React, { useState } from 'react';
import { Search, Package, CheckCircle } from 'lucide-react';

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTracking(true);
    
    // Simulate order tracking API call
    setTimeout(() => {
      setTracking(false);
      setResult({
        id: orderId,
        status: 'Shipped',
        date: new Date().toLocaleDateString(),
        estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString(),
        courier: 'Pathao Courier'
      });
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-600">Enter your order ID below to check the current status of your shipment.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleTrack} className="flex gap-4">
          <input 
            type="text" 
            placeholder="e.g. ORD-12345"
            required
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button 
            type="submit"
            disabled={tracking}
            className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition flex items-center"
          >
            {tracking ? 'Searching...' : <><Search className="w-5 h-5 mr-2" /> Track</>}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 font-medium">Order ID</p>
                <p className="font-bold text-gray-900">{result.id.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                  {result.status}
                </span>
              </div>
            </div>
            
            <div className="relative pl-8 space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-8 bg-green-500 text-white rounded-full p-1 z-10"><CheckCircle className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Order Confirmed</h4>
                  <p className="text-sm text-gray-500">{result.date}</p>
                </div>
              </div>
              
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-8 bg-black text-white rounded-full p-1 z-10"><Package className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-bold text-gray-900">Handed over to {result.courier}</h4>
                  <p className="text-sm text-gray-500">In transit to destination facility</p>
                </div>
              </div>

              <div className="relative flex items-start gap-4">
                <div className="absolute -left-8 bg-gray-200 border-2 border-white rounded-full p-2 z-10 w-6 h-6"></div>
                <div>
                  <h4 className="font-bold text-gray-400">Out for Delivery</h4>
                  <p className="text-sm text-gray-400">Estimated: {result.estimatedDelivery}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
