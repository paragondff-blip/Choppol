import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Plus, Edit, Trash, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { performAdminAction } from '../../lib/admin-utils';
import { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const { user, isSuperAdmin } = useAuthStore();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ 
        name: category.name, 
        slug: category.slug, 
        description: category.description || '' 
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isSuperAdmin) return;

    const slug = formData.slug.toLowerCase().replace(/\s+/g, '-');
    const categoryData = {
      ...formData,
      slug,
      updatedAt: Date.now()
    };

    try {
      const action = editingId ? 'update' : 'create';
      const targetId = editingId || slug;
      
      const result = await performAdminAction(
        user, 
        'category', 
        action, 
        targetId, 
        categoryData, 
        'categories'
      );

      if (result.status === 'pending_approval') {
        alert('Category changes submitted for approval!');
      } else {
        fetchCategories();
        alert('Saved');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save category: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !isSuperAdmin) {
       alert("You must be logged in as a Super Admin to perform this action.");
       return;
    }
    if (confirm('Are you sure you want to delete this category? Products using this category might be affected.')) {
      try {
        const result = await performAdminAction(user, 'category', 'delete', id, {}, 'categories');
        if (result.status === 'pending_approval') {
          alert('Delete request submitted for approval!');
        } else {
          fetchCategories();
          alert('Deleted');
        }
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete category: ' + err.message);
      }
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Categories</h2>
          <p className="text-sm text-gray-500">Manage categories used across the store.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </button>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  {cat.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-[200px]">{cat.description || '-'}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-500 hover:text-black bg-gray-100 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 bg-gray-100 rounded-lg transition"><Trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-8 text-center text-gray-500">Loading categories...</div>}
        {!loading && categories.length === 0 && (
          <div className="p-12 text-center text-gray-500">No categories found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Category' : 'Create Category'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData, 
                      name, 
                      slug: name.toLowerCase().replace(/\s+/g, '-')
                    });
                  }} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" 
                  placeholder="e.g. Sneakers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input 
                  required 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" 
                  placeholder="sneakers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none" 
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
