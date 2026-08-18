import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, where, orderBy, limit, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Products ────────────────────────────────────────────
export const getProducts = async () => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(p => !p.deletedAt); // exclude soft-deleted
};

export const getAllProducts = async () => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getProductBySlug = async (slug) => {
  const snap = await getDocs(query(collection(db, 'products'), where('slug', '==', slug)));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

export const addProduct = async (data) => {
  return await addDoc(collection(db, 'products'), {
    ...data,
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
};

// Soft delete → move to trash
export const trashProduct = async (id) => {
  await updateDoc(doc(db, 'products', id), { deletedAt: serverTimestamp(), status: 'archived', updatedAt: serverTimestamp() });
};

// Restore from trash
export const restoreProduct = async (id) => {
  await updateDoc(doc(db, 'products', id), { deletedAt: null, status: 'draft', updatedAt: serverTimestamp() });
};

// Permanent delete
export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};

// Duplicate a product
export const duplicateProduct = async (id) => {
  const snap = await getDoc(doc(db, 'products', id));
  if (!snap.exists()) throw new Error('Product not found');
  const data = snap.data();
  const slug = (data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || 'product') + '-copy-' + Date.now();
  const newRef = await addDoc(collection(db, 'products'), {
    ...data,
    name: (data.name || 'Product') + ' (Copy)',
    slug,
    sku: (data.sku || '') + '-COPY',
    status: 'draft',
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newRef.id;
};

export const getTrashedProducts = async () => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(p => !!p.deletedAt); // only soft-deleted
};

export const updateStock = async (id, stock) => {
  await updateDoc(doc(db, 'products', id), {
    stock,
    stockStatus: stock === 0 ? 'outofstock' : 'instock',
    status: stock === 0 ? 'out_of_stock' : 'active',
    updatedAt: serverTimestamp(),
  });
};

// Generate URL-safe slug from a string
export const generateSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Check slug uniqueness (excludes current product when editing)
export const isSlugUnique = async (slug, excludeId = null) => {
  const snap = await getDocs(query(collection(db, 'products'), where('slug', '==', slug)));
  if (snap.empty) return true;
  if (excludeId && snap.docs.length === 1 && snap.docs[0].id === excludeId) return true;
  return false;
};

// ─── Product Audit Log ──────────────────────────────────
export const addProductAuditLog = async (productId, action, changes, user = 'Admin') => {
  await addDoc(collection(db, 'productAuditLogs'), {
    productId, action, changes, user,
    timestamp: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const getProductAuditLogs = async (productId) => {
  const snap = await getDocs(
    query(collection(db, 'productAuditLogs'), where('productId', '==', productId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── Attributes ──────────────────────────────────────────
export const getAttributes = async () => {
  const snap = await getDocs(collection(db, 'attributes'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.ordering || 0) - (b.ordering || 0));
};

export const addAttribute = async (data) => {
  return await addDoc(collection(db, 'attributes'), { ...data, createdAt: serverTimestamp() });
};

export const updateAttribute = async (id, data) => {
  await updateDoc(doc(db, 'attributes', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteAttribute = async (id) => {
  await deleteDoc(doc(db, 'attributes', id));
};

// ─── Orders ──────────────────────────────────────────────
export const getOrders = async () => {
  const snap = await getDocs(collection(db, 'orders'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getOrderById = async (id) => {
  const snap = await getDoc(doc(db, 'orders', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateOrderStatus = async (id, status) => {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
};

// ─── Customers / Users ───────────────────────────────────
export const getCustomers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCustomer = async (id) => {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// ─── Categories ──────────────────────────────────────────
export const getCategories = async () => {
  const snap = await getDocs(collection(db, 'categories'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addCategory = async (data) => {
  return await addDoc(collection(db, 'categories'), { ...data, createdAt: serverTimestamp() });
};

export const updateCategory = async (id, data) => {
  await updateDoc(doc(db, 'categories', id), data);
};

export const deleteCategory = async (id) => {
  await deleteDoc(doc(db, 'categories', id));
};

// ─── Brands ──────────────────────────────────────────────
export const getBrands = async () => {
  const snap = await getDocs(collection(db, 'brands'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addBrand = async (data) => {
  return await addDoc(collection(db, 'brands'), { ...data, createdAt: serverTimestamp() });
};

export const updateBrand = async (id, data) => {
  await updateDoc(doc(db, 'brands', id), data);
};

export const deleteBrand = async (id) => {
  await deleteDoc(doc(db, 'brands', id));
};

// ─── Coupons ─────────────────────────────────────────────
export const getCoupons = async () => {
  const snap = await getDocs(collection(db, 'coupons'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addCoupon = async (data) => {
  return await addDoc(collection(db, 'coupons'), { ...data, createdAt: serverTimestamp() });
};

export const updateCoupon = async (id, data) => {
  await updateDoc(doc(db, 'coupons', id), data);
};

export const deleteCoupon = async (id) => {
  await deleteDoc(doc(db, 'coupons', id));
};

// ─── Banners ─────────────────────────────────────────────
export const getBanners = async () => {
  const snap = await getDocs(collection(db, 'banners'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addBanner = async (data) => {
  return await addDoc(collection(db, 'banners'), { ...data, createdAt: serverTimestamp() });
};

export const updateBanner = async (id, data) => {
  await updateDoc(doc(db, 'banners', id), data);
};

export const deleteBanner = async (id) => {
  await deleteDoc(doc(db, 'banners', id));
};

// ─── Returns ─────────────────────────────────────────────
export const getReturns = async () => {
  const snap = await getDocs(collection(db, 'returns'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const updateReturn = async (id, status) => {
  await updateDoc(doc(db, 'returns', id), { status, updatedAt: serverTimestamp() });
};

// ─── Staff ───────────────────────────────────────────────
export const getStaff = async () => {
  const snap = await getDocs(collection(db, 'staff'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addStaff = async (data) => {
  return await addDoc(collection(db, 'staff'), { ...data, createdAt: serverTimestamp() });
};

export const updateStaff = async (id, data) => {
  await updateDoc(doc(db, 'staff', String(id)), data);
};

// ─── Campaigns ───────────────────────────────────────────
export const getCampaigns = async () => {
  const snap = await getDocs(collection(db, 'campaigns'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addCampaign = async (data) => {
  return await addDoc(collection(db, 'campaigns'), { ...data, createdAt: serverTimestamp() });
};

// ─── Audit Logs ──────────────────────────────────────────
export const getAuditLogs = async () => {
  const snap = await getDocs(collection(db, 'auditLogs'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const addAuditLog = async (user, action, module, details) => {
  await addDoc(collection(db, 'auditLogs'), {
    user, action, module, details,
    timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
    ip: '—',
    createdAt: serverTimestamp(),
  });
};

// ─── Settings ────────────────────────────────────────────
export const getSettings = async () => {
  const snap = await getDoc(doc(db, 'settings', 'store'));
  return snap.exists() ? snap.data() : null;
};

export const saveSettings = async (data) => {
  await setDoc(doc(db, 'settings', 'store'), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// ─── Dashboard Stats ─────────────────────────────────────
export const getDashboardStats = async () => {
  const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'users')),
  ]);

  const orders = ordersSnap.docs.map(d => d.data());
  const products = productsSnap.docs.map(d => d.data());
  const today = new Date().toISOString().slice(0, 10);

  const totalRevenue = orders
    .filter(o => ['delivered', 'shipped'].includes(o.status))
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const ordersToday = orders.filter(o => o.date === today).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockItems = products.filter(p => p.stock <= 5).length;

  return {
    totalRevenue,
    ordersToday,
    totalOrders: orders.length,
    totalCustomers: customersSnap.size,
    newCustomersToday: 0,
    lowStockItems,
    pendingOrders,
    revenueGrowth: 12.5,
  };
};
