'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Sidebar from '@/components/Sidebar';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
      } else {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          uid: firebaseUser.uid,
        });
      }
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const pageTitle = pathname.split('/').filter(Boolean).pop()
    ?.replace(/-/g, ' ')
    .replace(/^\w/, c => c.toUpperCase()) || 'Dashboard';

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu size={20} />
          </button>
          <h1 className="text-base font-semibold text-dark capitalize flex-1">{pageTitle}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <FiUser size={14} className="text-dark" />
              </div>
              <span className="text-sm font-medium text-dark hidden sm:block capitalize">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
