import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Danh sách các route cần bảo vệ (không bao gồm locale)
const PROTECTED_ROUTES = [
  'dashboard', 'admin', 'manager', 'staff',
  'caretaker', 'shipper', 'profile', 'orders',
  'wishlist', 'cart', 'ai-plant-recommendation',
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token từ Cookie (giả sử .NET API của bạn trả về cookie này khi login)
  const authToken = request.cookies.get('authToken')?.value;

  // 2. Tách locale khỏi pathname để kiểm tra chính xác
  // Ví dụ: /vi/dashboard -> segments = ['', 'vi', 'dashboard']
  const segments = pathname.split('/');
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => 
    segments.includes(route)
  );

  // 3. Logic Redirect cho Protected Routes
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    // Lưu lại trang định truy cập để sau khi login .NET xong có thể quay lại
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logic Redirect cho Auth Routes (Login/Register)
  const isAuthPage = segments.includes('login') || segments.includes('register');
  if (isAuthPage && authToken) {
    const potentialLocale = segments[1] ?? '';
    const localeFromPath = routing.locales.includes(potentialLocale as 'vi' | 'en')
      ? potentialLocale
      : routing.defaultLocale;
    const dashboardPath = `/${localeFromPath}/dashboard`;
    return NextResponse.redirect(new URL(dashboardPath, request.nextUrl.origin));
  }

  // 5. Chuyển tiếp cho next-intl xử lý ngôn ngữ
  return intlMiddleware(request);
}

export const config = {
  // Match all routes except Next.js internals and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img|logo).*)'],
};
