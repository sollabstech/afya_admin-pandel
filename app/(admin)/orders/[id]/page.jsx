'use client';
import { use, useEffect, useState } from 'react';
import { getOrderById, updateOrderStatus } from '@/lib/firestore';
import Link from 'next/link';
import { FiArrowLeft, FiPrinter, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS = { pending: FiPackage, confirmed: FiPackage, shipped: FiTruck, delivered: FiCheckCircle, cancelled: FiXCircle };

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    if (order.status === newStatus) return;
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
    setUpdating(false);
  };

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-IN');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-secondary rounded-full animate-spin mr-3" />
      Loading order...
    </div>
  );

  if (!order) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg">Order not found</p>
      <Link href="/orders" className="btn-secondary mt-4 inline-flex">Back to Orders</Link>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const Icon = STATUS_ICONS[order.status] || FiPackage;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/orders" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-dark font-mono">#{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)} · {order.address?.city || '—'}</p>
        </div>
        <button onClick={() => window.print()} className="btn-outline ml-auto"><FiPrinter size={15} /> Print Slip</button>
      </div>

      {order.status !== 'cancelled' && (
        <div className="card p-5">
          <div className="flex items-center gap-2">
            {STATUS_STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i <= currentStep ? 'bg-primary text-dark' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i + 1}
                  </div>
                  <span className={`text-xs text-center capitalize ${i <= currentStep ? 'text-dark font-medium' : 'text-gray-400'}`}>{s}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mb-5 ${i < currentStep ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">Customer Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{order.address?.name || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{order.address?.phone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium">{order.address?.city || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">State</span><span className="font-medium">{order.address?.state || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Pincode</span><span className="font-medium">{order.address?.pincode || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span>
              <span className={order.payment === 'cod' ? 'badge-gray' : 'badge-green'}>{order.payment || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-medium">{order.items?.length ?? '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{(order.total || 0).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-medium">{order.delivery === 0 ? <span className="text-green-600">Free</span> : `₹${order.delivery}`}</span></div>
            {order.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="font-medium">₹{order.tax}</span></div>}
            {order.giftWrap && <div className="flex justify-between"><span className="text-gray-500">Gift Wrap</span><span className="font-medium">₹49</span></div>}
            <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold"><span>Grand Total</span><span>₹{(order.total || 0).toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">Products ({order.items.length})</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium text-dark">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                </div>
                <span className="font-semibold">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.giftWrap && order.giftMessage && (
        <div className="card p-5 border-pink-200 bg-pink-50">
          <h2 className="font-semibold text-dark mb-1">🎁 Gift Message</h2>
          <p className="text-sm text-gray-600">"{order.giftMessage}"</p>
        </div>
      )}

      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-3">Update Status {updating && <FiRefreshCw className="inline animate-spin ml-1" size={14} />}</h2>
        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => handleStatusUpdate(s)}
              disabled={updating}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize disabled:opacity-50 ${
                order.status === s ? 'bg-secondary text-white border-secondary' : 'border-gray-200 text-gray-600 hover:border-secondary hover:text-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
