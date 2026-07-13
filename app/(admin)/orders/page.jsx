'use client';
import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { FiSearch, FiDownload, FiEye, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';

const STATUS_BADGE = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const customerName = o.address?.name || o.customer || '';
    const city = o.address?.city || o.city || '';
    return (
      (o.id.toLowerCase().includes(q) || customerName.toLowerCase().includes(q) || city.toLowerCase().includes(q)) &&
      (!filterStatus || o.status === filterStatus)
    );
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Orders</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${orders.length} total orders`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn-outline"><FiDownload size={15} /> Export</button>
        </div>
      </div>

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

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search order ID, customer, city..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
            Loading orders...
          </div>
        ) : (
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
                  <td className="px-4 py-3 font-medium text-secondary font-mono text-xs">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-dark">{o.address?.name || o.customer || '—'}</p>
                    <p className="text-xs text-gray-400">{o.address?.city || o.city || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{o.items?.length ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">₹{(o.total || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={o.payment === 'cod' ? 'badge-gray' : 'badge-green'}>{o.payment || '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[o.status] || 'badge-gray'}>{o.status || 'pending'}</span>
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
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {orders.length === 0 ? 'No orders yet. Orders placed on the website will appear here.' : 'No orders match your filter.'}
          </p>
        )}
      </div>
    </div>
  );
}
