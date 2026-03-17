'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { logoutAllAction } from '@/app/actions/authenticationActions';
import { authService } from '@/lib/api/authService';
import { useRouter } from 'next/navigation';
import { getDeviceId } from '@/lib/utils/deviceId';

interface Session {
  id: number;
  deviceName: string;
  createDate: string;
  expiryDate: string;
  isCurrentDevice: boolean;
}

/**
 * Example component để quản lý sessions
 * Hiển thị các thiết bị đang đăng nhập và cho phép revoke
 */
export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { clearUser } = useAuthStore();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await authService.getActiveSessions();
      const currentDeviceId = getDeviceId();
      
      // Map data và đánh dấu device hiện tại
      const mappedSessions = data.map((session: any) => ({
        ...session,
        isCurrentDevice: session.deviceId === currentDeviceId,
      }));
      
      setSessions(mappedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: number) => {
    if (!confirm('Bạn có chắc muốn đăng xuất thiết bị này?')) return;

    try {
      await authService.revokeSession(sessionId);
      await loadSessions(); // Reload danh sách
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất tất cả thiết bị?')) return;

    try {
      const result = await logoutAllAction();

      if (!result.success) {
        throw new Error(result.message);
      }

      clearUser();

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth:logout-all', Date.now().toString());
      }

      // Redirect về login vì tất cả sessions đã bị revoke
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout all devices:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý thiết bị</h1>
        <button
          onClick={handleLogoutAllDevices}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Đăng xuất tất cả thiết bị
        </button>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">
                {session.deviceName}
                {session.isCurrentDevice && (
                  <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    Thiết bị hiện tại
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Đăng nhập: {new Date(session.createDate).toLocaleString('vi-VN')}
              </div>
              <div className="text-sm text-gray-600">
                Hết hạn: {new Date(session.expiryDate).toLocaleString('vi-VN')}
              </div>
            </div>

            {!session.isCurrentDevice && (
              <button
                onClick={() => handleRevokeSession(session.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Đăng xuất
              </button>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Không có thiết bị nào đang đăng nhập
          </div>
        )}
      </div>
    </div>
  );
}
