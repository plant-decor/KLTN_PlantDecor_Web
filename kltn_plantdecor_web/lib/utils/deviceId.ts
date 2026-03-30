/**
 * Generate hoặc lấy Device ID duy nhất cho mỗi thiết bị/browser
 * Device ID được lưu trong localStorage để nhận diện thiết bị
 */

const DEVICE_ID_KEY = 'device_id';
// export const getOrCreateSessionId = () => {
//   if (typeof window === 'undefined') {
//     // SSR: sessionStorage is not available
//     return null;
//   }
//   let sessionId = sessionStorage.getItem("deviceId");
//   if (!sessionId) {
//     sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     sessionStorage.setItem("deviceId", sessionId);
//   }
//   return sessionId;
// };
const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode, quota exceeded...)
  }
};

export const getDeviceId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  // Kiểm tra xem đã có device ID chưa
  let deviceId = safeLocalStorageGet(DEVICE_ID_KEY);

  if (!deviceId) {
    // Tạo UUID mới cho browser/device này
    deviceId = generateDeviceId();
    safeLocalStorageSet(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
};

const generateDeviceId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback cho môi trường cũ chưa hỗ trợ randomUUID
  const randomPart = Math.random().toString(36).slice(2);
  const timePart = Date.now().toString(36);
  return `${timePart}-${randomPart}`;
};

export const clearDeviceId = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(DEVICE_ID_KEY);
    } catch {
      // Ignore storage delete failures
    }
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
