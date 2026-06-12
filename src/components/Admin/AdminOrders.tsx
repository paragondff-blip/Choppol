import React from 'react';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminOrders({ orders, fetchData }: any) {
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchData();
      alert('Saved');
    } catch (err: any) {
      console.error(err);
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Orders</h2>
      
      {orders.length === 0 ? (
        <p className="text-gray-500 py-12 text-center text-lg">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50">
              <div className="flex max-md:flex-col justify-between md:items-center gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-2">Order: {order.id}</h4>
                  <p className="text-sm text-gray-600"><strong>Customer:</strong> {order.shippingAddress?.fullName} ({order.shippingAddress?.phone})</p>
                  <p className="text-sm text-gray-600"><strong>Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 mb-2">৳{order.totalAmount}</p>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded font-medium text-sm focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-bold text-gray-900 mb-2">Items:</p>
                <div className="flex flex-wrap gap-2">
                  {order.items?.map((item: any, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 shadow-sm">
                      {item.quantity}x {item.title} (Sz: {item.selectedSize})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
