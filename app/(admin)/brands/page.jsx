'use client';
import { useState, useEffect } from 'react';
import { getBrands, addBrand, updateBrand, deleteBrand } from '@/lib/firestore';
import { BRANDS as MOCK_BRANDS } from '@/lib/mockData';
import { FiPlus, FiTrash2, FiEdit2, FiRefreshCw, FiX, FiExternalLink } from 'react-icons/fi';

const EMPTY = { name: '', category: '', website: '', status: 'active' };

export default function BrandsPage() {
  const [brands, setBrands]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
  const [form, setForm]         = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBrands();
      setBrands(data.length > 0 ? data : MOCK_BRANDS);
    } catch {
      setBrands(MOCK_BRANDS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditingId(null); setError(''); setModal('add'); };

  const openEdit = (b) => {
    setForm({ name: b.name || '', category: b.category || '', website: b.website || '', status: b.status || 'active' });
    setEditingId(b.id);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Brand name is required.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), category: form.category.trim(), website: form.website.trim(), status: form.status };
      if (modal === 'add') {
        const ref = await addBrand({ ...payload, products: 0 });
        setBrands(prev => [...prev, { id: ref.id, ...payload, products: 0 }]);
      } else {
        await updateBrand(editingId, payload);
        setBrands(prev => prev.map(b => b.id === editingId ? { ...b, ...payload } : b));
      }
      closeModal();
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Brands</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${brands.length} brands`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Brand</button>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">{modal === 'add' ? 'New Brand' : 'Edit Brand'}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Brand Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="e.g. Himalaya" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input" placeholder="e.g. Health & Beauty" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Website</label>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} className="input" placeholder="https://..." type="url" />
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
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : modal === 'add' ? 'Add Brand' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
            Loading...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Brand Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                        {(b.name || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-dark">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.category || '—'}</td>
                  <td className="px-4 py-3"><span className="badge-blue">{b.products ?? 0}</span></td>
                  <td className="px-4 py-3"><span className={b.status === 'active' ? 'badge-green' : 'badge-gray'}>{b.status || 'active'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {b.website && (
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Visit website"><FiExternalLink size={14} /></a>
                      )}
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Edit"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {brands.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-10">No brands yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
