'use client';
import { RETURNS } from '@/lib/mockData';
import { FiCheck, FiX } from 'react-icons/fi';

const STATUS_BADGE = { pending: 'badge-yellow', approved: 'badge-blue', refunded: 'badge-green', rejected: 'badge-red' };

export default function ReturnsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark">Returns & Refunds</h1>
        <p className="text-sm text-gray-500">{RETURNS.length} return requests</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['pending','approved','refunded','rejected'].map(s => {
          const count = RETURNS.filter(r => r.status === s).length;
          return (
            <div key={s} className="card p-4">
              <p className="text-xs text-gray-500 capitalize">{s}</p>
              <p className="text-2xl font-bold text-dark mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {RETURNS.map(r => (
          <div key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start gap-4 justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-dark">{r.id}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-secondary font-medium text-sm">{r.orderId}</span>
                  <span className={STATUS_BADGE[r.status] || 'badge-gray'}>{r.status}</span>
                </div>
                <p className="text-sm font-medium text-dark">{r.product}</p>
                <p className="text-sm text-gray-500">{r.customer}</p>
                <p className="text-xs text-gray-400 mt-1">Reason: {r.reason} · {r.date}</p>
                {r.images > 0 && <p className="text-xs text-blue-500 mt-1">{r.images} image(s) attached</p>}
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-dark">₹{r.amount.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Refund amount</p>
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button className="btn-secondary py-1 px-3 text-xs"><FiCheck size={12} /> Approve</button>
                    <button className="btn-danger py-1 px-3 text-xs"><FiX size={12} /> Reject</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
