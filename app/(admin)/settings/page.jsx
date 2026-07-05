'use client';
import { useState, useEffect } from 'react';
import { FiSave, FiStore, FiTruck, FiCreditCard, FiPhone, FiDatabase, FiCheckCircle } from 'react-icons/fi';
import { getSettings, saveSettings } from '@/lib/firestore';
import { seedDatabase } from '@/lib/seed';

export default function SettingsPage() {
  const [form, setForm] = useState({
    storeName: 'ÁFYA Home Needs',
    storeEmail: 'support@afya.in',
    storePhone: '+91 98765 43210',
    minOrder: '199',
    freeDeliveryAbove: '499',
    deliveryFee: '40',
  });
  const [saved, setSaved]       = useState(false);
  const [seeding, setSeeding]   = useState(false);
  const [seedLog, setSeedLog]   = useState([]);
  const [seedDone, setSeedDone] = useState(false);

  useEffect(() => {
    getSettings().then(data => { if (data) setForm(prev => ({ ...prev, ...data })); });
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    await saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedLog([]);
    setSeedDone(false);
    try {
      await seedDatabase((msg) => setSeedLog(prev => [...prev, msg]));
      setSeedDone(true);
    } catch (err) {
      setSeedLog(prev => [...prev, '❌ Error: ' + err.message]);
    }
    setSeeding(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-dark">Settings</h1>
        <p className="text-sm text-gray-500">Store configuration and preferences</p>
      </div>

      {/* Store info */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiStore size={16} className="text-secondary" />
          <h2 className="font-semibold text-dark">Store Information</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input value={form.storeName} onChange={e => set('storeName', e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input value={form.storeEmail} onChange={e => set('storeEmail', e.target.value)} className="input" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
            <input value={form.storePhone} onChange={e => set('storePhone', e.target.value)} className="input" />
          </div>
        </div>
      </div>

      {/* Delivery settings */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiTruck size={16} className="text-secondary" />
          <h2 className="font-semibold text-dark">Delivery Settings</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Value (₹)</label>
            <input value={form.minOrder} onChange={e => set('minOrder', e.target.value)} className="input" type="number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Above (₹)</label>
            <input value={form.freeDeliveryAbove} onChange={e => set('freeDeliveryAbove', e.target.value)} className="input" type="number" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard Delivery Fee (₹)</label>
            <input value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} className="input" type="number" />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiCreditCard size={16} className="text-secondary" />
          <h2 className="font-semibold text-dark">Payment Methods</h2>
        </div>
        <div className="space-y-3">
          {['Razorpay (UPI / Cards)', 'Cash on Delivery (COD)', 'Wallet Balance'].map(method => (
            <label key={method} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-secondary" />
              <span className="text-sm text-gray-700">{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiPhone size={16} className="text-secondary" />
          <h2 className="font-semibold text-dark">WhatsApp Notifications</h2>
        </div>
        <div className="space-y-3">
          {['Order confirmation', 'Shipping update', 'Delivery confirmation', 'Offers & promotions'].map(n => (
            <label key={n} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-secondary" />
              <span className="text-sm text-gray-700">{n}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Seed Database */}
      <div className="card p-5 border-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <FiDatabase size={16} className="text-secondary" />
          <h2 className="font-semibold text-dark">Seed Database</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Populate Firestore with sample products, orders, customers, coupons, banners, and more.
          Also creates the <span className="font-mono font-medium">admin@afya.in</span> account in Firebase Auth.
          Run this once when setting up a new environment.
        </p>

        {seedLog.length > 0 && (
          <div className="bg-gray-900 text-green-400 font-mono text-xs rounded-lg p-3 mb-4 max-h-48 overflow-y-auto space-y-0.5">
            {seedLog.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}

        {seedDone && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium mb-4">
            <FiCheckCircle size={16} /> Database seeded! Refresh the dashboard to see live data.
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={seeding}
          className="btn-secondary"
        >
          <FiDatabase size={15} />
          {seeding ? 'Seeding...' : 'Seed Database'}
        </button>
      </div>

      <button onClick={handleSave} className={`btn-primary ${saved ? '!bg-green-500 !text-white' : ''}`}>
        <FiSave size={15} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}
