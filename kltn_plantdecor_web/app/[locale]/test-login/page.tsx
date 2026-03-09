'use client';

import { useState } from 'react';
import { getTestAccounts, setMockAuthState, clearMockAuthState } from '@/lib/utils/mockAuthHelper';
import type { User } from '@/types/auth.types';

/**
 * Test Login Page - Để test các routes với các tài khoản sample
 * Sử dụng Mock API route /api/mock-login
 * Chỉ dùng trong development, xóa khi production
 */
export default function TestLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const testAccounts = getTestAccounts();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      // Gọi mock API
      const response = await fetch('/api/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setMessage(`❌ Login failed: ${error.error}`);
        return;
      }

      const data = await response.json();
      const user: User = data.user;
      const account = testAccounts.find((a) => a.email === email);

      // Set auth state
      setMockAuthState(user, data.token, data.refreshToken);

      setMessage(`✅ Logged in as ${account?.userName} (${account?.role.toUpperCase()})`);
      console.log('Mock login successful:', data);

      // Redirect sau 1 giây
      setTimeout(() => {
        const roleRoutes: Record<string, string> = {
          admin: '/admin',
          manager: '/manager',
          staff: '/staff',
          consultant: '/consultant',
          caretaker: '/caretaker',
          shipper: '/shipper',
          user: '/dashboard',
        };
        const route = roleRoutes[account?.role || 'user'] || '/dashboard';
        window.location.href = route;
      }, 1000);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearMockAuthState();
    setMessage('✅ Logged out');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">🧪 Test Login</h1>
        <p className="text-center text-gray-600 mb-6">
          Development Mode - Mock Authentication để test các routes
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : message.includes('failed') || message.includes('❌')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-3 mb-8">
          {testAccounts.map((account) => (
            <button
              key={account.id}
              onClick={() => handleLogin(account.email, account.password)}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{account.userName}</p>
                  <p className="text-sm text-gray-600">{account.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-medium">
                      {account.role.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Password:</p>
                  <code className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                    {account.password}
                  </code>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="w-full px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          Logout
        </button>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Development Mode Only</p>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Mock API: <code className="bg-yellow-100 px-2 py-1 rounded">/api/mock-login</code></li>
            <li>• Tokens: Saved in cookies & localStorage</li>
            <li>• Delete <code className="bg-yellow-100 px-2 py-1 rounded">api/mock-login/route.ts</code> before production</li>
            <li>• Only use when backend is incomplete</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">📋 How to Test Routes:</p>
          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click an account to mock-login</li>
            <li>Will redirect to role-specific dashboard</li>
            <li>Test navigation and permissions</li>
            <li>Logout to clear auth state</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
