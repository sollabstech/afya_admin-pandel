'use client';
import { useState, useEffect } from 'react';
import { getCoupons, addCoupon, deleteCoupon, updateCoupon } from '@/lib/firestore';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiRefreshCw, FiX } from 'react-icons/fi';

const EMPTY = { code: '', type: 'percent', discount: 10, minOrder: 0, maxUses: 100, expiry: '', status: 'active' };

export default function OffersPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { alert('Coupon code is required'); return; }
    setSaving(true);
    try {
      const ref = await addCoupon({ ...form, used: 0, discount: Number(form.discount), minOrder: Number(form.minOrder), maxUses: Number(form.maxUses) });
      setCoupons(prev => [...prev, { id: ref.id, ...form, used: 0 }]);
      setForm(EMPTY);
      setShowForm(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (c) => {
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    try {
      await updateCoupon(c.id, { status: newStatus });
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Offers & Coupons</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${coupons.length} coupons`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /></button>
          <button onClick={() => setShowForm(true)} className="btn-primary"><FiPlus size={16} /> New Coupon</button>
        </div>
      </div>

      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-dark">New Coupon</h2>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="p-1 rounded hover:bg-gray-100"><FiX size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code *</label>
              <input className="input uppercase" placeholder="e.g. SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount Value</label>
              <input className="input" type="number" min="1" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Order (₹)</label>
              <input className="input" type="number" min="0" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
              <input className="input" type="number" min="1" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry Date</label>
              <input className="input" type="date" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 md:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Coupon'}</button>
              <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No coupons yet. Click "New Coupon" to create one.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map(c => (
            <div key={c.id} className={`card p-5 ${c.status === 'inactive' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-dark bg-yellow-100 px-2 py-1 rounded text-sm">{c.code}</span>
                  <button onClick={() => navigator.clipboard?.writeText(c.code)} className="text-gray-400 hover:text-gray-600 transition-colors"><FiCopy size={13} /></button>
                </div>
                <button onClick={() => handleToggle(c)} className={c.status === 'active' ? 'badge-green cursor-pointer' : 'badge-gray cursor-pointer'}>{c.status}</button>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-semibold text-secondary">
                    {c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Min Order</span><span className="font-medium">₹{c.minOrder || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Usage</span><span className="font-medium">{c.used || 0} / {c.maxUses || '∞'}</span></div>
                {c.expiry && <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className="font-medium">{c.expiry}</span></div>}
              </div>

              {c.maxUses > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(((c.used || 0) / c.maxUses) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(((c.used || 0) / c.maxUses) * 100)}% used</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 transition-colors ml-auto"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
