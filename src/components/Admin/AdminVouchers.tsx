import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { performAdminAction } from '../../lib/admin-utils';

export default function AdminVouchers({ vouchers: initialVouchers, fetchData }: any) {
  const [localVouchers, setLocalVouchers] = useState<any[]>(initialVouchers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountPercentage: '10' });
  const { user } = useAuthStore();

  useEffect(() => {
    setLocalVouchers(initialVouchers);
  }, [initialVouchers]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newVoucher = {
      code: formData.code.toUpperCase() || `ADMIN-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
      discountPercentage: Number(formData.discountPercentage),
      isUsed: false,
      createdAt: Date.now()
    };
    
    try {
      const vid = Date.now().toString();
      const result = await performAdminAction(user, 'vouchers' as any, 'create', vid, newVoucher, 'vouchers');
      if (result.status === 'pending_approval') {
        alert('Voucher creation submitted for approval!');
      } else {
        fetchData();
        alert('Submitted');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('Delete this voucher?')) {
      try {
        const result = await performAdminAction(user, 'vouchers' as any, 'delete', id, {}, 'vouchers');
        if (result.status === 'pending_approval') {
           alert('Delete submitted for approval!');
        } else {
           fetchData();
           alert('Deleted');
        }
      } catch (err: any) {
        console.error(err);
      }
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Vouchers</h2>
        <button 
          onClick={() => { setFormData({ code: `SUMMER${Math.floor(Math.random() * 100)}`, discountPercentage: '15' }); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Voucher
        </button>
      </div>

      {localVouchers.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">No vouchers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {localVouchers.map((v: any) => (
            <div key={v.id} className={`p-5 border rounded-xl relative ${v.isUsed ? 'bg-gray-50 border-gray-200' : 'bg-white border-green-200'}`}>
              <button onClick={() => handleDelete(v.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded transition"><Trash className="w-4 h-4" /></button>
              <h3 className="font-mono text-lg font-bold text-gray-900 mb-1">{v.code}</h3>
              <p className="text-green-600 font-bold mb-3">{v.discountPercentage}% OFF</p>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className={`text-xs font-bold px-2 py-1 rounded ${v.isUsed ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                  {v.isUsed ? 'USED' : 'ACTIVE'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(v.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-sm shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create Voucher</h3>
            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Code</label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono uppercase" placeholder="e.g. SUMMER15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input required type="number" min="1" max="100" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
