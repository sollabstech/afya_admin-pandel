'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      // First-time setup: auto-create admin account
      if (
        (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') &&
        email === 'admin@afya.in'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          router.push('/dashboard');
        } catch (createErr) {
          setError('Could not create admin account: ' + createErr.message);
        }
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.message || 'Sign in failed.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-xl mb-4">
            <span className="text-2xl font-extrabold text-dark tracking-wide">ÁFYA</span>
          </div>
          <h1 className="text-2xl font-bold text-dark">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="admin@afya.in"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 text-base">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          First login auto-creates your account
        </p>
      </div>
    </div>
  );
}
