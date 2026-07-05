import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, where, orderBy, limit, writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Products ────────────────────────────────────────────
export const getProducts = async () => {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data) => {
  return await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, 'products', id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};

export const updateStock = async (id, stock) => {
  await updateDoc(doc(db, 'products', id), {
    stock,
    status: stock === 0 ? 'out_of_stock' : 'active',
    updatedAt: serverTimestamp(),
  });
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
