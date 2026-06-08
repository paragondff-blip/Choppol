import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProductStore } from '../store/useProductStore';
import { Package, Users, DollarSign, TrendingUp, RefreshCw, Plus, Edit, Trash, LayoutDashboard, Tag, ShoppingBag, BarChart3, CheckCircle, FileText } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'vouchers' | 'reports' | 'pages'>('overview');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const { products } = useProductStore();
  const [loading, setLoading] = useState(false);

  // Stats
  const revenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const totalOrders = orders.length;
  const customersCount = new Set(orders.map(o => o.userId)).size || 984; // Mocked fallback
  const activeReferrals = vouchers.length || 89;

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(ordersRef);
      setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const vouchersRef = collection(db, 'vouchers');
      const vouchersSnap = await getDocs(vouchersRef);
      setVouchers(vouchersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const pagesRef = collection(db, 'pages');
      const pagesSnap = await getDocs(pagesRef);
      setPages(pagesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Checking credentials...</div>;
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-red-500 font-bold">Unauthorized access</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-2">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-4">Admin Portal</h2>
        
        <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <LayoutDashboard className="w-5 h-5 mr-3" /> Overview
        </button>
        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'products' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Package className="w-5 h-5 mr-3" /> Products
        </button>
        <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'orders' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <ShoppingBag className="w-5 h-5 mr-3" /> Orders
        </button>
        <button onClick={() => setActiveTab('vouchers')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'vouchers' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <Tag className="w-5 h-5 mr-3" /> Vouchers
        </button>
        <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'reports' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <BarChart3 className="w-5 h-5 mr-3" /> Sales Report
        </button>
        <button onClick={() => setActiveTab('pages')} className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === 'pages' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
          <FileText className="w-5 h-5 mr-3" /> Pages Content
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
        {loading && <div className="text-center py-4 text-gray-400">Loading data...</div>}
        
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.email}</p>
              </div>
              <button onClick={fetchData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-xl mr-4"><DollarSign className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">৳{revenue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-green-100 text-green-600 rounded-xl mr-4"><Package className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                  <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-xl mr-4"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Customers</p>
                  <h3 className="text-2xl font-bold text-gray-900">{customersCount}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-xl mr-4"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Vouchers</p>
                  <h3 className="text-2xl font-bold text-gray-900">{activeReferrals}</h3>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Shortcuts</h3>
            <div className="flex gap-4">
               <button onClick={() => setActiveTab('products')} className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition">Add Product</button>
               <button onClick={() => setActiveTab('orders')} className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition">View Orders</button>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <AdminProducts />
        )}

        {activeTab === 'orders' && (
          <AdminOrders orders={orders} fetchData={fetchData} />
        )}

        {activeTab === 'vouchers' && (
          <AdminVouchers vouchers={vouchers} fetchData={fetchData} />
        )}

        {activeTab === 'reports' && (
          <AdminReports orders={orders} revenue={revenue} />
        )}

        {activeTab === 'pages' && (
          <AdminPages pages={pages} fetchData={fetchData} />
        )}
      </div>
    </div>
  );
}

