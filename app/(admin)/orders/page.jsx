'use client';
import { useState } from 'react';
import { ORDERS } from '@/lib/mockData';
import { FiSearch, FiDownload, FiEye } from 'react-icons/fi';
import Link from 'next/link';

const STATUS_BADGE = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = ORDERS.filter(o => {
    const q = search.toLowerCase();
    return (
      (o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.city.toLowerCase().includes(q)) &&
      (!filterStatus || o.status === filterStatus)
    );
  });

  const statusCounts = ORDERS.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Orders</h1>
          <p className="text-sm text-gray-500">{ORDERS.length} total orders</p>
        </div>
        <button className="btn-outline"><FiDownload size={15} /> Export</button>
      </div>

      {/* Status quick filters */}
      <div className="flex flex-wrap gap-2">
        {[{ label: 'All', value: '' }, { label: 'Pending', value: 'pending' }, { label: 'Confirmed', value: 'confirmed' }, { label: 'Shipped', value: 'shipped' }, { label: 'Delivered', value: 'delivered' }, { label: 'Cancelled', value: 'cancelled' }].map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilterStatus(value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === value ? 'bg-secondary text-white border-secondary' : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
            }`}
          >
            {label} {value && statusCounts[value] ? `(${statusCounts[value]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search order ID, customer, city..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Order ID</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Items</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-secondary">{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-dark">{o.customer}</p>
                  <p className="text-xs text-gray-400">{o.city}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{o.date}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{o.items}</td>
                <td className="px-4 py-3 font-semibold">₹{o.total.toLocaleString()}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={o.payment === 'COD' ? 'badge-gray' : 'badge-green'}>{o.payment}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={STATUS_BADGE[o.status] || 'badge-gray'}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/orders/${o.id}`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors inline-flex">
                    <FiEye size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No orders found</p>}
      </div>
    </div>
  );
}
