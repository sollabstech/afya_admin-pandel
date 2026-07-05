'use client';
import { CAMPAIGNS } from '@/lib/mockData';
import { FiPlus, FiBell, FiMessageCircle, FiMail } from 'react-icons/fi';

const TYPE_ICONS = { push: FiBell, whatsapp: FiMessageCircle, email: FiMail };
const TYPE_COLORS = { push: 'badge-blue', whatsapp: 'badge-green', email: 'badge-yellow' };
const STATUS_BADGE = { sent: 'badge-green', draft: 'badge-gray', scheduled: 'badge-blue' };

export default function MarketingPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Campaigns</h1>
          <p className="text-sm text-gray-500">Push, WhatsApp & email campaigns</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> New Campaign</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: '665', sub: 'This month' },
          { label: 'Avg Open Rate', value: '47%', sub: 'Across campaigns' },
          { label: 'Campaigns', value: CAMPAIGNS.length, sub: 'Total created' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-dark mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">Audience</th>
              <th className="px-4 py-3 font-medium">Sent</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Opened</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CAMPAIGNS.map(c => {
              const Icon = TYPE_ICONS[c.type] || FiBell;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-dark">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`${TYPE_COLORS[c.type]} flex items-center gap-1 w-fit`}>
                      <Icon size={11} />{c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.audience}</td>
                  <td className="px-4 py-3 font-medium">{c.sent}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {c.sent > 0 ? <span>{c.opened} ({Math.round((c.opened/c.sent)*100)}%)</span> : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{c.date}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_BADGE[c.status] || 'badge-gray'}>{c.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
