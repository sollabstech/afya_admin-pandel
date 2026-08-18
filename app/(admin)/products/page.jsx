'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProducts, getTrashedProducts, trashProduct, restoreProduct,
  deleteProduct, duplicateProduct, updateProduct,
} from '@/lib/firestore';
import { PRODUCTS as MOCK_PRODUCTS } from '@/lib/mockData';
import {
  FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiImage,
  FiCopy, FiRotateCcw, FiEye, FiChevronDown, FiPackage,
  FiAlertTriangle, FiCheck, FiX,
} from 'react-icons/fi';

const CATS = ['toys', 'foods', 'appliances', 'supermarket'];
const STATUSES = ['active', 'inactive', 'out_of_stock', 'draft', 'archived'];

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [filterCat, setFilterCat]         = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterType, setFilterType]       = useState(''); // '' | 'simple' | 'variable'
  const [trashMode, setTrashMode]         = useState(false);
  const [selected, setSelected]           = useState(new Set());
  const [bulkAction, setBulkAction]       = useState('');
  const [applyingBulk, setApplyingBulk]  = useState(false);
  const [actionMsg, setActionMsg]         = useState('');

  const load = async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const DUMMY_CATS = ['toys', 'foods', 'appliances', 'supermarket'];
      const [firestoreData, dummyRes] = await Promise.allSettled([
        trashMode ? getTrashedProducts() : getProducts(),
        !trashMode ? fetch('https://dummyjson.com/products?limit=80').then(r => r.json()) : Promise.reject('skip'),
      ]);

      const fsProducts = firestoreData.status === 'fulfilled' ? (firestoreData.value || []) : [];
      const dummyProducts = (!trashMode && dummyRes.status === 'fulfilled')
        ? (dummyRes.value.products || []).map((p, i) => ({
            id: `live-${p.id}`,
            name: p.title,
            productType: 'simple',
            category: DUMMY_CATS[i % DUMMY_CATS.length],
            brand: p.brand || p.category,
            price: Math.round(p.price * 80),
            originalPrice: Math.round(p.price * 80 * (1 + (p.discountPercentage || 12) / 100)),
            stock: p.stock,
            status: p.stock > 0 ? 'active' : 'out_of_stock',
            image: p.thumbnail,
            sku: `DUMMY-${p.id}`,
            rating: p.rating,
            reviews: Math.round((p.rating || 4) * 47),
            description: p.description,
          }))
        : [];

      const fsIds = new Set(fsProducts.map(p => p.id));
      const merged = [...fsProducts, ...dummyProducts.filter(p => !fsIds.has(p.id))];
      setProducts(merged.length > 0 ? merged : (trashMode ? [] : MOCK_PRODUCTS));
    } catch (err) {
      console.warn('Load error:', err.message);
      if (!trashMode) setProducts(MOCK_PRODUCTS);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [trashMode]);

  const categories = [...new Set([...CATS, ...products.map(p => p.category).filter(Boolean)])];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)) &&
      (!filterCat || p.category === filterCat) &&
      (!filterStatus || p.status === filterStatus) &&
      (!filterType || (p.productType || 'simple') === filterType)
    );
  });

  // ── Selection helpers ────────────────────────────────────────
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  };
  const toggle = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  // ── Bulk actions ─────────────────────────────────────────────
  const applyBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    if (!confirm(`Apply "${bulkAction}" to ${selected.size} product(s)?`)) return;
    setApplyingBulk(true);
    try {
      const ids = [...selected].filter(id => !id.startsWith('live-')); // only Firestore docs
      if (ids.length < selected.size) {
        setActionMsg(`Note: ${selected.size - ids.length} catalogue product(s) skipped (read-only).`);
      }
      await Promise.all(ids.map(id => {
        if (bulkAction === 'trash') return trashProduct(id);
        if (bulkAction === 'activate') return updateProduct(id, { status: 'active' });
        if (bulkAction === 'deactivate') return updateProduct(id, { status: 'inactive' });
        if (bulkAction === 'restore') return restoreProduct(id);
        if (bulkAction === 'delete') return deleteProduct(id);
        return Promise.resolve();
      }));
      setBulkAction('');
      await load();
    } catch (err) { alert(err.message); }
    setApplyingBulk(false);
  };

  const handleTrash = async (id) => {
    if (!confirm('Move this product to trash?')) return;
    try { await trashProduct(id); setProducts(p => p.filter(x => x.id !== id)); }
    catch (err) { alert(err.message); }
  };

  const handleRestore = async (id) => {
    try { await restoreProduct(id); setProducts(p => p.filter(x => x.id !== id)); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this product? This cannot be undone.')) return;
    try { await deleteProduct(id); setProducts(p => p.filter(x => x.id !== id)); }
    catch (err) { alert(err.message); }
  };

  const handleDuplicate = async (id) => {
    if (id.startsWith('live-')) { alert('Cannot duplicate catalogue products.'); return; }
    try {
      const newId = await duplicateProduct(id);
      await load();
      setActionMsg('Product duplicated as draft.');
    } catch (err) { alert(err.message); }
  };

  const isFirestore = (id) => !id.startsWith('live-');

  const statusBadge = (s) => {
    if (s === 'active') return <span className="badge-green">Active</span>;
    if (s === 'out_of_stock') return <span className="badge-yellow">Out of Stock</span>;
    if (s === 'archived') return <span className="badge-red">Archived</span>;
    if (s === 'draft') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Draft</span>;
    return <span className="badge-red">{s || 'inactive'}</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">{trashMode ? 'Trash' : 'Products'}</h1>
          <p className="text-sm text-gray-500">
            {trashMode ? `${products.length} trashed product(s)` : `${products.length} products total`}
            {loading && ' (loading...)'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTrashMode(t => !t)}
            className={`btn-outline ${trashMode ? 'border-orange-300 text-orange-600' : ''}`}
          >
            <FiTrash2 size={14} /> {trashMode ? 'Exit Trash' : 'Trash'}
          </button>
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          {!trashMode && (
            <Link href="/products/new" className="btn-primary flex items-center gap-1.5">
              <FiPlus size={16} /> Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Action message */}
      {actionMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <FiCheck size={15} />
          {actionMsg}
          <button onClick={() => setActionMsg('')} className="ml-auto"><FiX size={14} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search name, SKU, brand..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input w-auto min-w-36">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input w-auto min-w-32">
          <option value="">All Types</option>
          <option value="simple">Simple</option>
          <option value="variable">Variable</option>
        </select>
        {!trashMode && (
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input w-auto min-w-36">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="inactive">Inactive</option>
          </select>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-dark">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="input w-auto text-sm">
            <option value="">Choose action...</option>
            {trashMode ? (
              <>
                <option value="restore">Restore</option>
                <option value="delete">Delete Permanently</option>
              </>
            ) : (
              <>
                <option value="activate">Set Active</option>
                <option value="deactivate">Set Inactive</option>
                <option value="trash">Move to Trash</option>
              </>
            )}
          </select>
          <button onClick={applyBulk} disabled={!bulkAction || applyingBulk} className="btn-primary text-sm py-1.5">
            {applyingBulk ? 'Applying...' : 'Apply'}
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-sm text-gray-500 hover:text-dark">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-primary"
                />
              </th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Brand</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                <FiPackage size={32} className="mx-auto mb-2 opacity-30" />
                Loading products...
              </td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                {trashMode ? 'Trash is empty.' : 'No products found.'}
              </td></tr>
            )}
            {!loading && filtered.map(p => (
              <tr key={p.id} className={`hover:bg-gray-50 ${selected.has(p.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    className="w-4 h-4 accent-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                      : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><FiImage size={16} className="text-gray-400" /></div>
                    }
                    <div className="min-w-0">
                      <p className="font-medium text-dark line-clamp-1 max-w-[200px]">{p.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.productType === 'variable' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.productType === 'variable' ? 'Variable' : 'Simple'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku || '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell capitalize">{p.category || '—'}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.brand || '—'}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">₹{p.price}</span>
                  {(p.originalPrice || p.mrp) > p.price && (
                    <span className="text-xs text-gray-400 line-through ml-1">₹{p.originalPrice || p.mrp}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {p.productType === 'variable'
                    ? <span className="text-xs text-gray-500">Variations</span>
                    : <span className={p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                  }
                </td>
                <td className="px-4 py-3">{statusBadge(p.status)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View on storefront */}
                    {!trashMode && p.slug && (
                      <a
                        href={`http://localhost:3000/products/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"
                        title="View on site"
                      >
                        <FiEye size={14} />
                      </a>
                    )}
                    {/* Edit — only Firestore products */}
                    {!trashMode && isFirestore(p.id) && (
                      <Link href={`/products/${p.id}/edit`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Edit">
                        <FiEdit2 size={14} />
                      </Link>
                    )}
                    {/* Duplicate */}
                    {!trashMode && isFirestore(p.id) && (
                      <button onClick={() => handleDuplicate(p.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors" title="Duplicate">
                        <FiCopy size={14} />
                      </button>
                    )}
                    {/* Trash / Restore / Delete */}
                    {trashMode ? (
                      <>
                        <button onClick={() => handleRestore(p.id)} className="p-1.5 rounded hover:bg-green-50 text-gray-500 hover:text-green-600 transition-colors" title="Restore">
                          <FiRotateCcw size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete permanently">
                          <FiTrash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleTrash(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Move to trash">
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
}
