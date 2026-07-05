import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import {
  PRODUCTS, ORDERS, CUSTOMERS, CATEGORIES, BRANDS,
  COUPONS, BANNERS, RETURNS, STAFF, CAMPAIGNS, AUDIT_LOGS,
} from './mockData';

export const seedDatabase = async (onProgress) => {
  const log = (msg) => { console.log(msg); onProgress?.(msg); };

  // ── Create admin user in Firebase Auth ──────────────────
  log('Creating admin user...');
  try {
    await createUserWithEmailAndPassword(auth, 'admin@afya.in', 'admin123');
    log('Admin user created.');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      log('Admin user already exists — skipping.');
    } else {
      log(`Auth error: ${err.message}`);
    }
  }

  // ── Helper: batch-write an array to a collection ────────
  const batchWrite = async (collectionName, items, idField = null) => {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const ref = idField && item[idField]
        ? doc(db, collectionName, String(item[idField]))
        : doc(collection(db, collectionName));
      const { id, ...data } = item;
      batch.set(ref, data);
    });
    await batch.commit();
    log(`Seeded ${items.length} ${collectionName}.`);
  };

  await batchWrite('products',   PRODUCTS,   'id');
  await batchWrite('orders',     ORDERS,     'id');
  await batchWrite('users',      CUSTOMERS,  'id');
  await batchWrite('categories', CATEGORIES, 'id');
  await batchWrite('brands',     BRANDS,     'id');
  await batchWrite('coupons',    COUPONS,    'code');
  await batchWrite('banners',    BANNERS,    'id');
  await batchWrite('returns',    RETURNS,    'id');
  await batchWrite('staff',      STAFF,      'id');
  await batchWrite('campaigns',  CAMPAIGNS,  'id');
  await batchWrite('auditLogs',  AUDIT_LOGS, 'id');

  // ── Default store settings ───────────────────────────────
  await setDoc(doc(db, 'settings', 'store'), {
    storeName: 'ÁFYA Home Needs',
    storeEmail: 'support@afya.in',
    storePhone: '+91 98765 43210',
    minOrder: '199',
    freeDeliveryAbove: '499',
    deliveryFee: '40',
  });
  log('Seeded settings.');

  log('✅ Database seeded successfully!');
};
