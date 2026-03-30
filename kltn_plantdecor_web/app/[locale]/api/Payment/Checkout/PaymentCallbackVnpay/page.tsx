'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'vi'; // Lấy locale hiện tại từ URL

  const [status, setStatus] = useState<{
    loading: boolean;
    success: boolean | null;
    orderId: string | null;
    amount: string | null;
  }>({
    loading: true,
    success: null,
    orderId: null,
    amount: null,
  });

  useEffect(() => {
    // 1. Trích xuất dữ liệu từ VNPay Query Params
    const responseCode = searchParams.get('vnp_ResponseCode');
    const transactionStatus = searchParams.get('vnp_TransactionStatus');
    const orderInfo = searchParams.get('vnp_OrderInfo');
    const amountRaw = searchParams.get('vnp_Amount');

    // Giả sử vnp_OrderInfo có dạng "OrderId: 4" hoặc "Thanh toan don hang 4"
    // Chúng ta dùng Regex để trích xuất số ID đơn hàng cho chắc chắn
    const orderIdMatch = orderInfo?.match(/\d+/);
    const orderId = orderIdMatch ? orderIdMatch[0] : null;
    
    // VNPay gửi amount nhân 100 (ví dụ 1000000 = 10,000 VND)
    const realAmount = amountRaw ? (parseInt(amountRaw) / 100).toLocaleString('vi-VN') : '0';

    // 2. Kiểm tra trạng thái (00 là thành công)
    const isSuccessful = responseCode === '00' && transactionStatus === '00';

    setStatus({
      loading: false,
      success: isSuccessful,
      orderId: orderId,
      amount: realAmount,
    });

    // 3. LÀM SẠCH URL (Quan trọng nhất)
    // Xóa toàn bộ query params để URL trông đẹp và bảo mật hơn
    // Kết quả: https://localhost:3000/vi/api/Payment/Checkout/PaymentCallbackVnpay
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, '', cleanUrl);

  }, [searchParams]);

  const handleRedirect = () => {
    // Điều hướng về trang lịch sử đơn hàng
    // Lưu ý: Bạn cần đảm bảo đã có logic lấy userId ở Client (từ Auth Context hoặc LocalStorage)
    // Ở đây tôi ví dụ dùng một giá trị placeholder hoặc đơn giản là về danh sách orders chung
    router.push(`/${locale}/orders`); 
  };

  if (status.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg font-medium">Đang xác thực giao dịch...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        {status.success ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua sắm tại cửa hàng của chúng tôi.</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-600 mb-6">Đã có lỗi xảy ra hoặc giao dịch đã bị hủy bỏ.</p>
          </>
        )}

        <div className="border-t border-b py-4 mb-6 text-left">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Mã đơn hàng:</span>
            <span className="font-semibold">#{status.orderId || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Số tiền:</span>
            <span className="font-semibold text-blue-600">{status.amount} VND</span>
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