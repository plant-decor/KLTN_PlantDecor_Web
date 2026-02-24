'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_USERS } from '@/data/sampledata';

/**
 * Test Login Page - Để test phân quyền với các tài khoản sample
 * Chỉ dùng trong development, xóa khi production
 */
export default function TestLoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(SAMPLE_USERS[0].email);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleQuickLogin = async (email: string) => {
    setIsLoading(true);
    setMessage(`Cố gắng đăng nhập với: ${email}`);
    
    try {
      // Simulate login - trong thực tế sẽ gọi API
      const user = SAMPLE_USERS.find(u => u.email === email);
      
      if (user) {
        // Giả lập lưu user info vào store/localStorage
        localStorage.setItem('user_info', JSON.stringify({
          id: user.id,
          email: user.email,
          userName: user.userName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        }));
        
        setMessage(`✓ Đăng nhập thành công với role: ${user.role}`);
        
        // Redirect based on role
        setTimeout(() => {
          navigate(user.role);
        }, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = (role: string) => {
    const routes: Record<string, string> = {
      user: '/plant-store',
      admin: '/admin',
      staff: '/admin',
      shipper: '/admin',
      caretaker: '/admin',
    };
    
    router.push(routes[role] || '/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Test Login - Sample Data
          </h1>
          <p className="text-gray-600 mb-8">
            Chọn một tài khoản để test phân quyền (Development Only)
          </p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('✓') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {SAMPLE_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleQuickLogin(user.email)}
                disabled={isLoading}
                className={`p-6 rounded-lg border-2 transition-all text-left hover:shadow-lg disabled:opacity-50 ${
                  selectedUser === user.email
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {user.userName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Role: {user.role}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Pass:</p>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                      {user.password}
                    </code>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Lưu ý:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Trang này chỉ dùng để test trong development</li>
              <li>• Xóa route này trước khi deploy production</li>
              <li>• Để test thật, hãy dùng form login thường tại /login</li>
              <li>• Sample passwords được lưu ở <code>data/sampledata.ts</code></li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-3">📋 Hướng dẫn test phân quyền:</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Chọn một tài khoản ở trên</li>
              <li>Kiểm tra localStorage để xem thông tin user được lưu</li>
              <li>Test các tính năng dành riêng cho từng role:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• <strong>User</strong>: Cart, Orders, Wishlist, My Plants</li>
                  <li>• <strong>Admin</strong>: Tất cả quản lý (Products, Users, Orders...)</li>
                  <li>• <strong>Staff/Shipper/Caretaker</strong>: Các tính năng tương ứng</li>
                </ul>
              </li>
              <li>Kiểm tra middleware/guards để đảm bảo access control đúng</li>
            </ol>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href="/login"
              className="flex-1 text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Về login thường
            </a>
            <a
              href="/"
              className="flex-1 text-center bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
