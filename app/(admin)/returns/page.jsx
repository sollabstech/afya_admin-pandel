'use client';
import { useState, useEffect } from 'react';
import { getReturns, updateReturn } from '@/lib/firestore';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const STATUS_BADGE = { pending: 'badge-yellow', approved: 'badge-blue', refunded: 'badge-green', rejected: 'badge-red' };

export default function ReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getReturns();
      setReturns(data);
    } catch (err) {
      console.error('Failed to load returns:', err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    setUpdating(id);
    try {
      await updateReturn(id, status);
      setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      alert('Failed: ' + err.message);
    }
    setUpdating(null);
  };

  const statusCounts = ['pending', 'approved', 'refunded', 'rejected'].reduce((acc, s) => {
    acc[s] = returns.filter(r => r.status === s).length;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Returns & Refunds</h1>
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : `${returns.length} return requests`}</p>
        </div>
        <button onClick={load} className="btn-outline"><FiRefreshCw size={14} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {['pending', 'approved', 'refunded', 'rejected'].map(s => (
          <div key={s} className="card p-4">
            <p className="text-xs text-gray-500 capitalize">{s}</p>
            <p className="text-2xl font-bold text-dark mt-1">{statusCounts[s]}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mx-auto mb-3" />
          Loading returns...
        </div>
      ) : returns.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No return requests yet.</div>
      ) : (
        <div className="space-y-4">
          {returns.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-dark font-mono text-xs">{r.id.slice(0, 8).toUpperCase()}</span>
                    {r.orderId && <><span className="text-gray-400">·</span><span className="text-secondary font-medium text-sm">{r.orderId}</span></>}
                    <span className={STATUS_BADGE[r.status] || 'badge-gray'}>{r.status}</span>
                  </div>
                  <p className="text-sm font-medium text-dark">{r.product || r.productName || '—'}</p>
                  <p className="text-sm text-gray-500">{r.customer || r.customerName || '—'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Reason: {r.reason || '—'} · {r.date || ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-dark">₹{(r.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Refund amount</p>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAction(r.id, 'approved')}
                        disabled={updating === r.id}
                        className="btn-secondary py-1 px-3 text-xs"
                      >
                        <FiCheck size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'rejected')}
                        disabled={updating === r.id}
                        className="btn-danger py-1 px-3 text-xs"
                      >
                        <FiX size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
