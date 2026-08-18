'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  addProduct, updateProduct, getProductById,
  getAttributes, getCategories, getBrands,
  addProductAuditLog, isSlugUnique, generateSlug,
} from '@/lib/firestore';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  FiSave, FiArrowLeft, FiPlus, FiTrash2, FiUpload, FiImage,
  FiInfo, FiRefreshCw, FiCheck, FiAlertCircle, FiPackage,
  FiDollarSign, FiLayers, FiCpu, FiGlobe, FiBox, FiX,
  FiZap, FiGrid, FiTag,
} from 'react-icons/fi';
import { ALL_CATEGORIES, getCategoryConfig } from '@/lib/categoryConfig';

// ALL_CATEGORIES comes from categoryConfig — drop the old hardcoded list
const CATEGORY_VALUES = ALL_CATEGORIES.map(c => c.value);
const CONDITIONS = ['New', 'Used', 'Refurbished', 'Open Box'];
const TAX_CLASSES = ['None', 'GST 5%', 'GST 12%', 'GST 18%', 'GST 28%'];
const SHIPPING_CLASSES = ['Standard', 'Express', 'Free', 'Heavy Item', 'Fragile'];

const TABS = [
  { id: 'general',     label: 'General',      icon: FiPackage },
  { id: 'pricing',     label: 'Pricing',      icon: FiDollarSign },
  { id: 'inventory',   label: 'Inventory',    icon: FiGrid },
  { id: 'variations',  label: 'Variations',   icon: FiZap },
  { id: 'images',      label: 'Images',       icon: FiImage },
  { id: 'shipping',    label: 'Shipping',     icon: FiBox },
  { id: 'seo',         label: 'SEO',          icon: FiGlobe },
  { id: 'additional',  label: 'Additional',   icon: FiCpu },
];

const EMPTY = {
  // General
  name: '', slug: '', productType: 'simple', category: '', brand: '', tags: '',
  shortDescription: '', description: '',
  // Pricing
  price: '', originalPrice: '', salePrice: '', saleDateStart: '', saleDateEnd: '',
  taxClass: 'None', taxStatus: 'taxable',
  // Inventory
  sku: '', manageStock: true, stock: '', stockStatus: 'instock', lowStockThreshold: '5',
  soldIndividually: false,
  // Shipping
  weight: '', dimensionL: '', dimensionW: '', dimensionH: '', shippingClass: 'Standard', freeShipping: false,
  // SEO
  metaTitle: '', metaDescription: '', focusKeyword: '',
  // Additional
  condition: 'New', warranty: '', countryOfOrigin: 'India', customFields: [],
  // Status
  status: 'draft', isFeatured: false, visibility: 'visible',
  // Images
  image: '', images: [],
  // Attributes / Variations
  attributes: [],   // [{ id, name, values: [], useForVariations: true }]
  variations: [],   // [{ id, attributes: {}, price, stock, sku, image, status }]
};

function slugify(s) {
  return (s || '').toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '');
}

function genVariationId() {
  return 'v' + Math.random().toString(36).slice(2, 8);
}

// Generate cross-product of attribute values
function generateVariationCombinations(attributes) {
  const varAttrs = attributes.filter(a => a.useForVariations && a.values.length > 0);
  if (varAttrs.length === 0) return [];
  const combos = varAttrs.reduce((acc, attr) => {
    if (acc.length === 0) return attr.values.map(v => ({ [attr.name]: v }));
    return acc.flatMap(combo => attr.values.map(v => ({ ...combo, [attr.name]: v })));
  }, []);
  return combos.map(attrs => ({ id: genVariationId(), attributes: attrs, price: '', stock: '', sku: '', image: '', status: 'active' }));
}

