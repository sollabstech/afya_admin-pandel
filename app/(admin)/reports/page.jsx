'use client';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { REVENUE_DATA, MONTHLY_REVENUE, CATEGORY_SALES } from '@/lib/mockData';
import { FiDownload } from 'react-icons/fi';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Sales performance overview</p>
        </div>
        <button className="btn-outline"><FiDownload size={15} /> Export PDF</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹2,84,750', sub: 'All time' },
          { label: 'Avg Order Value', value: '₹1,542', sub: 'This month' },
          { label: 'Conversion Rate', value: '4.2%', sub: 'Visitors to orders' },
          { label: 'Repeat Customers', value: '68%', sub: 'Placed 2+ orders' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-dark mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly revenue */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4">Monthly Revenue (2026)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={MONTHLY_REVENUE} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v/1000}K`} />
            <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#1976D2" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Daily orders */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-4">Daily Orders (Last 8 Days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#F7D000" strokeWidth={2.5} dot={{ fill: '#F7D000', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category revenue */}
        <div className="card p-5">
          <h2 className="font-semibold text-dark mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CATEGORY_SALES} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v/1000}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="sales" fill="#F7D000" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
