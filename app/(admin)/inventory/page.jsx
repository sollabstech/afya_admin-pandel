'use client';
import { useState, useEffect } from 'react';
import { getProducts, updateStock } from '@/lib/firestore';
import { PRODUCTS as MOCK_PRODUCTS } from '@/lib/mockData';
import { FiSearch, FiAlertCircle, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [editing, setEditing]   = useState({}); // { [id]: newStockValue }
  const [saving, setSaving]     = useState({});  // { [id]: true }

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
    } catch {
      setProducts(MOCK_PRODUCTS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    if (filter === 'low') return matchSearch && p.stock > 0 && p.stock <= 10;
    if (filter === 'out') return matchSearch && p.stock === 0;
    if (filter === 'ok')  return matchSearch && p.stock > 10;
    return matchSearch;
  });

  const outCount   = products.filter(p => p.stock === 0).length;
  const lowCount   = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const okCount    = products.length - outCount - lowCount;

  const startEdit = (p) => setEditing(e => ({ ...e, [p.id]: String(p.stock) }));
  const cancelEdit = (id) => setEditing(e => { const n = { ...e }; delete n[id]; return n; });

  const handleUpdate = async (p) => {
    const newStock = parseInt(editing[p.id], 10);
    if (isNaN(newStock) || newStock < 0) { alert('Enter a valid stock number'); return; }
    setSaving(s => ({ ...s, [p.id]: true }));
    try {
      await updateStock(p.id, newStock);
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, stock: newStock, status: newStock === 0 ? 'out_of_stock' : 'active' } : x));
      cancelEdit(p.id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setSaving(s => { const n = { ...s }; delete n[p.id]; return n; });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Inventory</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${products.length} products`}</p>
        </div>
        <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
      </div>

      {/* Alert cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-red-400">
          <p className="text-sm font-medium text-red-600">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{outCount}</p>
        </div>
        <div className="card p-4 border-l-4 border-yellow-400">
          <p className="text-sm font-medium text-yellow-600">Low Stock (≤10)</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{lowCount}</p>
        </div>
        <div className="card p-4 border-l-4 border-green-400">
          <p className="text-sm font-medium text-green-600">Healthy Stock</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{okCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search product or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all','All'],['out','Out of Stock'],['low','Low Stock'],['ok','In Stock']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === v ? 'bg-secondary text-white border-secondary' : 'border-gray-200 text-gray-600 hover:border-secondary'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
            Loading inventory...
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-medium">Current Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Update Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 ${p.stock === 0 ? 'bg-red-50/40' : p.stock <= 5 ? 'bg-yellow-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                      }
                      <span className="font-medium text-dark line-clamp-1 max-w-[180px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell capitalize">{p.category}</td>
                  <td className="px-4 py-3 font-bold text-lg">{p.stock}</td>
                  <td className="px-4 py-3">
                    {p.stock === 0
                      ? <span className="badge-red flex items-center gap-1"><FiAlertCircle size={11}/>Out of Stock</span>
                      : p.stock <= 5 ? <span className="badge-yellow">Low Stock</span>
                      : <span className="badge-green">In Stock</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editing[p.id] !== undefined ? (
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editing[p.id]}
                          onChange={e => setEditing(ed => ({ ...ed, [p.id]: e.target.value }))}
                          className="input w-20 text-sm py-1 px-2 text-center"
                          autoFocus
                        />
                        <button onClick={() => handleUpdate(p)} disabled={saving[p.id]} className="p-1.5 rounded bg-green-500 text-white hover:bg-green-600">
                          {saving[p.id] ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiCheck size={13} />}
                        </button>
                        <button onClick={() => cancelEdit(p.id)} className="p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"><FiX size={13} /></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(p)} className="btn-outline py-1 px-3 text-xs">Update</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length === 0 && <p className="text-center text-gray-400 py-10">No products found</p>}
      </div>
    </div>
  );
}
