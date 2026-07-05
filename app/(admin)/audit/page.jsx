'use client';
import { AUDIT_LOGS } from '@/lib/mockData';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';

const MODULE_BADGE = {
  Products: 'badge-blue',
  Orders: 'badge-green',
  Offers: 'badge-yellow',
  Inventory: 'badge-yellow',
  Returns: 'badge-red',
  Marketing: 'badge-blue',
  Banners: 'badge-blue',
  Loyalty: 'badge-green',
};

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const filtered = AUDIT_LOGS.filter(l => {
    const q = search.toLowerCase();
    return l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.module.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark">Audit Logs</h1>
        <p className="text-sm text-gray-500">All admin actions are recorded here</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search action, user, module..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Details</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{l.timestamp}</td>
                <td className="px-4 py-3 font-medium text-dark">{l.user}</td>
                <td className="px-4 py-3">
                  <span className={MODULE_BADGE[l.module] || 'badge-gray'}>{l.module}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">{l.action}</td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell max-w-xs truncate">{l.details}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden lg:table-cell">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No logs found</p>}
      </div>
    </div>
  );
}
