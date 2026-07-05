'use client';
import { CUSTOMERS } from '@/lib/mockData';

const topCustomers = [...CUSTOMERS].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 8);

export default function LoyaltyPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-dark">Loyalty Program</h1>
        <p className="text-sm text-gray-500">Manage reward points and tiers</p>
      </div>

      {/* Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Earning Rate</p>
          <p className="text-3xl font-bold text-dark mt-2">₹10</p>
          <p className="text-sm text-gray-500">= 1 loyalty point</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Redemption Rate</p>
          <p className="text-3xl font-bold text-dark mt-2">100 pts</p>
          <p className="text-sm text-gray-500">= ₹10 discount</p>
        </div>
        <div className="card p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Points Issued</p>
          <p className="text-3xl font-bold text-dark mt-2">
            {CUSTOMERS.reduce((s, c) => s + c.loyaltyPoints, 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total outstanding</p>
        </div>
      </div>

      {/* Tiers */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4">Loyalty Tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { name: 'Silver', range: '0–200 pts', color: 'bg-gray-100 text-gray-700', benefit: '5% extra discount' },
            { name: 'Gold',   range: '201–500 pts', color: 'bg-yellow-100 text-yellow-700', benefit: '10% extra + free delivery' },
            { name: 'Platinum', range: '500+ pts', color: 'bg-blue-100 text-blue-700', benefit: '15% extra + priority support' },
          ].map(t => (
            <div key={t.name} className={`rounded-xl p-4 ${t.color}`}>
              <p className="font-bold text-lg">{t.name}</p>
              <p className="text-sm mt-1">{t.range}</p>
              <p className="text-sm mt-2 font-medium">{t.benefit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top loyalty customers */}
      <div className="card p-5">
        <h2 className="font-semibold text-dark mb-4">Top Loyalty Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr className="text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Rank</th>
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium hidden sm:table-cell">Orders</th>
                <th className="pb-2 pr-4 font-medium hidden sm:table-cell">Total Spent</th>
                <th className="pb-2 font-medium">Points</th>
                <th className="pb-2 pl-4 font-medium hidden md:table-cell">Tier</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => {
                const tier = c.loyaltyPoints >= 500 ? 'Platinum' : c.loyaltyPoints >= 201 ? 'Gold' : 'Silver';
                const tierClass = tier === 'Platinum' ? 'badge-blue' : tier === 'Gold' ? 'badge-yellow' : 'badge-gray';
                return (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-bold text-gray-400">#{i + 1}</td>
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-dark">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.city}</p>
                    </td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">{c.orders}</td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">₹{c.totalSpent.toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-secondary">{c.loyaltyPoints}</td>
                    <td className="py-2.5 pl-4 hidden md:table-cell"><span className={tierClass}>{tier}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
