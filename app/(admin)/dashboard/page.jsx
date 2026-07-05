'use client';
import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStats, getOrders, getProducts } from '@/lib/firestore';
import { REVENUE_DATA, CATEGORY_SALES, ORDER_STATUS_DIST, STATS } from '@/lib/mockData';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiAlertCircle, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Link from 'next/link';

const STATUS_COLORS = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-blue',
  delivered: 'badge-green',
  cancelled: 'badge-red',
};

export default function DashboardPage() {
  const [stats, setStats]           = useState(STATS);
  const [orders, setOrders]         = useState([]);
  const [lowStock, setLowStock]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [liveStats, liveOrders, liveProducts] = await Promise.all([
          getDashboardStats(),
          getOrders(),
          getProducts(),
        ]);
        setStats(liveStats);
        setOrders(liveOrders.slice(0, 5));
        setLowStock(liveProducts.filter(p => p.stock <= 5));
      } catch (err) {
        console.warn('Firestore not seeded yet — showing mock data:', err.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const KPI = [
    { label: 'Total Revenue',   value: `₹${(stats.totalRevenue / 1000).toFixed(0)}K`, sub: `+${stats.revenueGrowth}% this month`, icon: FiTrendingUp,  color: 'bg-yellow-100 text-yellow-700', up: true  },
    { label: 'Orders Today',    value: stats.ordersToday,                              sub: `${stats.totalOrders} total orders`,   icon: FiShoppingBag, color: 'bg-blue-100 text-blue-700',    up: true  },
    { label: 'Total Customers', value: stats.totalCustomers,                           sub: `+${stats.newCustomersToday} today`,   icon: FiUsers,       color: 'bg-green-100 text-green-700',  up: true  },
    { label: 'Low Stock Items', value: stats.lowStockItems,                            sub: 'Needs attention',                     icon: FiAlertCircle, color: 'bg-red-100 text-red-700',      up: false },
  ];

  const displayOrders = orders.length > 0 ? orders : [];
  const displayLowStock = lowStock.length > 0 ? lowStock : [];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-xs text-gray-400 bg-yellow-50 border border-yellow-100 px-3 py-2 rounded-lg">
          Loading live data from Firebase...
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI.map(({ label, value, sub, icon: Icon, color, up }) => (
          <div key={label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-dark mt-1">{value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {up ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />} {sub}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${color}`}><Icon size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="card p-5 xl:col-span-2">
          <h2 className="font-semibold text-dark mb-4">Revenue (Last 8 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F7D000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F7D000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#F7D000" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ORDER_STATUS_DIST} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {ORDER_STATUS_DIST.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category sales */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-4">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={CATEGORY_SALES} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}K`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="sales" fill="#1976D2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alert */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-dark">Low Stock Alert</h2>
            <Link href="/inventory" className="text-secondary text-xs font-medium hover:underline">View all</Link>
          </div>
          {displayLowStock.length === 0 ? (
            <p className="text-gray-400 text-sm">No low stock items. Seed the database first.</p>
          ) : (
            <div className="space-y-3">
              {displayLowStock.slice(0, 5).map((p, i) => (
                <div key={p.id || i} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dark truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <span className={p.stock === 0 ? 'badge-red' : 'badge-yellow'}>
                    {p.stock === 0 ? 'Out' : `${p.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-dark">Recent Orders</h2>
          <Link href="/orders" className="text-secondary text-xs font-medium hover:underline">View all</Link>
        </div>
        {displayOrders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet. Go to Settings → Seed Database to load sample data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium">Order</th>
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium hidden sm:table-cell">Items</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayOrders.map((order, i) => (
                  <tr key={order.id || i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4">
                      <Link href={`/orders/${order.id}`} className="font-medium text-secondary hover:underline">{order.id}</Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">{order.customer}</td>
                    <td className="py-2.5 pr-4 text-gray-500 hidden sm:table-cell">{order.items}</td>
                    <td className="py-2.5 pr-4 font-medium">₹{(order.total || 0).toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={STATUS_COLORS[order.status] || 'badge-gray'}>{order.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
