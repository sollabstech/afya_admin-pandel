'use client';
import { COUPONS } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';

export default function OffersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Offers & Coupons</h1>
          <p className="text-sm text-gray-500">{COUPONS.length} coupons</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> New Coupon</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {COUPONS.map(c => (
          <div key={c.code} className={`card p-5 ${c.status === 'inactive' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-dark bg-yellow-100 px-2 py-1 rounded text-sm">{c.code}</span>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FiCopy size={13} />
                </button>
              </div>
              <span className={c.status === 'active' ? 'badge-green' : 'badge-gray'}>{c.status}</span>
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="font-semibold text-secondary">
                  {c.type === 'percent' ? `${c.discount}% off` : `₹${c.discount} off`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Min Order</span>
                <span className="font-medium">₹{c.minOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Usage</span>
                <span className="font-medium">{c.used} / {c.maxUses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires</span>
                <span className="font-medium">{c.expiry}</span>
              </div>
            </div>

            {/* Usage bar */}
            <div className="mt-3">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary rounded-full"
                  style={{ width: `${Math.min((c.used / c.maxUses) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round((c.used / c.maxUses) * 100)}% used</p>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-outline flex-1 justify-center py-1.5"><FiEdit2 size={13} /> Edit</button>
              <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 transition-colors"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