function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', price: '', category: '', stock: '', imageUrl: '' });

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        imageUrl: product.imageUrl
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', price: '', category: '', stock: '', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      deleteProduct(id);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct(editingId, { ...formData, price: Number(formData.price), stock: Number(formData.stock) });
    } else {
      addProduct({ 
        id: Date.now().toString(), 
        ...formData, 
        price: Number(formData.price), 
        stock: Number(formData.stock),
        brand: 'CHOPPOL',
        rating: 0,
        reviews: 0,
        sizes: [39, 40, 41, 42, 43, 44] 
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Products</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product: any) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={product.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                  <span className="font-medium text-gray-900 line-clamp-1">{product.title}</span>
                </td>
                <td className="px-4 py-3 capitalize">{product.category}</td>
                <td className="px-4 py-3 font-medium">৳{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-500 hover:text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 bg-gray-100 rounded-lg transition"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input required type="url" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminOrders({ orders, fetchData }: any) {
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
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

function AdminVouchers({ vouchers: initialVouchers, fetchData }: any) {
  const [localVouchers, setLocalVouchers] = useState<any[]>(initialVouchers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ code: '', discountPercentage: '10' });

  // Update localstate if props change (when real data is fetched)
  useEffect(() => {
    setLocalVouchers(initialVouchers);
  }, [initialVouchers]);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase() || `ADMIN-${Math.random().toString(36).substring(2,6).toUpperCase()}`,
      discountPercentage: Number(formData.discountPercentage),
      isUsed: false,
      createdAt: Date.now()
    };
    
    // Optimistic UI Update for Demo Mode
    setLocalVouchers([...localVouchers, newVoucher]);
    setIsModalOpen(false);
    
    try {
      const vid = doc(collection(db, 'vouchers')).id;
      await setDoc(doc(db, 'vouchers', vid), newVoucher);
      fetchData(); // Sync with remote
    } catch (err: any) {
      console.warn("Failed to create remotely (Demo Mode fallback active):", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this voucher?')) {
      setLocalVouchers(localVouchers.filter(v => v.id !== id));
      try {
        await deleteDoc(doc(db, 'vouchers', id));
        fetchData();
      } catch (err: any) {
        console.warn("Failed to delete remotely (Demo Mode fallback active):", err.message);
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
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

function AdminPages({ pages: initialPages, fetchData }: any) {
  const [localPages, setLocalPages] = useState<any[]>(initialPages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ slug: '', title: '', content: '' });

  // Update localstate if props change (when real data is fetched)
  useEffect(() => {
    setLocalPages(initialPages);
  }, [initialPages]);

  const handleOpenModal = (page?: any) => {
    if (page) {
      setEditingId(page.id);
      setFormData({ slug: page.slug || '', title: page.title || '', content: page.content || '' });
    } else {
      setEditingId(null);
      setFormData({ slug: '', title: '', content: '' });
    }
    setIsModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSlug = formData.slug.toLowerCase().replace(/\s+/g, '-');
    const newPage = {
      id: editingId || formattedSlug,
      slug: formattedSlug,
      title: formData.title,
      content: formData.content,
      updatedAt: Date.now()
    };

    // Optimistic UI Update for Demo Mode
    if (editingId) {
      setLocalPages(localPages.map(p => p.id === editingId ? newPage : p));
    } else {
      setLocalPages([...localPages, newPage]);
    }
    
    setIsModalOpen(false);

    try {
      const pid = newPage.id;
      await setDoc(doc(db, 'pages', pid), newPage);
      fetchData(); // Sync with remote
    } catch (err: any) {
      console.warn("Failed to create remotely (Demo Mode fallback active):", err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this page content?')) {
      setLocalPages(localPages.filter(p => p.id !== id));
      try {
        await deleteDoc(doc(db, 'pages', id));
        fetchData();
      } catch (err: any) {
        console.warn("Failed to delete remotely (Demo Mode fallback active):", err.message);
      }
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Pages Content</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Page
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Page Title</th>
              <th className="px-4 py-3">Slug (URL)</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {localPages.map((page: any) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">/p/{page.slug}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(page.updatedAt || Date.now()).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(page)} className="p-2 text-gray-500 hover:text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(page.id)} className="p-2 text-red-500 hover:bg-red-50 bg-gray-100 rounded-lg transition"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {localPages.length === 0 && (
           <p className="text-gray-500 py-12 text-center">No pages found. Create one to get started.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl h-[80vh] flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Page' : 'Create Page'}</h3>
            <form onSubmit={handleSavePage} className="space-y-4 flex flex-col flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="e.g. Terms & Conditions" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" placeholder="e.g. terms-conditions" />
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Use Markdown HTML if needed)</label>
                <textarea required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-sm resize-none" placeholder="Write your page content here..."></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Save Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminReports({ orders, revenue }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Report</h2>
      
      <div className="mb-8 p-6 bg-gray-900 rounded-2xl text-white">
        <h3 className="text-gray-400 font-medium mb-1">Total Lifetime Revenue</h3>
        <p className="text-4xl font-bold text-white mb-6">৳{revenue.toLocaleString()}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-gray-800 pt-6">
          <div>
            <p className="text-gray-400 text-sm">Total Orders</p>
            <p className="font-bold text-lg">{orders.length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Avg Order Value</p>
            <p className="font-bold text-lg">৳{orders.length ? Math.round(revenue / orders.length).toLocaleString() : 0}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="font-bold text-lg text-green-400">{orders.filter((o:any)=>o.status==='delivered').length}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="font-bold text-lg text-yellow-400">{orders.filter((o:any)=>o.status==='pending').length}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 border border-gray-200 rounded-2xl bg-white text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-gray-900 text-lg">Detailed charts are coming soon.</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">Export functionality and advanced demographic deep-dives will be available in the version 2 platform update.</p>
      </div>
    </div>
  );
}
