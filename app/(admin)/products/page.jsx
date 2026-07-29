'use client';
import { useState, useEffect, useRef } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/firestore';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PRODUCTS as MOCK_PRODUCTS } from '@/lib/mockData';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiRefreshCw, FiX, FiUpload, FiImage } from 'react-icons/fi';

const CATEGORIES = ['toys', 'foods', 'appliances', 'supermarket', 'beauty', 'health', 'clothing', 'electronics', 'other'];
const EMPTY_FORM = {
  name: '', sku: '', category: '', brand: '', price: '', originalPrice: '',
  stock: '', description: '', status: 'active', rating: '4.0', reviews: '0', image: '',
};

export default function ProductsPage() {
  const [products, setProducts]         = useState(MOCK_PRODUCTS);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterCat, setFilterCat]       = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // modal state
  const [modal, setModal]               = useState(null); // null | 'add' | 'edit'
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState('');
  const [editingId, setEditingId]       = useState(null);
  const fileInputRef                    = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const CATS = ['toys', 'foods', 'appliances', 'supermarket'];
      const [firestoreData, dummyRes] = await Promise.allSettled([
        getProducts(),
        fetch('https://dummyjson.com/products?limit=80').then(r => r.json()),
      ]);

      const fsProducts = firestoreData.status === 'fulfilled' ? (firestoreData.value || []) : [];
      const dummyProducts = dummyRes.status === 'fulfilled'
        ? (dummyRes.value.products || []).map((p, i) => ({
            id: `live-${p.id}`,
            name: p.title,
            category: CATS[i % CATS.length],
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
      setProducts(merged.length > 0 ? merged : MOCK_PRODUCTS);
    } catch (err) {
      console.warn('Using mock data:', err.message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = [...new Set([...CATEGORIES, ...products.map(p => p.category).filter(Boolean)])];
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)) &&
      (!filterCat || p.category === filterCat) &&
      (!filterStatus || p.status === filterStatus)
    );
  });

  // ── Modal helpers ──────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setEditingId(null);
    setModal('add');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name || '', sku: p.sku || '', category: (p.category || '').toLowerCase(),
      brand: p.brand || '', price: p.price ?? '', originalPrice: p.originalPrice ?? p.mrp ?? '',
      stock: p.stock ?? '', description: p.description || '', status: p.status || 'active',
      rating: p.rating ?? '4.0', reviews: p.reviews ?? '0', image: p.image || '',
    });
    setImageFile(null);
    setImagePreview(p.image || '');
    setFormError('');
    setEditingId(p.id);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingId(null); };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFormError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setFormError('Image must be under 5 MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image || '';
    setUploading(true);
    try {
      const path = `products/${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, imageFile);
      return await getDownloadURL(storageRef);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Product name is required.'); return; }
    if (!form.price || isNaN(Number(form.price))) { setFormError('Valid price is required.'); return; }
    if (form.stock === '' || isNaN(Number(form.stock))) { setFormError('Valid stock quantity is required.'); return; }

    setSaving(true);
    try {
      const imageUrl = await uploadImage();
      const stock = Number(form.stock);
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || `SKU-${Date.now()}`,
        category: form.category || 'other',
        brand: form.brand.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        mrp: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        stock,
        description: form.description.trim(),
        status: stock === 0 ? 'out_of_stock' : form.status,
        rating: Number(form.rating) || 4.0,
        reviews: Number(form.reviews) || 0,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      };

      if (modal === 'add') {
        await addProduct(payload);
      } else {
        await updateProduct(editingId, payload);
      }
      await load();
      closeModal();
    } catch (err) {
      setFormError('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="input text-sm"
        {...extra}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Products</h1>
          <p className="text-sm text-gray-500">{products.length} products {loading ? '(loading...)' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
          <button onClick={openAdd} className="btn-primary"><FiPlus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Filters */}
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

      {/* Table */}
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
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                      : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0"><FiImage size={16} className="text-gray-400" /></div>
                    }
                    <span className="font-medium text-dark line-clamp-1 max-w-[180px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell capitalize">{p.category}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.brand}</td>
                <td className="px-4 py-3">
                  <span className="font-semibold">₹{p.price}</span>
                  {(p.originalPrice || p.mrp) > p.price && (
                    <span className="text-xs text-gray-400 line-through ml-1">₹{p.originalPrice || p.mrp}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}>
                    {p.stock === 0 ? 'Out' : p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={p.status === 'active' ? 'badge-green' : 'badge-red'}>
                    {p.status === 'out_of_stock' ? 'Out of Stock' : p.status || 'active'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors" title="Edit"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="Delete"><FiTrash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">No products found</p>}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">
                {modal === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Product Image</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50 overflow-hidden">
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      : <FiImage size={28} className="text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-outline text-sm flex items-center gap-2"
                    >
                      <FiUpload size={14} /> {imagePreview ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <p className="text-xs text-gray-400">PNG, JPG, WebP — max 5 MB</p>
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={imageFile ? '' : form.image}
                      onChange={e => {
                        setForm(f => ({ ...f, image: e.target.value }));
                        setImagePreview(e.target.value);
                        setImageFile(null);
                      }}
                      className="input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('Product Name *', 'name', 'text', { placeholder: 'e.g. Himalaya Baby Lotion 200ml', required: true })}
                {field('SKU', 'sku', 'text', { placeholder: 'e.g. HBL-200' })}
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input text-sm">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {field('Brand', 'brand', 'text', { placeholder: 'e.g. Himalaya' })}
              </div>

              {/* Price / MRP / Stock / Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {field('Selling Price (₹) *', 'price', 'number', { placeholder: '299', min: '0', step: '0.01' })}
                {field('MRP / Original Price (₹)', 'originalPrice', 'number', { placeholder: '399', min: '0', step: '0.01' })}
                {field('Stock *', 'stock', 'number', { placeholder: '50', min: '0' })}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Rating & Reviews */}
              <div className="grid grid-cols-2 gap-4">
                {field('Rating (0–5)', 'rating', 'number', { placeholder: '4.0', min: '0', max: '5', step: '0.1' })}
                {field('Review Count', 'reviews', 'number', { placeholder: '0', min: '0' })}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input text-sm resize-none"
                  rows={3}
                  placeholder="Product description..."
                />
              </div>

              {formError && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-outline">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="btn-primary">
                  {uploading ? 'Uploading image...' : saving ? 'Saving...' : modal === 'add' ? 'Add Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
