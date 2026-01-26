/**
 * Generate hoặc lấy Device ID duy nhất cho mỗi thiết bị/browser
 * Device ID được lưu trong localStorage để nhận diện thiết bị
 */

const DEVICE_ID_KEY = 'device_id';

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  // Kiểm tra xem đã có device ID chưa
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // Tạo device ID mới
    deviceId = generateDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

const generateDeviceId = (): string => {
  // Tạo ID dựa trên timestamp, random number và user agent
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const navigatorInfo = typeof navigator !== 'undefined' 
    ? `${navigator.userAgent}-${navigator.language}` 
    : '';
  
  const base = `${timestamp}-${random}-${navigatorInfo}`;
  
  // Hash đơn giản để tạo ID ngắn gọn hơn
  return btoa(base).substring(0, 32);
};

export const clearDeviceId = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEVICE_ID_KEY);
  }
};

export const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      deviceId: '',
      deviceName: 'Server',
      platform: 'server',
    };
  }

  return {
    deviceId: getDeviceId(),
    deviceName: navigator.userAgent,
    platform: navigator.platform,
  };
};
