import React, { useState } from 'react';
import { useProductStore } from '../../store/useProductStore';
import { Plus, Edit, Trash } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { performAdminAction } from '../../lib/admin-utils';
import ImagePicker from './ImagePicker';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Category } from '../../types';
import { useEffect } from 'react';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { user } = useAuthStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', price: '', category: '', stock: '', imageUrl: '',
    sizeVariants: [] as {size: string, priceModifier: number}[],
    colorVariants: [] as {name: string, hex: string, imageUrl: string}[]
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        title: product.title,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        imageUrl: product.imageUrl,
        sizeVariants: product.sizeVariants || [],
        colorVariants: product.colorVariants || []
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', price: '', category: '', stock: '', imageUrl: '', sizeVariants: [], colorVariants: [] });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm("Delete this product?")) {
      try {
        const result = await performAdminAction(user, 'product', 'delete', id, {}, 'products');
        if (result.status === 'pending_approval') {
          alert('Delete request submitted for approval!');
        } else {
          deleteProduct(id);
          alert('Deleted');
        }
      } catch (err: any) {
        console.error(err);
        alert("Failed to delete product: " + err.message);
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const productData = { 
      ...formData, 
      price: Number(formData.price), 
      stock: Number(formData.stock),
      brand: 'CHOPPOL',
      rating: 0,
      reviews: 0,
      sizes: formData.sizeVariants.length > 0 ? formData.sizeVariants.map(s => s.size) : [39, 40, 41, 42, 43, 44],
      sizeVariants: formData.sizeVariants,
      colorVariants: formData.colorVariants
    };

    try {
      if (editingId) {
        const result = await performAdminAction(user, 'product', 'update', editingId, productData, 'products');
        if (result.status === 'pending_approval') {
          alert('Update request submitted for approval!');
        } else {
          updateProduct(editingId, productData);
          alert('Saved');
        }
      } else {
        const newId = Date.now().toString();
        const result = await performAdminAction(user, 'product', 'create', newId, productData, 'products');
        if (result.status === 'pending_approval') {
          alert('Creation request submitted for approval!');
        } else {
          addProduct({ id: newId, ...productData });
          alert('Submitted');
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to save product: ' + err.message);
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
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
                <select 
                  required 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-[10px] text-red-500 mt-1">Please add categories in the Categories tab first.</p>
                )}
              </div>
              <ImagePicker 
                label="Product Image"
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                requiredWidth={800}
                requiredHeight={800}
                maxSizeKB={200}
                aspectRatioLabel="1:1"
              />

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Size Variants</label>
                  <button type="button" onClick={() => setFormData({...formData, sizeVariants: [...formData.sizeVariants, {size: '', priceModifier: 0}]})} className="text-xs text-blue-600 hover:underline">+ Add Size</button>
                </div>
                {formData.sizeVariants.map((sv, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" placeholder="Size Name" value={sv.size} onChange={e => { const v = [...formData.sizeVariants]; v[idx].size = e.target.value; setFormData({...formData, sizeVariants: v}); }} className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                    <input type="number" placeholder="+ Price Mod (৳)" value={sv.priceModifier} onChange={e => { const v = [...formData.sizeVariants]; v[idx].priceModifier = Number(e.target.value); setFormData({...formData, sizeVariants: v}); }} className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                    <button type="button" onClick={() => { const v = [...formData.sizeVariants]; v.splice(idx, 1); setFormData({...formData, sizeVariants: v}); }} className="text-red-500 px-2"><Trash className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">Color Variants</label>
                  <button type="button" onClick={() => setFormData({...formData, colorVariants: [...formData.colorVariants, {name: '', hex: '#000000', imageUrl: ''}]})} className="text-xs text-blue-600 hover:underline">+ Add Color</button>
                </div>
                {formData.colorVariants.map((cv, idx) => (
                  <div key={idx} className="flex gap-2 items-center flex-wrap">
                    <input type="text" placeholder="Color Name" value={cv.name} onChange={e => { const v = [...formData.colorVariants]; v[idx].name = e.target.value; setFormData({...formData, colorVariants: v}); }} className="flex-1 min-w-[100px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                    <input type="color" value={cv.hex} onChange={e => { const v = [...formData.colorVariants]; v[idx].hex = e.target.value; setFormData({...formData, colorVariants: v}); }} className="w-10 h-10 border-0 p-0 rounded-lg cursor-pointer" />
                    <input type="text" placeholder="Image URL (Optional)" value={cv.imageUrl} onChange={e => { const v = [...formData.colorVariants]; v[idx].imageUrl = e.target.value; setFormData({...formData, colorVariants: v}); }} className="flex-1 min-w-[150px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" />
                    <button type="button" onClick={() => { const v = [...formData.colorVariants]; v.splice(idx, 1); setFormData({...formData, colorVariants: v}); }} className="text-red-500 px-2"><Trash className="w-4 h-4" /></button>
                  </div>
                ))}
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
