'use client';
import { useState } from 'react';
import { CUSTOMERS } from '@/lib/mockData';
import { FiSearch, FiDownload } from 'react-icons/fi';

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const filtered = CUSTOMERS.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Customers</h1>
          <p className="text-sm text-gray-500">{CUSTOMERS.length} registered customers</p>
        </div>
        <button className="btn-outline"><FiDownload size={15} /> Export</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Phone</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">City</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total Spent</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Loyalty Pts</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Last Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-dark">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phone}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{c.city}</td>
                <td className="px-4 py-3 font-medium">{c.orders}</td>
                <td className="px-4 py-3 font-semibold">₹{c.totalSpent.toLocaleString()}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="badge-yellow">{c.loyaltyPoints} pts</span>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.lastOrder}</td>
                <td className="px-4 py-3">
                  <span className={c.status === 'active' ? 'badge-green' : 'badge-gray'}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No customers found</p>}
      </div>
    </div>
  );
}
