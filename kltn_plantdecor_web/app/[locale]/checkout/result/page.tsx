
"use client";
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function CheckoutResultPage() {
  const t = useTranslations('checkoutResult');
  const searchParams = useSearchParams();
  // Có thể lấy trạng thái từ query nếu cần, nhưng hiện tại không truyền param nữa
  // const status = searchParams.get('status');

  // Đoạn này chỉ là ví dụ, bạn có thể lấy trạng thái từ context hoặc props nếu cần
  // Ở đây chỉ hiển thị thông báo chung, nội dung sẽ được i18n hóa

  // Nếu muốn phân biệt thành công/thất bại, có thể lấy từ URL hoặc context khác
  // Ví dụ: /vi/checkout/result?success=1

  return (
    <div style={{textAlign: 'center', marginTop: 80}}>
      {/* Thông báo sẽ lấy từ i18n */}
      <h1>{t('title')}</h1>
      <p>{t('message')}</p>
    </div>
  );
}
