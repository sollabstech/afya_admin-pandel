'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiPackage, FiTag, FiAward, FiAlertCircle,
  FiShoppingBag, FiUsers, FiPercent, FiImage,
  FiBarChart2, FiBell, FiGift, FiRepeat,
  FiUserCheck, FiSettings, FiFileText, FiLogOut,
} from 'react-icons/fi';

const NAV = [
  {
    group: 'Main',
    items: [{ href: '/dashboard', icon: FiGrid, label: 'Dashboard' }],
  },
  {
    group: 'Catalog',
    items: [
      { href: '/products',   icon: FiPackage,    label: 'Products' },
      { href: '/categories', icon: FiTag,         label: 'Categories' },
      { href: '/brands',     icon: FiAward,       label: 'Brands' },
      { href: '/inventory',  icon: FiAlertCircle, label: 'Inventory' },
    ],
  },
  {
    group: 'Sales',
    items: [
      { href: '/orders',    icon: FiShoppingBag, label: 'Orders' },
      { href: '/customers', icon: FiUsers,        label: 'Customers' },
      { href: '/returns',   icon: FiRepeat,       label: 'Returns' },
    ],
  },
  {
    group: 'Marketing',
    items: [
      { href: '/offers',    icon: FiPercent, label: 'Offers & Coupons' },
      { href: '/banners',   icon: FiImage,   label: 'Banners' },
      { href: '/marketing', icon: FiBell,    label: 'Campaigns' },
      { href: '/loyalty',   icon: FiGift,    label: 'Loyalty' },
    ],
  },
  {
    group: 'Reports',
    items: [{ href: '/reports', icon: FiBarChart2, label: 'Reports & Analytics' }],
  },
  {
    group: 'Admin',
    items: [
      { href: '/staff',    icon: FiUserCheck, label: 'Staff Management' },
      { href: '/settings', icon: FiSettings,  label: 'Settings' },
      { href: '/audit',    icon: FiFileText,  label: 'Audit Logs' },
    ],
  },
];

export default function Sidebar({ onClose, onLogout }) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-sidebar text-white w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-sidebar-hover flex-shrink-0">
        <div className="bg-primary text-dark font-extrabold text-lg px-2 py-1 rounded-lg tracking-wide">ÁFYA</div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">Admin Panel</p>
          <p className="text-gray-400 text-xs">Home Needs</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-2 mb-1">{group}</p>
            {items.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                    active
                      ? 'bg-primary text-dark'
                      : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-sidebar-hover flex-shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-sidebar-hover hover:text-white w-full transition-colors"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
