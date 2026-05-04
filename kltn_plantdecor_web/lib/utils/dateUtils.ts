/**
 * Date Utility Functions
 * Các hàm tiện ích xử lý ngày tháng
 */

/**
 * Chuỗi ISO kiểu .NET/JSON thường là UTC nhưng không có hậu tố Z/offset.
 * `new Date("...T14:16:18")` không có Z → ES coi là giờ **local**, nên trùng với +7 khi máy đã ở VN.
 * Nếu khớp dạng thuần này thì gắn Z để parse đúng instant UTC.
 */
function dateFromApiString(s: string): Date {
  const t = s.trim();
  if (!t) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(t)) {
    return new Date(`${t}Z`);
  }
  return new Date(t);
}

function coerceDateInput(date: Date | string): Date {
  return typeof date === 'string' ? dateFromApiString(date) : date;
}

/**
 * Format timestamp thành relative time string
 * VD: "just now", "2m ago", "3h ago", "2d ago"
 */
export function formatDistanceToNow(date: Date | string): string {
  const now = new Date();
  const targetDate = coerceDateInput(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 10) return 'just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  
  return targetDate.toLocaleDateString();
}

/**
 * Format date thành dd/MM/yyyy
 */
export function formatDate(date: Date | string): string {
  const targetDate = coerceDateInput(date);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(targetDate);
}

/**
 * Format date + time thành dd/MM/yyyy HH:mm
 */
export function formatDateTime(date: Date | string): string {
  const targetDate = coerceDateInput(date);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(targetDate);
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const targetDate = coerceDateInput(date);
  const today = new Date();
  
  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const targetDate = coerceDateInput(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return (
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear()
  );
}
