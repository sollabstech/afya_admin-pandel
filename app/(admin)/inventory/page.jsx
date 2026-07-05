'use client';
import { useState } from 'react';
import { PRODUCTS } from '@/lib/mockData';
import { FiSearch, FiAlertCircle } from 'react-icons/fi';

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    if (filter === 'low') return matchSearch && p.stock > 0 && p.stock <= 10;
    if (filter === 'out') return matchSearch && p.stock === 0;
    if (filter === 'ok') return matchSearch && p.stock > 10;
    return matchSearch;
  });

  const outCount = PRODUCTS.filter(p => p.stock === 0).length;
  const lowCount = PRODUCTS.filter(p => p.stock > 0 && p.stock <= 10).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark">Inventory</h1>
        <p className="text-sm text-gray-500">Monitor stock levels across all products</p>
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
          <p className="text-3xl font-bold text-green-600 mt-1">{PRODUCTS.length - outCount - lowCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search product or SKU..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <div className="flex gap-2">
          {[['all','All'],['out','Out of Stock'],['low','Low Stock'],['ok','In Stock']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === v ? 'bg-secondary text-white border-secondary' : 'border-gray-200 text-gray-600 hover:border-secondary'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 font-medium">Current Stock</th>
              <th className="px-4 py-3 font-medium">Stock Status</th>
              <th className="px-4 py-3 font-medium text-right">Update Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-gray-50 ${p.stock === 0 ? 'bg-red-50' : p.stock <= 5 ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                    <span className="font-medium text-dark line-clamp-1 max-w-[180px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.category}</td>
                <td className="px-4 py-3 font-bold text-lg">{p.stock}</td>
                <td className="px-4 py-3">
                  {p.stock === 0 ? <span className="badge-red flex items-center gap-1"><FiAlertCircle size={11}/>Out of Stock</span>
                    : p.stock <= 5 ? <span className="badge-yellow">Low Stock</span>
                    : <span className="badge-green">In Stock</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="btn-outline py-1 px-3 text-xs">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
