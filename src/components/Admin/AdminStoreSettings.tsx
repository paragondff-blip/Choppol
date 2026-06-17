import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { StoreSettings } from '../../types';
import { Settings, Percent, DollarSign, CreditCard } from 'lucide-react';
import ImagePicker from './ImagePicker';

export default function AdminStoreSettings() {
  const [data, setData] = useState<StoreSettings>({
    storeName: 'CHOPPOL',
    storeLogoUrl: '',
    headerLinks: [
      { label: 'Home', url: '/' },
      { label: 'Shop', url: '/shop' },
      { label: 'About Us', url: '/about' },
      { label: 'Blog', url: '/blog' },
      { label: 'Track Order', url: '/track-order' }
    ],
    signupDiscountPercentage: 10,
    signupDiscountEnabled: true,
    paymentMethods: {
      bkash: '',
      nagad: '',
      upay: '',
      bank: ''
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'store'));
        if (docSnap.exists()) {
          setData(docSnap.data() as StoreSettings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), data);
      alert('Saved');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="mb-6 flex items-center">
        <Settings className="w-8 h-8 text-black mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
          <p className="text-sm text-gray-500">Manage discounts and payment gateways.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Global Metadata */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center mb-6">
            <Settings className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">General Information</h3>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input 
              type="text" 
              value={data.storeName || ''} 
              onChange={(e) => setData({ ...data, storeName: e.target.value })} 
              className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black"
              placeholder="e.g. CHOPPOL"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Logo</label>
            <ImagePicker 
               label="Upload Logo (Optional)" 
               folder="site_assets" 
               currentImageUrl={data.storeLogoUrl} 
               onImageSelected={(url) => setData({...data, storeLogoUrl: url})} 
            />
          </div>
          <div>
            <div className="flex justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">Header Navigation Links</label>
              <button 
                type="button" 
                onClick={() => setData({ ...data, headerLinks: [...(data.headerLinks || []), { label: '', url: '' }] })}
                className="text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                + Add Link
              </button>
            </div>
            <div className="space-y-3">
              {(data.headerLinks || []).map((link, idx) => (
                <div key={idx} className="flex gap-4">
                  <input 
                    type="text" 
                    value={link.label} 
                    onChange={(e) => {
                      const newLinks = [...(data.headerLinks || [])];
                      newLinks[idx].label = e.target.value;
                      setData({ ...data, headerLinks: newLinks });
                    }} 
                    placeholder="Link Label (e.g. Home)"
                    className="flex-1 px-4 py-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-black"
                  />
                  <input 
                    type="text" 
                    value={link.url} 
                    onChange={(e) => {
                      const newLinks = [...(data.headerLinks || [])];
                      newLinks[idx].url = e.target.value;
                      setData({ ...data, headerLinks: newLinks });
                    }} 
                    placeholder="URL Path (e.g. /shop)"
                    className="flex-1 px-4 py-2 bg-white border rounded-lg outline-none focus:ring-2 focus:ring-black"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newLinks = [...(data.headerLinks || [])];
                      newLinks.splice(idx, 1);
                      setData({ ...data, headerLinks: newLinks });
                    }}
                    className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discount Settings */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center mb-6">
            <Percent className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Sign Up / Login Discount</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={data.signupDiscountEnabled} 
                  onChange={(e) => setData({ ...data, signupDiscountEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">Enable Discount</span>
              </label>
            </div>
            {data.signupDiscountEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={data.signupDiscountPercentage} 
                  onChange={(e) => setData({ ...data, signupDiscountPercentage: Number(e.target.value) })} 
                  className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Settings */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center mb-6">
            <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Payment Accounts (Mobile Banking)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">bKash Personal Number</label>
              <input 
                type="text" 
                value={data.paymentMethods.bkash} 
                onChange={(e) => setData({ ...data, paymentMethods: { ...data.paymentMethods, bkash: e.target.value } })} 
                className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. 017XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Personal Number</label>
              <input 
                type="text" 
                value={data.paymentMethods.nagad} 
                onChange={(e) => setData({ ...data, paymentMethods: { ...data.paymentMethods, nagad: e.target.value } })} 
                className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. 016XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upay Personal Number</label>
              <input 
                type="text" 
                value={data.paymentMethods.upay} 
                onChange={(e) => setData({ ...data, paymentMethods: { ...data.paymentMethods, upay: e.target.value } })} 
                className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. 019XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Instructions</label>
              <textarea 
                rows={3}
                value={data.paymentMethods.bank} 
                onChange={(e) => setData({ ...data, paymentMethods: { ...data.paymentMethods, bank: e.target.value } })} 
                className="w-full px-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-black resize-none"
                placeholder="Bank Name, Account Name, Account No, Branch etc."
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
