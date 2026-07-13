'use client';
import { useState, useEffect } from 'react';
import { getCustomers } from '@/lib/firestore';
import { FiSearch, FiDownload, FiRefreshCw } from 'react-icons/fi';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Customers</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${customers.length} registered customers`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn-outline"><FiDownload size={15} /> Export</button>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, email, phone..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
            Loading customers...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.photo ? (
                        <img src={c.photo} alt={c.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-dark font-bold text-xs flex-shrink-0">
                          {(c.name || c.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-dark">{c.name || '—'}</p>
                        <p className="text-xs text-gray-400">{c.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(c.updatedAt || c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className="badge-green">Google</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {customers.length === 0 ? 'No customers yet. Users who sign up on the website will appear here.' : 'No customers match your search.'}
          </p>
        )}
      </div>
    </div>
  );
}
