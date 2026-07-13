'use client';
import { useState, useEffect } from 'react';
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/lib/firestore';
import { FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX, FiCheck } from 'react-icons/fi';

const EMPTY = { title: '', subtitle: '', image: '', link: '/', position: 'hero', status: 'active', startDate: '', endDate: '' };

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (err) {
      console.error('Failed to load banners:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowForm(true); };
  const openEdit = (b) => { setForm({ title: b.title, subtitle: b.subtitle || '', image: b.image, link: b.link || '/', position: b.position || 'hero', status: b.status || 'active', startDate: b.startDate || '', endDate: b.endDate || '' }); setEditId(b.id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateBanner(editId, form);
        setBanners(prev => prev.map(b => b.id === editId ? { ...b, ...form } : b));
      } else {
        const ref = await addBanner(form);
        setBanners(prev => [...prev, { id: ref.id, ...form }]);
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (b) => {
    const newStatus = b.status === 'active' ? 'inactive' : 'active';
    try {
      await updateBanner(b.id, { status: newStatus });
      setBanners(prev => prev.map(x => x.id === b.id ? { ...x, status: newStatus } : x));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage and promo banners</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /></button>
          <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Banner</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark">{editId ? 'Edit Banner' : 'New Banner'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="p-1 rounded hover:bg-gray-100"><FiX size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input className="input" placeholder="Banner title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
              <input className="input" placeholder="Short description" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
              <input className="input" placeholder="https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
              <input className="input" placeholder="/categories" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
              <select className="input" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="hero">Hero (Top)</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input className="input" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input className="input" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : editId ? 'Update Banner' : 'Add Banner'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY); }} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
          Loading banners...
        </div>
      ) : banners.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No banners yet. Click "Add Banner" to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {banners.map(b => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative h-40 bg-gray-100">
                {b.image ? (
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-bold text-base">{b.title}</p>
                  {b.subtitle && <p className="text-xs opacity-90">{b.subtitle}</p>}
                </div>
                <button onClick={() => handleToggle(b)} className={`absolute top-3 right-3 ${b.status === 'active' ? 'badge-green' : 'badge-gray'} cursor-pointer`}>
                  {b.status}
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex gap-4 text-sm flex-wrap">
                  <div><span className="text-gray-500">Position: </span><span className="font-medium capitalize">{b.position}</span></div>
                  {b.startDate && <div><span className="text-gray-500">From: </span><span className="font-medium">{b.startDate}</span></div>}
                  {b.endDate && <div><span className="text-gray-500">To: </span><span className="font-medium">{b.endDate}</span></div>}
                </div>
                {b.link && <p className="text-xs text-gray-400 truncate">Link: {b.link}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => openEdit(b)} className="btn-outline flex-1 justify-center py-1.5 text-xs"><FiEdit2 size={12} /> Edit</button>
                  <button onClick={() => handleDelete(b.id)} className="btn-danger flex-1 justify-center py-1.5 text-xs"><FiTrash2 size={12} /> Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
