import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware
 * 
 * Chức năng:
 * 1. Check xem user có token trong cookie không
 * 2. Nếu không có token nhưng cố truy cập trang protected -> redirect tới login
 * 3. Attach token vào request headers nếu cần
 */

// Routes không cần authentication
const PUBLIC_ROUTES = ['/login', '/register', '/about', '/contact', '/plant-store', '/services'];

// Routes cần authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/profile', '/orders', '/wishlist', '/cart'];

export default function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lấy token từ cookie
  const authToken = request.cookies.get('authToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Kiểm tra xem route hiện tại có phải route protected không
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Kiểm tra xem route hiện tại có phải route public không
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Nếu là protected route nhưng không có token -> redirect tới login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu user đã logged in (có token) nhưng cố truy cập trang login -> redirect tới dashboard
  if ((pathname === '/login' || pathname === '/register') && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
