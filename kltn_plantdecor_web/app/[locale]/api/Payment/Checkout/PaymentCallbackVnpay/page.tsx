'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useAuthStore } from '@/lib/store/authStore';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'vi'; // Lấy locale hiện tại từ URL
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ? String(user.id) : null;

  const responseCode = searchParams.get('vnp_ResponseCode');
  const transactionStatus = searchParams.get('vnp_TransactionStatus');
  const orderInfo = searchParams.get('vnp_OrderInfo');
  const amountRaw = searchParams.get('vnp_Amount');

  const orderIdMatch = orderInfo?.match(/\d+/);
  const orderId = orderIdMatch ? orderIdMatch[0] : null;
  const amount = amountRaw ? (parseInt(amountRaw) / 100).toLocaleString('vi-VN') : '0';
  const isSuccessful = responseCode === '00' && transactionStatus === '00';

  useEffect(() => {
    // LÀM SẠCH URL (Quan trọng nhất)
    // Xóa toàn bộ query params để URL trông đẹp và bảo mật hơn
    // Kết quả: https://localhost:3000/vi/api/Payment/Checkout/PaymentCallbackVnpay
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

  }, []);

  const handleRedirect = () => {
    const resolvedLocale = Array.isArray(locale) ? locale[0] : locale;
    const targetPath = userId ? `/${resolvedLocale}/orders/${userId}` : `/${resolvedLocale}/orders`;
    router.push(targetPath);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {isSuccessful ? (
          <>
            <CheckCircleOutlineIcon sx={{ fontSize: 72, color: '#22c55e', mb: 1 }} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.</p>
          </>
        ) : (
          <>
            <CancelOutlinedIcon sx={{ fontSize: 72, color: '#ef4444', mb: 1 }} />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-6">Đã có lỗi xảy ra hoặc giao dịch đã bị hủy bỏ.</p>
          </>
        )}

        <div className="border-t border-b py-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <span className="font-semibold">#{orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền:</span>
            <span className="font-semibold text-blue-600">{amount} VND</span>
          </div>
        </div>

        <button
          onClick={handleRedirect}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition duration-200"
        >
          Xem lịch sử đơn hàng
        </button>
      </div>
    </div>
  );
}

// Bọc trong Suspense là bắt buộc khi dùng useSearchParams trong Next.js App Router
export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
