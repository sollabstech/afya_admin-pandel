'use client';
import { BRANDS } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiExternalLink } from 'react-icons/fi';

export default function BrandsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Brands</h1>
          <p className="text-sm text-gray-500">{BRANDS.length} brands</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> Add Brand</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Brand Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Products</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {BRANDS.map(b => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-600 text-sm flex-shrink-0">
                      {b.name[0]}
                    </div>
                    <span className="font-medium text-dark">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.category}</td>
                <td className="px-4 py-3"><span className="badge-blue">{b.products}</span></td>
                <td className="px-4 py-3"><span className={b.status === 'active' ? 'badge-green' : 'badge-gray'}>{b.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <a href={b.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"><FiExternalLink size={14} /></a>
                    <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"><FiEdit2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
