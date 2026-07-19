'use client';
import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { CATEGORIES as MOCK_CATS } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX } from 'react-icons/fi';

const EMPTY = { name: '', slug: '', status: 'active' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // null | 'add' | 'edit'
  const [form, setForm]             = useState(EMPTY);
  const [editingId, setEditingId]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.length > 0 ? data : MOCK_CATS);
    } catch {
      setCategories(MOCK_CATS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError('');
    setModal('add');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name || '', slug: cat.slug || '', status: cat.status || 'active' });
    setEditingId(cat.id);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Category name is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/\s+/g, '-'),
        status: form.status,
      };
      if (modal === 'add') {
        const ref = await addCategory(payload);
        setCategories(prev => [...prev, { id: ref.id, ...payload, products: 0, subcategories: [] }]);
      } else {
        await updateCategory(editingId, payload);
        setCategories(prev => prev.map(c => c.id === editingId ? { ...c, ...payload } : c));
      }
      closeModal();
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Categories</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${categories.length} categories`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Category</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-dark">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">/{cat.slug}</p>
                  {cat.parent && <p className="text-xs text-gray-400 mt-0.5">Parent: {cat.parent}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Edit"><FiEdit2 size={14} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                {cat.products != null && <span className="badge-blue">{cat.products} products</span>}
                <span className={cat.status === 'active' ? 'badge-green' : 'badge-gray'}>{cat.status || 'active'}</span>
              </div>
              {cat.subcategories?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Subcategories:</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.subcategories.map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-10">No categories yet. Add one!</div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Health & Beauty" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug (URL path)</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" placeholder="e.g. health-beauty (auto if blank)" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
