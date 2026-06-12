import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { User, Shield, Ban, CheckCircle, Trash, Edit } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      fetchUsers();
      alert('Saved');
    } catch (err: any) {
      console.error(err);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to completely delete this user?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
      alert('Deleted');
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, displayName, role, phone, email, password } = editingUser;
      await updateDoc(doc(db, 'users', id), {
        displayName: displayName || '',
        email: email || '',
        password: password || '',
        role: role || 'customer',
        phone: phone || ''
      });
      setIsModalOpen(false);
      fetchUsers();
      alert('Saved');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save user info: ' + err.message);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">Manage customer accounts, update details, or block users.</p>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  {u.displayName || 'Unnamed User'}
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{u.role || 'customer'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded ${u.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenEdit(u)} title="Edit User" className="p-2 text-blue-500 hover:bg-blue-50 bg-gray-100 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                  {u.status !== 'blocked' ? (
                     <button onClick={() => handleUpdateStatus(u.id, 'blocked')} title="Block User" className="p-2 text-orange-500 hover:bg-orange-50 bg-gray-100 rounded-lg transition"><Ban className="w-4 h-4" /></button>
                  ) : (
                     <button onClick={() => handleUpdateStatus(u.id, 'active')} title="Unblock User" className="p-2 text-green-500 hover:bg-green-50 bg-gray-100 rounded-lg transition"><CheckCircle className="w-4 h-4" /></button>
                  )}
                  <button onClick={() => handleDeleteUser(u.id)} title="Delete User" className="p-2 text-red-500 hover:bg-red-50 bg-gray-100 rounded-lg transition"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-gray-500">Loading users...</div>}
        {!loading && users.length === 0 && (
          <div className="p-12 text-center text-gray-500">No users found.</div>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={editingUser.displayName || ''} onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={editingUser.password || ''} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} placeholder="Enter new password to change" className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editingUser.role || 'customer'} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black">
                  <option value="customer">Customer</option>
                  <option value="subadmin">Sub Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
