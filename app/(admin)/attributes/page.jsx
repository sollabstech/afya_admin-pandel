'use client';
import { useState, useEffect } from 'react';
import { getAttributes, addAttribute, updateAttribute, deleteAttribute } from '@/lib/firestore';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSliders, FiRefreshCw, FiTag } from 'react-icons/fi';

const TYPES = ['select', 'multiselect', 'color', 'text', 'radio'];
const EMPTY_FORM = { name: '', slug: '', type: 'select', values: '', ordering: 0, isVisible: true, isVariation: true };

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
}

export default function AttributesPage() {
  const [attrs, setAttrs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'add' | 'edit'
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  const load = async () => {
    setLoading(true);
    try { setAttrs(await getAttributes()); } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setModal('add');
  };

  const openEdit = (a) => {
    setForm({
      name: a.name || '',
      slug: a.slug || '',
      type: a.type || 'select',
      values: Array.isArray(a.values) ? a.values.join(', ') : (a.values || ''),
      ordering: a.ordering ?? 0,
      isVisible: a.isVisible !== false,
      isVariation: a.isVariation !== false,
    });
    setEditingId(a.id);
    setError('');
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Attribute name is required.'); return; }
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const values = form.values.split(',').map(v => v.trim()).filter(Boolean);
      const payload = { name: form.name.trim(), slug, type: form.type, values, ordering: Number(form.ordering) || 0, isVisible: form.isVisible, isVariation: form.isVariation };
      if (modal === 'add') await addAttribute(payload);
      else await updateAttribute(editingId, payload);
      await load();
      closeModal();
    } catch (err) { setError(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete attribute "${name}"? Products using it will keep their data.`)) return;
    try { await deleteAttribute(id); setAttrs(prev => prev.filter(a => a.id !== id)); }
    catch (err) { alert(err.message); }
  };

  const filtered = attrs.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Product Attributes</h1>
          <p className="text-sm text-gray-500">{attrs.length} global attributes — used for product variations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Attribute</button>
        </div>
      </div>

      {/* Info banner */}
      <div className="card p-4 bg-blue-50 border border-blue-100 flex items-start gap-3">
        <FiSliders className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-medium text-blue-800">What are attributes?</p>
          <p className="text-xs text-blue-600 mt-0.5">Attributes define product variations (e.g. Color, Size, Flavour). Create them here, then assign them to Variable products to auto-generate variation combinations.</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <input
          type="text"
          placeholder="Search attributes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Values</th>
              <th className="px-4 py-3 font-medium text-center">Visible</th>
              <th className="px-4 py-3 font-medium text-center">Variation</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">
                {search ? 'No attributes match your search.' : 'No attributes yet. Click "Add Attribute" to create one.'}
              </td></tr>
            )}
            {!loading && filtered.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-dark">{a.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{a.slug}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs capitalize">{a.type}</span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs max-w-xs">
                  {Array.isArray(a.values) ? (
                    <div className="flex flex-wrap gap-1">
                      {a.values.slice(0, 6).map(v => (
                        <span key={v} className="px-1.5 py-0.5 bg-primary/10 text-dark rounded text-[11px]">{v}</span>
                      ))}
                      {a.values.length > 6 && <span className="text-gray-400 text-[11px]">+{a.values.length - 6} more</span>}
                    </div>
                  ) : a.values || '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={a.isVisible !== false ? 'badge-green' : 'badge-red'}>{a.isVisible !== false ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={a.isVariation !== false ? 'badge-green' : 'badge-red'}>{a.isVariation !== false ? 'Yes' : 'No'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(a.id, a.name)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">{modal === 'add' ? 'Add Attribute' : 'Edit Attribute'}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Attribute Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
                  className="input"
                  placeholder="e.g. Color, Size, Flavour"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                  className="input font-mono text-sm"
                  placeholder="auto-generated from name"
                />
                <p className="text-xs text-gray-400 mt-1">Used in URLs. Auto-generated from name.</p>
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input">
                  {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              {/* Values */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Values <span className="text-gray-400">(comma-separated)</span></label>
                <textarea
                  value={form.values}
                  onChange={e => setForm(f => ({ ...f, values: e.target.value }))}
                  className="input resize-none text-sm"
                  rows={3}
                  placeholder="Red, Blue, Green, Black, White"
                />
                <p className="text-xs text-gray-400 mt-1">Separate each value with a comma. You can also add custom values per product.</p>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVisible} onChange={e => setForm(f => ({ ...f, isVisible: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-700">Visible on product page</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVariation} onChange={e => setForm(f => ({ ...f, isVariation: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-700">Used for variations</span>
                </label>
              </div>

              {/* Ordering */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display Order</label>
                <input type="number" min="0" value={form.ordering} onChange={e => setForm(f => ({ ...f, ordering: e.target.value }))} className="input w-24 text-sm" />
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : modal === 'add' ? 'Add Attribute' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