export default function ProductForm({ mode = 'new', productId = null }) {
  const router = useRouter();
  const [tab, setTab]                     = useState('general');
  const [form, setForm]                   = useState(EMPTY);
  const [loading, setLoading]             = useState(mode === 'edit');
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [slugStatus, setSlugStatus]       = useState(''); // '' | 'checking' | 'ok' | 'taken'
  const [slugTouched, setSlugTouched]     = useState(false);
  const [globalAttrs, setGlobalAttrs]     = useState([]);
  const [categories, setCategories]       = useState(CATEGORY_VALUES);
  const [brands, setBrands]               = useState([]);
  const [newAttrId, setNewAttrId]         = useState('');
  const [newAttrCustomValues, setNewAttrCustomValues] = useState('');
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const mainImgRef                        = useRef(null);
  const galleryImgRef                     = useRef(null);

  // Load initial data
  useEffect(() => {
    (async () => {
      const [gAttrs, cats, brnds] = await Promise.allSettled([
        getAttributes(), getCategories(), getBrands(),
      ]);
      if (gAttrs.status === 'fulfilled') setGlobalAttrs(gAttrs.value || []);
      if (cats.status === 'fulfilled' && (cats.value || []).length > 0) {
        setCategories(cats.value.map(c => c.name?.toLowerCase() || c.id));
      }
      if (brnds.status === 'fulfilled') setBrands((brnds.value || []).map(b => b.name));
      if (mode === 'edit' && productId) {
        try {
          const p = await getProductById(productId);
          if (p) {
            setForm({
              ...EMPTY,
              ...p,
              tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || ''),
              attributes: p.attributes || [],
              variations: p.variations || [],
              customFields: p.customFields || [],
              images: p.images || (p.image ? [p.image] : []),
            });
            setSlugTouched(true);
          }
        } catch (e) { setError('Failed to load product: ' + e.message); }
        setLoading(false);
      }
    })();
  }, [mode, productId]);

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    setForm(f => {
      const next = { ...f, name: val };
      if (!slugTouched) next.slug = slugify(val);
      return next;
    });
  };

  // Validate slug uniqueness
  const checkSlug = useCallback(async (slug) => {
    if (!slug) { setSlugStatus(''); return; }
    setSlugStatus('checking');
    const unique = await isSlugUnique(slug, mode === 'edit' ? productId : null);
    setSlugStatus(unique ? 'ok' : 'taken');
  }, [mode, productId]);

  useEffect(() => {
    if (!form.slug) { setSlugStatus(''); return; }
    const timer = setTimeout(() => checkSlug(form.slug), 500);
    return () => clearTimeout(timer);
  }, [form.slug, checkSlug]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Category Template system ────────────────────────────────
  const [templateApplied, setTemplateApplied] = useState(false);

  const applyTemplate = (catSlug) => {
    const cfg = getCategoryConfig(catSlug);
    if (!cfg) return;

    // Build attribute rows from templates (don't duplicate existing ones)
    const existingNames = new Set(form.attributes.map(a => a.name));
    const newAttrs = cfg.attributeTemplates
      .filter(t => !existingNames.has(t.name))
      .map(t => ({ id: 'tpl-' + t.name.toLowerCase().replace(/\s+/g, '-'), name: t.name, values: [], globalValues: t.values, useForVariations: t.useForVariations }));

    // Build custom fields (don't duplicate existing keys)
    const existingKeys = new Set(form.customFields.map(cf => cf.key));
    const newCFs = cfg.customFieldTemplates.filter(cf => !existingKeys.has(cf.key));

    setForm(f => ({
      ...f,
      attributes: [...f.attributes, ...newAttrs],
      customFields: [...f.customFields, ...newCFs],
    }));
    setTemplateApplied(true);
    setSuccess(`${cfg.emoji} ${cfg.label} template applied — ${newAttrs.length} attribute(s) and ${newCFs.length} custom field(s) added.`);
    setTimeout(() => setSuccess(''), 5000);
  };

  // ── Image upload helpers ────────────────────────────────────
  const uploadFile = async (file, path) => {
    const sRef = storageRef(storage, path);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  };

  const handleMainImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setUploadingMain(true);
    try {
      const url = await uploadFile(file, `products/${Date.now()}-${file.name.replace(/\s+/g, '_')}`);
      set('image', url);
      setForm(f => ({ ...f, images: f.images.includes(url) ? f.images : [url, ...f.images.filter(i => i !== f.image)] }));
    } catch (err) { setError('Upload failed: ' + err.message); }
    setUploadingMain(false);
  };

  const handleGalleryImages = async (e) => {
    const files = [...(e.target.files || [])];
    if (files.length === 0) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(f => uploadFile(f, `products/${Date.now()}-${f.name.replace(/\s+/g, '_')}`)));
      setForm(f => ({ ...f, images: [...f.images, ...urls.filter(u => !f.images.includes(u))] }));
    } catch (err) { setError('Gallery upload failed: ' + err.message); }
    setUploadingGallery(false);
  };

  // ── Attribute helpers ────────────────────────────────────────
  const addAttributeFromLibrary = () => {
    if (!newAttrId) return;
    const attr = globalAttrs.find(a => a.id === newAttrId);
    if (!attr) return;
    if (form.attributes.find(a => a.id === attr.id)) { setError('Attribute already added.'); return; }
    setForm(f => ({ ...f, attributes: [...f.attributes, { id: attr.id, name: attr.name, values: [], globalValues: attr.values || [], useForVariations: attr.isVariation !== false }] }));
    setNewAttrId('');
    setError('');
  };

  const addCustomAttribute = () => {
    if (!newAttrCustomValues.trim()) return;
    const id = 'custom-' + Date.now();
    setForm(f => ({ ...f, attributes: [...f.attributes, { id, name: 'Custom', values: newAttrCustomValues.split(',').map(v => v.trim()).filter(Boolean), globalValues: [], useForVariations: true }] }));
    setNewAttrCustomValues('');
  };

  const removeAttribute = (id) => setForm(f => ({ ...f, attributes: f.attributes.filter(a => a.id !== id) }));

  const updateAttrValues = (id, rawVal) => {
    const vals = rawVal.split(',').map(v => v.trim()).filter(Boolean);
    setForm(f => ({ ...f, attributes: f.attributes.map(a => a.id === id ? { ...a, values: vals } : a) }));
  };

  const toggleAttrVariation = (id) => {
    setForm(f => ({ ...f, attributes: f.attributes.map(a => a.id === id ? { ...a, useForVariations: !a.useForVariations } : a) }));
  };

  const generateVariations = () => {
    const combos = generateVariationCombinations(form.attributes);
    if (combos.length === 0) { setError('Add at least one attribute with values to generate variations.'); return; }
    // Preserve existing variation data
    const existing = {};
    form.variations.forEach(v => {
      const key = JSON.stringify(v.attributes);
      existing[key] = v;
    });
    const merged = combos.map(c => existing[JSON.stringify(c.attributes)] || c);
    setForm(f => ({ ...f, variations: merged }));
    setError('');
    setSuccess(`Generated ${merged.length} variation(s).`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const updateVariation = (id, key, val) => {
    setForm(f => ({ ...f, variations: f.variations.map(v => v.id === id ? { ...v, [key]: val } : v) }));
  };

  const removeVariation = (id) => setForm(f => ({ ...f, variations: f.variations.filter(v => v.id !== id) }));

  // ── Custom Fields ────────────────────────────────────────────
  const addCustomField = () => setForm(f => ({ ...f, customFields: [...f.customFields, { key: '', value: '' }] }));
  const updateCF = (i, k, v) => setForm(f => {
    const cf = [...f.customFields];
    cf[i] = { ...cf[i], [k]: v };
    return { ...f, customFields: cf };
  });
  const removeCF = (i) => setForm(f => ({ ...f, customFields: f.customFields.filter((_, idx) => idx !== i) }));

  // ── Save ─────────────────────────────────────────────────────
  const handleSave = async (publishStatus = null) => {
    setError('');
    if (!form.name.trim()) { setError('Product name is required.'); setTab('general'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('Valid selling price is required.'); setTab('pricing'); return; }
    if (form.productType === 'simple' && (form.stock === '' || isNaN(Number(form.stock)))) {
      setError('Stock quantity is required for simple products.'); setTab('inventory'); return;
    }
    if (slugStatus === 'taken') { setError('That URL slug is already in use. Please choose a different one.'); setTab('general'); return; }

    setSaving(true);
    try {
      const status = publishStatus || form.status;
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const stock = form.productType === 'simple' ? Number(form.stock) : null;
      const slug = form.slug || slugify(form.name);

      const payload = {
        name: form.name.trim(),
        slug,
        productType: form.productType,
        category: form.category || 'other',
        brand: form.brand.trim(),
        tags,
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        mrp: form.originalPrice ? Number(form.originalPrice) : Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        saleDateStart: form.saleDateStart || null,
        saleDateEnd: form.saleDateEnd || null,
        taxClass: form.taxClass,
        taxStatus: form.taxStatus,
        sku: form.sku.trim() || `SKU-${Date.now()}`,
        manageStock: form.manageStock,
        stock,
        stockStatus: stock === 0 ? 'outofstock' : 'instock',
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        soldIndividually: form.soldIndividually,
        weight: form.weight ? Number(form.weight) : null,
        dimensions: { l: form.dimensionL || '', w: form.dimensionW || '', h: form.dimensionH || '' },
        shippingClass: form.shippingClass,
        freeShipping: form.freeShipping,
        metaTitle: form.metaTitle.trim() || form.name.trim(),
        metaDescription: form.metaDescription.trim(),
        focusKeyword: form.focusKeyword.trim(),
        condition: form.condition,
        warranty: form.warranty.trim(),
        countryOfOrigin: form.countryOfOrigin.trim(),
        customFields: form.customFields.filter(cf => cf.key.trim()),
        status: stock === 0 && form.productType === 'simple' ? 'out_of_stock' : status,
        isFeatured: form.isFeatured,
        visibility: form.visibility,
        image: form.image,
        images: form.images.length > 0 ? form.images : (form.image ? [form.image] : []),
        attributes: form.attributes,
        variations: form.productType === 'variable' ? form.variations : [],
        rating: form.rating || 4.0,
        reviews: form.reviews || 0,
      };

      if (mode === 'add' || mode === 'new') {
        const docRef = await addProduct(payload);
        await addProductAuditLog(docRef.id, 'CREATE', payload).catch(() => {});
        setSuccess('Product created successfully!');
        setTimeout(() => router.push('/products'), 1500);
      } else {
        await updateProduct(productId, payload);
        await addProductAuditLog(productId, 'UPDATE', payload).catch(() => {});
        setSuccess('Product saved!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { setError('Save failed: ' + err.message); }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <FiRefreshCw size={24} className="animate-spin mr-3" /> Loading product...
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 justify-between mb-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/products')} className="btn-outline">
            <FiArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark">{mode === 'edit' ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-xs text-gray-500">{mode === 'edit' ? productId : 'Create a new product'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving} className="btn-outline">
            <FiSave size={14} /> Save Draft
          </button>
          <button onClick={() => handleSave('active')} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Publish Product'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-4">
          <FiAlertCircle size={15} className="flex-shrink-0" />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><FiX size={14} /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 mb-4">
          <FiCheck size={15} className="flex-shrink-0" />
          {success}
        </div>
      )}

      <div className="flex gap-5 items-start">
        {/* Tab sidebar */}
        <div className="flex-shrink-0 w-44 space-y-0.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              disabled={t.id === 'variations' && form.productType !== 'variable'}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                tab === t.id
                  ? 'bg-primary text-dark'
                  : t.id === 'variations' && form.productType !== 'variable'
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <t.icon size={15} className="flex-shrink-0" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">

          {/* ── GENERAL ─────────────────────────────── */}
          {tab === 'general' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">General Information</h2>

              {/* Product Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Product Type</label>
                <div className="flex gap-3">
                  {['simple', 'variable'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => set('productType', type)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-colors capitalize ${
                        form.productType === type
                          ? 'border-primary bg-primary/10 text-dark'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {type === 'simple' ? '📦 Simple Product' : '🎨 Variable Product'}
                    </button>
                  ))}
                </div>
                {form.productType === 'variable' && (
                  <p className="text-xs text-blue-600 mt-1.5">Variable products have multiple variations (e.g. different sizes or colors). Set up attributes in the Variations tab.</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Product Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} className="input" placeholder="e.g. Himalaya Baby Lotion 200ml" />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL Slug</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                    className={`input pr-8 font-mono text-sm ${slugStatus === 'taken' ? 'border-red-400 focus:ring-red-300' : slugStatus === 'ok' ? 'border-green-400' : ''}`}
                    placeholder="auto-generated-from-name"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                    {slugStatus === 'checking' && <FiRefreshCw size={13} className="animate-spin text-gray-400" />}
                    {slugStatus === 'ok' && <FiCheck size={13} className="text-green-500" />}
                    {slugStatus === 'taken' && <FiAlertCircle size={13} className="text-red-500" />}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {slugStatus === 'taken' ? '⚠ This slug is already used by another product.' : 'Used in the product URL: /products/your-slug'}
                </p>
              </div>

              {/* Category & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => { set('category', e.target.value); setTemplateApplied(false); }}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {ALL_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Brand</label>
                  <input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className="input" placeholder="e.g. Himalaya" list="brand-list" />
                  <datalist id="brand-list">{brands.map(b => <option key={b} value={b} />)}</datalist>
                </div>
              </div>

              {/* Category Template Banner */}
              {form.category && getCategoryConfig(form.category) && !templateApplied && (
                <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{getCategoryConfig(form.category).emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800">{getCategoryConfig(form.category).label} Template Available</p>
                    <p className="text-xs text-amber-700 mt-0.5">{getCategoryConfig(form.category).description}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Applies {getCategoryConfig(form.category).attributeTemplates.length} suggested attributes and {getCategoryConfig(form.category).customFieldTemplates.length} custom fields to this product.
                      You can modify everything after.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyTemplate(form.category)}
                    className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors whitespace-nowrap"
                  >
                    <FiTag size={12} className="inline mr-1" />Apply Template
                  </button>
                </div>
              )}
              {templateApplied && getCategoryConfig(form.category) && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <FiCheck size={12} /> {getCategoryConfig(form.category).label} template applied. Check the Variations and Additional tabs.
                </p>
              )}

              {/* Tags */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags <span className="text-gray-400">(comma-separated)</span></label>
                <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} className="input" placeholder="organic, baby-care, lotion" />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Short Description</label>
                <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className="input resize-none text-sm" rows={2} placeholder="One or two sentences shown in product listings..." />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input resize-none text-sm" rows={5} placeholder="Detailed product description, features, ingredients, usage instructions..." />
              </div>
            </div>
          )}

          {/* ── PRICING ─────────────────────────────── */}
          {tab === 'pricing' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">Pricing</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Selling Price (₹) <span className="text-red-400">*</span></label>
                  <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} className="input" placeholder="299" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">MRP / Original Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} className="input" placeholder="399" />
                  {form.price && form.originalPrice && Number(form.originalPrice) > Number(form.price) && (
                    <p className="text-xs text-green-600 mt-1">
                      {Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100)}% off
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sale Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} className="input" placeholder="Optional" />
                </div>
              </div>

              {/* Sale Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sale Start Date</label>
                  <input type="date" value={form.saleDateStart} onChange={e => set('saleDateStart', e.target.value)} className="input text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sale End Date</label>
                  <input type="date" value={form.saleDateEnd} onChange={e => set('saleDateEnd', e.target.value)} className="input text-sm" />
                </div>
              </div>

              {/* Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tax Status</label>
                  <select value={form.taxStatus} onChange={e => set('taxStatus', e.target.value)} className="input">
                    <option value="taxable">Taxable</option>
                    <option value="shipping-only">Shipping only</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tax Class</label>
                  <select value={form.taxClass} onChange={e => set('taxClass', e.target.value)} className="input">
                    {TAX_CLASSES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTORY ────────────────────────────── */}
          {tab === 'inventory' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">Inventory</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU (Stock Keeping Unit)</label>
                  <input type="text" value={form.sku} onChange={e => set('sku', e.target.value)} className="input font-mono text-sm" placeholder="e.g. HBL-200-ML" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock Status</label>
                  <select value={form.stockStatus} onChange={e => set('stockStatus', e.target.value)} className="input">
                    <option value="instock">In Stock</option>
                    <option value="outofstock">Out of Stock</option>
                    <option value="onbackorder">On Backorder</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.manageStock} onChange={e => set('manageStock', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700 font-medium">Manage stock quantity</span>
              </label>

              {form.manageStock && form.productType === 'simple' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-6 border-l-2 border-primary/20">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stock Quantity {form.productType === 'simple' && <span className="text-red-400">*</span>}</label>
                    <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Alert (qty)</label>
                    <input type="number" min="0" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} className="input" placeholder="5" />
                  </div>
                </div>
              )}

              {form.productType === 'variable' && (
                <div className="px-4 py-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  <FiInfo size={14} className="inline mr-1" />
                  Stock is managed per variation for variable products. Set it in the Variations tab.
                </div>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.soldIndividually} onChange={e => set('soldIndividually', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Limit purchases to 1 item per order</span>
              </label>

              {/* Status & Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Visibility</label>
                  <select value={form.visibility} onChange={e => set('visibility', e.target.value)} className="input">
                    <option value="visible">Public</option>
                    <option value="hidden">Hidden</option>
                    <option value="search-only">Search Only</option>
                    <option value="catalog-only">Catalog Only</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm text-gray-700">Featured Product</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── VARIATIONS ───────────────────────────── */}
          {tab === 'variations' && form.productType === 'variable' && (
            <div className="space-y-4">
              <div className="card p-6 space-y-4">
                <h2 className="font-semibold text-dark">Attributes</h2>
                <p className="text-xs text-gray-500">Add attributes that define this product's variations. Use the global attribute library or type custom values.</p>

                {/* Add from library */}
                <div className="flex gap-2">
                  <select value={newAttrId} onChange={e => setNewAttrId(e.target.value)} className="input flex-1">
                    <option value="">Select from attribute library...</option>
                    {globalAttrs.filter(a => !form.attributes.find(fa => fa.id === a.id)).map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({(a.values || []).join(', ')})</option>
                    ))}
                  </select>
                  <button type="button" onClick={addAttributeFromLibrary} className="btn-outline whitespace-nowrap">
                    <FiPlus size={14} /> Add
                  </button>
                </div>

                {/* Attribute rows */}
                {form.attributes.length > 0 && (
                  <div className="space-y-3">
                    {form.attributes.map(attr => (
                      <div key={attr.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-dark">{attr.name}</span>
                          <button type="button" onClick={() => removeAttribute(attr.id)} className="text-gray-400 hover:text-red-500"><FiX size={16} /></button>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Values (comma-separated)</label>
                          <input
                            type="text"
                            value={attr.values.join(', ')}
                            onChange={e => updateAttrValues(attr.id, e.target.value)}
                            className="input text-sm"
                            placeholder={attr.globalValues?.length > 0 ? attr.globalValues.join(', ') : 'Red, Blue, Green'}
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={attr.useForVariations} onChange={() => toggleAttrVariation(attr.id)} className="w-4 h-4 accent-primary" />
                          <span className="text-xs text-gray-600">Use for variation generation</span>
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {form.attributes.length > 0 && (
                  <button type="button" onClick={generateVariations} className="btn-primary w-full">
                    <FiZap size={14} /> Generate Variations
                  </button>
                )}
              </div>

              {/* Variations table */}
              {form.variations.length > 0 && (
                <div className="card overflow-x-auto">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-dark text-sm">{form.variations.length} Variation(s)</h3>
                    <p className="text-xs text-gray-400">Set price, stock, and SKU for each variation</p>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-gray-500 text-xs">
                        <th className="px-3 py-2 font-medium">Attributes</th>
                        <th className="px-3 py-2 font-medium">Price (₹) *</th>
                        <th className="px-3 py-2 font-medium">Stock *</th>
                        <th className="px-3 py-2 font-medium">SKU</th>
                        <th className="px-3 py-2 font-medium">Image URL</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {form.variations.map(v => (
                        <tr key={v.id}>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(v.attributes).map(([k, val]) => (
                                <span key={k} className="px-1.5 py-0.5 bg-primary/10 text-dark rounded text-[11px] font-medium">{k}: {val}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0" value={v.price} onChange={e => updateVariation(v.id, 'price', e.target.value)} className="input text-xs w-24 py-1" placeholder="0" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min="0" value={v.stock} onChange={e => updateVariation(v.id, 'stock', e.target.value)} className="input text-xs w-20 py-1" placeholder="0" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="text" value={v.sku} onChange={e => updateVariation(v.id, 'sku', e.target.value)} className="input text-xs w-28 py-1 font-mono" placeholder="SKU" />
                          </td>
                          <td className="px-3 py-2">
                            <input type="url" value={v.image} onChange={e => updateVariation(v.id, 'image', e.target.value)} className="input text-xs w-36 py-1" placeholder="https://..." />
                          </td>
                          <td className="px-3 py-2">
                            <select value={v.status || 'active'} onChange={e => updateVariation(v.id, 'status', e.target.value)} className="input text-xs py-1 w-24">
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button type="button" onClick={() => removeVariation(v.id)} className="text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── IMAGES ──────────────────────────────── */}
          {tab === 'images' && (
            <div className="card p-6 space-y-6">
              <h2 className="font-semibold text-dark">Product Images</h2>

              {/* Main Image */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Featured Image (Main)</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center flex-shrink-0 bg-gray-50 overflow-hidden">
                    {form.image
                      ? <img src={form.image} alt="main" className="w-full h-full object-cover" />
                      : <FiImage size={32} className="text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => mainImgRef.current?.click()} className="btn-outline text-sm" disabled={uploadingMain}>
                      <FiUpload size={14} /> {uploadingMain ? 'Uploading...' : form.image ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input ref={mainImgRef} type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
                    <p className="text-xs text-gray-400">PNG, JPG, WebP — max 5 MB</p>
                    <input
                      type="url"
                      placeholder="Or paste image URL..."
                      value={form.image}
                      onChange={e => set('image', e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Gallery Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.images.filter(u => u !== form.image).map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, images: f.images.filter(u2 => u2 !== url) }))}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={18} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => galleryImgRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors" disabled={uploadingGallery}>
                    <FiPlus size={20} />
                    <span className="text-[10px] mt-1">{uploadingGallery ? 'Uploading' : 'Add'}</span>
                  </button>
                  <input ref={galleryImgRef} type="file" accept="image/*" multiple onChange={handleGalleryImages} className="hidden" />
                </div>
                <div>
                  <input type="url" placeholder="Add gallery image URL..." className="input text-sm" onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value) {
                      e.preventDefault();
                      const url = e.target.value.trim();
                      if (url) setForm(f => ({ ...f, images: [...f.images, url] }));
                      e.target.value = '';
                    }
                  }} />
                  <p className="text-xs text-gray-400 mt-1">Press Enter to add a URL to the gallery.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── SHIPPING ─────────────────────────────── */}
          {tab === 'shipping' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">Shipping</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
                  <input type="number" min="0" step="0.01" value={form.weight} onChange={e => set('weight', e.target.value)} className="input" placeholder="0.5" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Class</label>
                  <select value={form.shippingClass} onChange={e => set('shippingClass', e.target.value)} className="input">
                    {SHIPPING_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Dimensions (cm)</label>
                <div className="flex gap-3 items-center">
                  <input type="number" min="0" step="0.1" value={form.dimensionL} onChange={e => set('dimensionL', e.target.value)} className="input" placeholder="L" />
                  <span className="text-gray-400 text-sm">×</span>
                  <input type="number" min="0" step="0.1" value={form.dimensionW} onChange={e => set('dimensionW', e.target.value)} className="input" placeholder="W" />
                  <span className="text-gray-400 text-sm">×</span>
                  <input type="number" min="0" step="0.1" value={form.dimensionH} onChange={e => set('dimensionH', e.target.value)} className="input" placeholder="H" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.freeShipping} onChange={e => set('freeShipping', e.target.checked)} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-gray-700">Offer free shipping for this product</span>
              </label>
            </div>
          )}

          {/* ── SEO ─────────────────────────────────── */}
          {tab === 'seo' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">SEO Settings</h2>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Title</label>
                <input type="text" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} className="input" placeholder={form.name || 'Product title for search engines'} maxLength={60} />
                <p className="text-xs text-gray-400 mt-1">{(form.metaTitle || form.name || '').length}/60 characters</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} className="input resize-none text-sm" rows={3} placeholder="Brief description for search engine result pages..." maxLength={160} />
                <p className="text-xs text-gray-400 mt-1">{form.metaDescription.length}/160 characters</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Focus Keyword</label>
                <input type="text" value={form.focusKeyword} onChange={e => set('focusKeyword', e.target.value)} className="input" placeholder="e.g. baby lotion 200ml" />
              </div>

              {/* Preview */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2">Search Result Preview</p>
                <p className="text-blue-600 text-base font-medium truncate">{form.metaTitle || form.name || 'Product Title'}</p>
                <p className="text-green-700 text-xs">afya.com › products › {form.slug || 'product-url'}</p>
                <p className="text-gray-600 text-xs mt-1 line-clamp-2">{form.metaDescription || form.shortDescription || form.description || 'Product description will appear here...'}</p>
              </div>
            </div>
          )}

          {/* ── ADDITIONAL ───────────────────────────── */}
          {tab === 'additional' && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-dark">Additional Information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                  <select value={form.condition} onChange={e => set('condition', e.target.value)} className="input">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Warranty</label>
                  <input type="text" value={form.warranty} onChange={e => set('warranty', e.target.value)} className="input" placeholder="e.g. 1 Year Manufacturer" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Country of Origin</label>
                  <input type="text" value={form.countryOfOrigin} onChange={e => set('countryOfOrigin', e.target.value)} className="input" placeholder="India" />
                </div>
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">Custom Fields</label>
                  <button type="button" onClick={addCustomField} className="text-xs text-secondary hover:underline flex items-center gap-1">
                    <FiPlus size={12} /> Add Field
                  </button>
                </div>
                {form.customFields.length === 0 && (
                  <p className="text-xs text-gray-400">No custom fields yet. Add key-value pairs for additional product info.</p>
                )}
                <div className="space-y-2">
                  {form.customFields.map((cf, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="text" value={cf.key} onChange={e => updateCF(i, 'key', e.target.value)} className="input text-sm flex-1" placeholder="Field name" />
                      <input type="text" value={cf.value} onChange={e => updateCF(i, 'value', e.target.value)} className="input text-sm flex-1" placeholder="Field value" />
                      <button type="button" onClick={() => removeCF(i)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><FiX size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating & Reviews (manual override) */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Rating (0–5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={form.rating || ''} onChange={e => set('rating', e.target.value)} className="input" placeholder="4.0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Review Count</label>
                  <input type="number" min="0" value={form.reviews || ''} onChange={e => set('reviews', e.target.value)} className="input" placeholder="0" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom save bar */}
      <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
        <button onClick={() => router.push('/products')} className="btn-outline">Cancel</button>
        <button onClick={() => handleSave('draft')} disabled={saving} className="btn-outline">
          <FiSave size={14} /> Save Draft
        </button>
        <button onClick={() => handleSave('active')} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Publish Product'}
        </button>
      </div>
    </div>
  );
}
