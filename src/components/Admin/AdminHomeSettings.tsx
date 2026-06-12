import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Save, Layout, Sparkles, LayoutGrid, Plus, Trash } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { HomePageData } from '../../types';
import { performAdminAction } from '../../lib/admin-utils';
import ImagePicker from './ImagePicker';

export default function AdminHomeSettings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<HomePageData>({
    hero: {
      title: 'Step Into Style',
      subtitle: 'Discover the latest collection of premium footwear designed for ultimate comfort and elegance.',
      ctaText: 'Shop New Arrivals',
      ctaUrl: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000'
    },
    heroSlides: [
      {
        title: 'Step Into Style',
        subtitle: 'Discover the latest collection of premium footwear designed for ultimate comfort and elegance.',
        ctaText: 'Shop New Arrivals',
        ctaUrl: '/shop',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=2000'
      }
    ],
    features: [
      { title: 'Free Shipping', desc: 'On all orders over ৳5000', icon: 'Truck' },
      { title: '24/7 Support', desc: 'Expert assistance anytime', icon: 'Headphones' },
      { title: 'Easy Returns', desc: '30-day hassle-free return', icon: 'RotateCcw' },
      { title: 'Secure Payment', desc: 'SSL encrypted transactions', icon: 'ShieldCheck' }
    ],
    banners: [
      { title: 'Urban Sneakers', subtitle: 'Limited Edition', cta: 'Explore', url: '/shop?cat=sneakers', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', color: 'bg-blue-600' },
      { title: 'Premium Leather', subtitle: 'Handcrafted', cta: 'View Collection', url: '/shop?cat=leather', image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&q=80&w=800', color: 'bg-orange-600' }
    ]
  });

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'home'));
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as HomePageData;
          if (!fetchedData.heroSlides) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const result = await performAdminAction(user, 'home', 'update', 'home', data, 'settings');
      if (result.status === 'pending_approval') {
        alert('Changes submitted for approval!');
      } else {
        alert('Saved');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading home content...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Home Page Editor</h2>
          <p className="text-gray-500">Customize banners, hero section, and features.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* HERO SLIDER SECTION */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Layout className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Hero Slider (Main Banners)</h3>
            </div>
            <button 
              type="button"
              onClick={() => setData({
                ...data,
                heroSlides: [...data.heroSlides, { ...data.heroSlides[0] }]
              })}
              className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Slide
            </button>
          </div>

          <div className="space-y-6">
            {data.heroSlides.map((slide, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200 relative group animate-in slide-in-from-right-4 duration-300">
                <button 
                  type="button"
                  onClick={() => {
                    if (data.heroSlides.length > 1) {
                      const newSlides = data.heroSlides.filter((_, i) => i !== idx);
                      setData({ ...data, heroSlides: newSlides });
                    }
                  }}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg group-hover:block hidden"
                >
                  <Trash className="w-4 h-4" />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Slide #{idx + 1} Title</label>
                      <input type="text" value={slide.title} onChange={(e) => {
                        const newSlides = [...data.heroSlides];
                        newSlides[idx].title = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-black font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subtitle</label>
                      <textarea rows={2} value={slide.subtitle} onChange={(e) => {
                        const newSlides = [...data.heroSlides];
                        newSlides[idx].subtitle = e.target.value;
                        setData({ ...data, heroSlides: newSlides });
                      }} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-black resize-none text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CTA Label</label>
                        <input type="text" value={slide.ctaText} onChange={(e) => {
                          const newSlides = [...data.heroSlides];
                          newSlides[idx].ctaText = e.target.value;
                          setData({ ...data, heroSlides: newSlides });
                        }} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-black text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">CTA URL</label>
                        <input type="text" value={slide.ctaUrl} onChange={(e) => {
                          const newSlides = [...data.heroSlides];
                          newSlides[idx].ctaUrl = e.target.value;
                          setData({ ...data, heroSlides: newSlides });
                        }} className="w-full px-4 py-2 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-black text-sm" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <ImagePicker 
                      label="Slide Background"
                      value={slide.imageUrl}
                      onChange={(url) => {
                        const newSlides = [...data.heroSlides];
                        newSlides[idx].imageUrl = url;
                        setData({ ...data, heroSlides: newSlides });
                      }}
                      requiredWidth={1920}
                      requiredHeight={800}
                      maxSizeKB={500}
                      aspectRatioLabel="2.4:1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center mb-6">
            <Sparkles className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Trust Badges & Features</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.features.map((feature, idx) => (
              <div key={idx} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <input type="text" value={feature.title} onChange={(e) => {
                  const newFeatures = [...data.features];
                  newFeatures[idx].title = e.target.value;
                  setData({ ...data, features: newFeatures });
                }} className="w-full font-bold text-sm outline-none focus:border-b border-black" placeholder="Feature Title" />
                <textarea value={feature.desc} onChange={(e) => {
                  const newFeatures = [...data.features];
                  newFeatures[idx].desc = e.target.value;
                  setData({ ...data, features: newFeatures });
                }} className="w-full text-xs text-gray-500 outline-none resize-none" rows={2} placeholder="Description" />
              </div>
            ))}
          </div>
        </div>

        {/* BANNERS */}
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <div className="flex items-center mb-6">
            <LayoutGrid className="w-5 h-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Promotional Banners</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.banners.map((banner, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 relative">
                <div className="grid grid-cols-1 gap-4">
                   <div>
                     <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Banner Title</label>
                     <input value={banner.title} onChange={(e) => {
                        const newBanners = [...data.banners];
                        newBanners[idx].title = e.target.value;
                        setData({ ...data, banners: newBanners });
                     }} className="w-full px-3 py-1.5 border rounded text-sm mb-3" />
                     
                     <div className="mb-4">
                       <ImagePicker 
                          label="Banner Image"
                          value={banner.image}
                          onChange={(url) => {
                            const newBanners = [...data.banners];
                            newBanners[idx].image = url;
                            setData({ ...data, banners: newBanners });
                          }}
                          requiredWidth={800}
                          requiredHeight={400}
                          maxSizeKB={300}
                          aspectRatioLabel="2:1"
                       />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">CTA Label</label>
                          <input value={banner.cta} onChange={(e) => {
                            const newBanners = [...data.banners];
                            newBanners[idx].cta = e.target.value;
                            setData({ ...data, banners: newBanners });
                          }} className="w-full px-3 py-1.5 border rounded text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">URL</label>
                          <input value={banner.url} onChange={(e) => {
                            const newBanners = [...data.banners];
                            newBanners[idx].url = e.target.value;
                            setData({ ...data, banners: newBanners });
                          }} className="w-full px-3 py-1.5 border rounded text-sm" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
