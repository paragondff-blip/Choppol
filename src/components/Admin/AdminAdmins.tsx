import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { Users, Shield, ShieldCheck, Plus, X, Check } from 'lucide-react';
import { AdminPermissions, MappedUser } from '../../types';

export default function AdminAdmins() {
  const [admins, setAdmins] = useState<MappedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    role: 'subadmin' as 'superadmin' | 'subadmin',
    permissions: {
      overview: true,
      products: true,
      orders: true,
      vouchers: true,
      reports: false,
      pages: true,
      settings: false,
      approvals: false,
      admins: false
    } as AdminPermissions
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', 'in', ['superadmin', 'subadmin']));
      const snap = await getDocs(q);
      setAdmins(snap.docs.map(d => ({ uid: d.id, ...d.data() } as MappedUser)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, you'd check if user exists or invite them.
      // For this prototype, we'll just set the role for the email if they've logged in before,
      // or set it for when they do log in.
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions,
        createdAt: Date.now()
      }, { merge: true });
      
      alert('Saved');
      setIsModalOpen(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert('Error saving admin');
    }
  };

  const togglePermission = (key: keyof AdminPermissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions[key]
      }
    });
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading admin accounts...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.uid} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-xl mr-4 ${admin.role === 'superadmin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {admin.role === 'superadmin' ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{admin.email}</h3>
                <p className="text-xs font-bold uppercase text-gray-500">{admin.role}</p>
              </div>
            </div>
            
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {admin.role === 'superadmin' ? (
                  <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded">ALL ACCESS</span>
                ) : (
                  Object.entries(admin.permissions || {}).map(([key, val]) => (
                    val && <span key={key} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{key}</span>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add/Edit Admin</h3>
            <form onSubmit={handleSaveAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="admin@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none">
                  <option value="subadmin">Sub Admin (Limited Access)</option>
                  <option value="superadmin">Super Admin (Full Access)</option>
                </select>
              </div>

              {formData.role === 'subadmin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Permissions</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.keys(formData.permissions).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => togglePermission(key as any)}
                        className={`flex items-center justify-between px-3 py-2 border rounded-lg text-xs font-medium transition ${formData.permissions[key as keyof AdminPermissions] ? 'bg-black text-white border-black' : 'bg-white text-gray-600 hover:border-gray-300'}`}
                      >
                        <span className="capitalize">{key}</span>
                        {formData.permissions[key as keyof AdminPermissions] ? <Check className="w-3 h-3 ml-2" /> : <Plus className="w-3 h-3 ml-2" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">Save Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
