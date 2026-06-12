import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { Plus, Edit, Trash } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { performAdminAction } from '../../lib/admin-utils';

export default function AdminPages({ pages: initialPages, fetchData }: any) {
  const [localPages, setLocalPages] = useState<any[]>(initialPages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ slug: '', title: '', content: '' });
  const { user } = useAuthStore();

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
    if (!user) return;
    const formattedSlug = formData.slug.toLowerCase().replace(/\s+/g, '-');
    const newPage = {
      slug: formattedSlug,
      title: formData.title,
      content: formData.content,
    };

    try {
      const pid = editingId || formattedSlug;
      const result = await performAdminAction(user, 'page', editingId ? 'update' : 'create', pid, newPage, 'pages');
      if (result.status === 'pending_approval') {
        alert('Page changes submitted for approval!');
      } else {
        fetchData();
        alert('Saved');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Failed to save page: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('Delete this page content?')) {
      try {
        const result = await performAdminAction(user, 'page', 'delete', id, {}, 'pages');
        if (result.status === 'pending_approval') {
          alert('Delete submitted for approval!');
        } else {
          fetchData();
          alert('Deleted');
        }
      } catch (err: any) {
        console.error(err);
        alert('Failed to delete page: ' + err.message);
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
                  <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-gray-50" placeholder="e.g. terms-conditions" />
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
