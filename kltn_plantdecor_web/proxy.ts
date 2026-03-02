import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// ============= ROLE-BASED ACCESS CONTROL =============

// Mapping: Role -> Allowed Routes (dễ dùng cho sidebar/menu)
export const ROLE_TO_ROUTES: Record<string, string[]> = {
  'Admin': [
    'admin', 'manager', 'staff', 'caretaker', 'shipper',
    'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
  'Manager': [
    'manager', 'staff', 'caretaker', 'shipper',
    'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
  'Staff': [
    'staff', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
  'Caretaker': [
    'caretaker', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
  'Shipper': [
    'shipper', 'dashboard', 'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
  'User': [
    'profile', 'orders', 'wishlist', 'cart', 'ai-plant-recommendation'
  ],
};

// Mapping: Route -> Allowed Roles (dùng cho middleware check)
export const ROUTE_TO_ROLES: Record<string, string[]> = {
  'admin': ['Admin'],
  'manager': ['Admin', 'Manager'],
  'staff': ['Admin', 'Manager', 'Staff'],
  'caretaker': ['Admin', 'Manager', 'Caretaker'],
  'shipper': ['Admin', 'Manager', 'Shipper'],
  'dashboard': ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
  'profile': ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper', 'User'],
  'orders': ['Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper', 'User'],
  'wishlist': ['User', 'Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
  'cart': ['User', 'Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
  'ai-plant-recommendation': ['User', 'Admin', 'Manager', 'Staff', 'Caretaker', 'Shipper'],
};

// Danh sách các route cần bảo vệ (authentication)
const PROTECTED_ROUTES = Object.keys(ROUTE_TO_ROLES);

// Helper function: Check if role has access to route
export function hasAccess(userRole: string, route: string): boolean {
  return ROLE_TO_ROUTES[userRole]?.includes(route) ?? false;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token và role từ Cookie
  const authToken = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value; // Role được set khi login

  // 2. Tách locale khỏi pathname để kiểm tra chính xác
  // Ví dụ: /vi/dashboard -> segments = ['', 'vi', 'dashboard']
  const segments = pathname.split('/');
  const protectedRoute = PROTECTED_ROUTES.find((route) => segments.includes(route));

  // 3. Logic Redirect cho Protected Routes - AUTHENTICATION
  if (protectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    // Lưu lại trang định truy cập để sau khi login .NET xong có thể quay lại
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logic Redirect cho Protected Routes - AUTHORIZATION (Role-Based)
  if (protectedRoute && authToken && userRole) {
    const allowedRoles = ROUTE_TO_ROLES[protectedRoute];
    
    if (!allowedRoles.includes(userRole)) {
      // Redirect về trang phù hợp với role
      const potentialLocale = segments[1] ?? '';
      const localeFromPath = routing.locales.includes(potentialLocale as 'vi' | 'en')
        ? potentialLocale
        : routing.defaultLocale;
      
      // Redirect về dashboard hoặc homepage tùy theo role
      const unauthorizedUrl = new URL(
        `/${localeFromPath}/unauthorized`,
        request.nextUrl.origin
      );
      
      return NextResponse.redirect(unauthorizedUrl);
    }
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
  // Match app routes only; exclude API, Next internals, and all static files (e.g. .png, .svg)
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
