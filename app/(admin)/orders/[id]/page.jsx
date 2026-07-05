'use client';
import { use } from 'react';
import { ORDERS } from '@/lib/mockData';
import Link from 'next/link';
import { FiArrowLeft, FiPrinter, FiPackage, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const STATUS_STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];
const STATUS_ICONS = { pending: FiPackage, confirmed: FiPackage, shipped: FiTruck, delivered: FiCheckCircle, cancelled: FiXCircle };

export default function OrderDetailPage({ params }) {
  const { id } = use(params);
  const order = ORDERS.find(o => o.id === id);

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
          <h1 className="text-xl font-bold text-dark">{order.id}</h1>
          <p className="text-sm text-gray-500">{order.date} · {order.city}</p>
        </div>
        <button className="btn-outline ml-auto"><FiPrinter size={15} /> Print Slip</button>
      </div>

      {/* Progress tracker */}
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
        {/* Customer info */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">Customer Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{order.customer}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{order.phone}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">City</span><span className="font-medium">{order.city}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Payment</span>
              <span className={order.payment === 'COD' ? 'badge-gray' : 'badge-green'}>{order.payment}</span>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span className="font-medium">{order.items}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{order.total.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="font-medium text-green-600">Free</span></div>
            <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold"><span>Total</span><span>₹{order.total.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-3">Products</h2>
        <p className="text-sm text-gray-600">{order.products}</p>
      </div>

      {/* Update status */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2">
          {['pending','confirmed','shipped','delivered','cancelled'].map(s => (
            <button
              key={s}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
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
