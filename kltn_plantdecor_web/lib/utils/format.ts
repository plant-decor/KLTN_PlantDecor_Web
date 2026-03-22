/**
 * Hàm định dạng số cố định theo chuẩn en-US (Dấu phẩy ngăn cách hàng nghìn)
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};