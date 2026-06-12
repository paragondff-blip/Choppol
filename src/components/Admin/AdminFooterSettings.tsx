import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { performAdminAction } from '../../lib/admin-utils';

export default function AdminFooterSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerData, setFooterData] = useState({
    storeName: 'CHOPPOL',
    aboutText: 'Premium footwear destination offering the latest in sneakers, formal shoes, and comfortable everyday wear.',
    contact: {
      address: 'Level 4, Block B, Bashundhara City Shopping Mall, Panthapath, Dhaka 1215',
      phone: '+880 1711-223344',
      email: 'support@choppol.com'
    },
    quickLinks: [
      { label: 'Shop All', url: '/shop' },
      { label: 'About Us', url: '/p/about' },
      { label: 'Contact Us', url: '/contact' },
      { label: 'Blog', url: '/blog' }
    ],
    customerService: [
      { label: 'Track Order', url: '/track-order' },
      { label: 'Shipping Info', url: '/p/shipping' },
      { label: 'Returns & Refunds', url: '/p/returns' },
      { label: 'FAQ', url: '/p/faq' }
    ]
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const docRef = doc(db, 'settings', 'footer');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFooterData(docSnap.data() as any);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFooter();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const result = await performAdminAction(user, 'footer', 'update', 'footer', footerData, 'settings');
      if (result.status === 'pending_approval') {
        alert('Footer changes submitted for approval!');
      } else {
        alert('Saved');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save footer settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (type: 'quickLinks' | 'customerService', index: number, field: 'label' | 'url', value: string) => {
    const newData = { ...footerData };
    newData[type][index][field] = value;
    setFooterData(newData);
  };

  if (loading) return <div className="text-center py-10">Loading settings...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Footer Settings</h2>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & About */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Brand & About</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input type="text" value={footerData.storeName} onChange={(e) => setFooterData({...footerData, storeName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Text</label>
              <textarea rows={3} value={footerData.aboutText} onChange={(e) => setFooterData({...footerData, aboutText: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
              <input type="text" value={footerData.contact.address} onChange={(e) => setFooterData({...footerData, contact: {...footerData.contact, address: e.target.value}})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={footerData.contact.phone} onChange={(e) => setFooterData({...footerData, contact: {...footerData.contact, phone: e.target.value}})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input type="email" value={footerData.contact.email} onChange={(e) => setFooterData({...footerData, contact: {...footerData.contact, email: e.target.value}})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
            </div>
          </div>
        </div>

        {/* Links sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Links */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-4">
              {footerData.quickLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={link.label} onChange={(e) => updateLink('quickLinks', idx, 'label', e.target.value)} className="w-1/2 px-2 py-1.5 border rounded text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Label" />
                  <input type="text" value={link.url} onChange={(e) => updateLink('quickLinks', idx, 'url', e.target.value)} className="w-1/2 px-2 py-1.5 border rounded text-sm outline-none focus:ring-1 focus:ring-black" placeholder="URL" />
                </div>
              ))}
            </div>
          </div>

          {/* Customer Service Links */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Service</h3>
            <div className="space-y-4">
              {footerData.customerService.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" value={link.label} onChange={(e) => updateLink('customerService', idx, 'label', e.target.value)} className="w-1/2 px-2 py-1.5 border rounded text-sm outline-none focus:ring-1 focus:ring-black" placeholder="Label" />
                  <input type="text" value={link.url} onChange={(e) => updateLink('customerService', idx, 'url', e.target.value)} className="w-1/2 px-2 py-1.5 border rounded text-sm outline-none focus:ring-1 focus:ring-black" placeholder="URL" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
