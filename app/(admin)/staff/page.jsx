'use client';
import { useState } from 'react';
import { updateStaff } from '@/lib/firestore';
import { STAFF as INITIAL_STAFF } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiShield, FiX } from 'react-icons/fi';

const ROLES = ['Owner', 'App Admin', 'Product Staff', 'Order Staff', 'Marketing', 'Accounts'];

const ROLE_BADGE = {
  Owner: 'badge-red',
  'App Admin': 'badge-blue',
  'Product Staff': 'badge-yellow',
  'Order Staff': 'badge-green',
  Marketing: 'badge-blue',
  Accounts: 'badge-gray',
};

export default function StaffPage() {
  const [staff, setStaff]       = useState(INITIAL_STAFF);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState({});
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email, role: s.role, phone: s.phone, status: s.status, permissions: s.permissions });
    setEditingId(s.id);
    setError('');
  };

  const closeModal = () => { setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    try {
      await updateStaff(editingId, form);
      setStaff(prev => prev.map(s => s.id === editingId ? { ...s, ...form } : s));
      closeModal();
    } catch (err) {
      setError('Error: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Staff Management</h1>
          <p className="text-sm text-gray-500">{staff.length} staff members</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> Add Staff</button>
      </div>

      {/* Edit Modal */}
      {editingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">Edit Staff Member</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" type="email" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                  <select value={form.role || ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status || 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Permissions</label>
                  <input value={form.permissions || ''} onChange={e => setForm(f => ({ ...f, permissions: e.target.value }))} className="input" placeholder="e.g. products, orders" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map(s => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-dark text-sm flex-shrink-0">
                  {s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-dark">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.email}</p>
                </div>
              </div>
              <button
                onClick={() => openEdit(s)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"
                title="Edit staff member"
              >
                <FiEdit2 size={14} />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={ROLE_BADGE[s.role] || 'badge-gray'}>{s.role}</span>
              <span className={s.status === 'active' ? 'badge-green' : 'badge-gray'}>{s.status}</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>Phone: {s.phone}</span>
              <span>Last login: {s.lastLogin}</span>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <FiShield size={12} />
              <span>Permissions: <span className="font-medium text-dark">{s.permissions}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
