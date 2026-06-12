import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Package, Users, DollarSign, TrendingUp, RefreshCw, LayoutDashboard, Tag, ShoppingBag, BarChart3, FileText, Settings, Home, ShieldCheck, ClipboardCheck, Mail } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Admin Components
import AdminProducts from '../components/Admin/AdminProducts';
import AdminOrders from '../components/Admin/AdminOrders';
import AdminVouchers from '../components/Admin/AdminVouchers';
import AdminReports from '../components/Admin/AdminReports';
import AdminPages from '../components/Admin/AdminPages';
import AdminFooterSettings from '../components/Admin/AdminFooterSettings';
import AdminHomeSettings from '../components/Admin/AdminHomeSettings';
import AdminAdmins from '../components/Admin/AdminAdmins';
import AdminApprovals from '../components/Admin/AdminApprovals';
import AdminCategories from '../components/Admin/AdminCategories';

import AdminUsers from '../components/Admin/AdminUsers';
import AdminMessages from '../components/Admin/AdminMessages';
import AdminStoreSettings from '../components/Admin/AdminStoreSettings';

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'vouchers' | 'reports' | 'pages' | 'home' | 'footer' | 'store_settings' | 'approvals' | 'admins' | 'users' | 'messages';

export default function AdminDashboard() {
  const { user, isAdmin, isSuperAdmin, hasPermission, loading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Stats
  const revenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const totalOrders = orders.length;
  const customersCount = new Set(orders.map(o => o.userId)).size || 0; 
  const activeReferrals = vouchers.length || 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      if (hasPermission('orders')) {
        const ordersSnap = await getDocs(collection(db, 'orders'));
        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      if (hasPermission('vouchers')) {
        const vouchersSnap = await getDocs(collection(db, 'vouchers'));
        setVouchers(vouchersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      if (hasPermission('pages')) {
        const pagesSnap = await getDocs(collection(db, 'pages'));
        setPages(pagesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, permission: 'overview' as any },
    { id: 'approvals', label: 'Approval Queue', icon: ClipboardCheck, permission: 'approvals' as any, hide: !hasPermission('approvals') && !isSuperAdmin },
    { id: 'admins', label: 'Admin Panel', icon: ShieldCheck, permission: 'admins' as any, hide: !isSuperAdmin },
    { id: 'users', label: 'Customers', icon: Users, permission: 'admins' as any, hide: !isSuperAdmin },
    { id: 'categories', label: 'Categories', icon: Tag, permission: 'products' as any },
    { id: 'products', label: 'Products', icon: Package, permission: 'products' as any },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, permission: 'orders' as any },
    { id: 'vouchers', label: 'Vouchers', icon: Tag, permission: 'vouchers' as any },
    { id: 'messages', label: 'Messages', icon: Mail, permission: 'admins' as any, hide: !isSuperAdmin },
    { id: 'reports', label: 'Sales Report', icon: BarChart3, permission: 'reports' as any },
    { id: 'home', label: 'Home Editor', icon: Home, permission: 'settings' as any },
    { id: 'store_settings', label: 'Store Defaults', icon: Settings, permission: 'settings' as any },
    { id: 'pages', label: 'Pages Content', icon: FileText, permission: 'pages' as any },
    { id: 'footer', label: 'Footer Settings', icon: Settings, permission: 'settings' as any },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-1">
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 leading-none">Admin Portal</h2>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{user?.role}</p>
        </div>
        
        {navItems.filter(item => !item.hide && (item.id === 'overview' || hasPermission(item.permission))).map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)} 
            className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} /> 
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[600px]">
        {loading && <div className="text-center py-4 text-gray-400 text-xs animate-pulse">Synchronizing database...</div>}
        
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.displayName || 'Admin'}</h1>
                <p className="text-gray-500 mt-1">Manage your store operations efficiently.</p>
              </div>
              <button onClick={fetchData} className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <RefreshCw className="w-4 h-4 mr-2" /> Sync
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-xl mr-4"><DollarSign className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900">৳{revenue.toLocaleString()}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-green-50 text-green-600 rounded-xl mr-4"><Package className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Orders</p>
                  <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-xl mr-4"><Users className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Customers</p>
                  <h3 className="text-2xl font-bold text-gray-900">{customersCount}</h3>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center">
                <div className="p-4 bg-orange-50 text-orange-600 rounded-xl mr-4"><TrendingUp className="w-6 h-6" /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase">Vouchers</p>
                  <h3 className="text-2xl font-bold text-gray-900">{activeReferrals}</h3>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Shortcuts</h3>
            <div className="flex flex-wrap gap-4">
               {hasPermission('products') && <button onClick={() => setActiveTab('products')} className="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-black transition shadow-lg shadow-black/20">Add Product</button>}
               {hasPermission('orders') && <button onClick={() => setActiveTab('orders')} className="px-6 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition">View Orders</button>}
               {isSuperAdmin && <button onClick={() => setActiveTab('admins')} className="px-6 py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition border border-blue-100">Manage Admins</button>}
            </div>
          </div>
        )}

        {activeTab === 'products' && hasPermission('products') && <AdminProducts />}
        {activeTab === 'categories' && hasPermission('products') && <AdminCategories />}
        {activeTab === 'orders' && hasPermission('orders') && <AdminOrders orders={orders} fetchData={fetchData} />}
        {activeTab === 'vouchers' && hasPermission('vouchers') && <AdminVouchers vouchers={vouchers} fetchData={fetchData} />}
        {activeTab === 'reports' && hasPermission('reports') && <AdminReports orders={orders} revenue={revenue} />}
        {activeTab === 'pages' && hasPermission('pages') && <AdminPages pages={pages} fetchData={fetchData} />}
        {activeTab === 'footer' && hasPermission('settings') && <AdminFooterSettings />}
        {activeTab === 'home' && hasPermission('settings') && <AdminHomeSettings />}
        {activeTab === 'store_settings' && hasPermission('settings') && <AdminStoreSettings />}
        {activeTab === 'approvals' && (isSuperAdmin || hasPermission('approvals')) && <AdminApprovals />}
        {activeTab === 'admins' && isSuperAdmin && <AdminAdmins />}
        {activeTab === 'users' && isSuperAdmin && <AdminUsers />}
        {activeTab === 'messages' && isSuperAdmin && <AdminMessages />}
      </div>
    </div>
  );
}

// Removing local helper components as they are now in separate files
