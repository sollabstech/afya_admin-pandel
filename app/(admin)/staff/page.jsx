'use client';
import { STAFF } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiShield } from 'react-icons/fi';

const ROLE_BADGE = {
  Owner: 'badge-red',
  'App Admin': 'badge-blue',
  'Product Staff': 'badge-yellow',
  'Order Staff': 'badge-green',
  Marketing: 'badge-blue',
  Accounts: 'badge-gray',
};

export default function StaffPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Staff Management</h1>
          <p className="text-sm text-gray-500">{STAFF.length} staff members</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> Add Staff</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STAFF.map(s => (
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
              <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors">
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
