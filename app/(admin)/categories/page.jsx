'use client';
import { CATEGORIES } from '@/lib/mockData';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function CategoriesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-dark">Categories</h1>
          <p className="text-sm text-gray-500">{CATEGORIES.length} categories</p>
        </div>
        <button className="btn-primary"><FiPlus size={16} /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <div key={cat.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-dark">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">/{cat.slug}</p>
                {cat.parent && <p className="text-xs text-gray-400 mt-0.5">Parent: {cat.parent}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-secondary transition-colors"><FiEdit2 size={14} /></button>
                <button className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"><FiTrash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="badge-blue">{cat.products} products</span>
              <span className={cat.status === 'active' ? 'badge-green' : 'badge-gray'}>{cat.status}</span>
            </div>
            {cat.subcategories.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Subcategories:</p>
                <div className="flex flex-wrap gap-1">
                  {cat.subcategories.map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
