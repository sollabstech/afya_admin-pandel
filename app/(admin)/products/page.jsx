'use client';
import { useState, useEffect } from 'react';
import { getProducts, deleteProduct } from '@/lib/firestore';
import { PRODUCTS as MOCK_PRODUCTS } from '@/lib/mockData';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw } from 'react-icons/fi';

export default function ProductsPage() {
  const [products, setProducts]   = useState(MOCK_PRODUCTS);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      if (data.length > 0) setProducts(data);
    } catch (err) {
      console.warn('Using mock data:', err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)) &&
      (!filterCat || p.category === filterCat) &&
      (!filterStatus || p.status === filterStatus)
    );
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products {loading ? '(loading...)' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          <button className="btn-primary"><FiPlus size={16} /> Add Product</button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, SKU, brand..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input w-auto min-w-36">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto min-w-36">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Brand</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <span className="font-medium text-dark line-clamp-1 max-w-[180px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.category}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.brand}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">₹{p.price}</span>
                  {p.mrp > p.price && <span className="text-xs text-gray-400 line-through ml-1">₹{p.mrp}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}>
                    {p.stock === 0 ? 'Out' : p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={p.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {p.status === 'out_of_stock' ? 'Out of Stock' : p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No products found</p>}
      </div>
    </div>
  );
}
