'use client';
import { BANNERS } from '@/lib/mockData';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function BannersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Banners</h1>
          <p className="text-sm text-gray-500">Manage homepage and promo banners</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> Add Banner</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BANNERS.map(b => (
          <div key={b.id} className="card overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 text-white">
                <p className="font-bold text-base">{b.title}</p>
                <p className="text-xs opacity-90">{b.subtitle}</p>
              </div>
              <span className={`absolute top-3 right-3 ${b.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{b.status}</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex gap-4 text-sm">
                <div><span className="text-gray-500">Position: </span><span className="font-medium capitalize">{b.position}</span></div>
                <div><span className="text-gray-500">From: </span><span className="font-medium">{b.startDate}</span></div>
                <div><span className="text-gray-500">To: </span><span className="font-medium">{b.endDate}</span></div>
              </div>
              <p className="text-xs text-gray-400 truncate">Link: {b.link}</p>
              <div className="flex gap-2 pt-1">
                <button className="btn-outline flex-1 justify-center py-1.5 text-xs"><FiEdit2 size={12} /> Edit</button>
                <button className="btn-danger flex-1 justify-center py-1.5 text-xs"><FiTrash2 size={12} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
