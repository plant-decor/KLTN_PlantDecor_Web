import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { ROLE_TO_ROUTES, ROUTE_TO_ROLES } from "@/lib/constants/roleRoutes";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_ROUTES = Object.keys(ROUTE_TO_ROLES);
const ROLE_NORMALIZATION_MAP: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  consultant: "Consultant",
  caretaker: "Caretaker",
  shipper: "Shipper",
  customer: "Customer",
};

function normalizeRole(rawRole?: string): string {
  if (!rawRole) return "";
  const trimmed = rawRole.trim();
  if (!trimmed) return "";
  return ROLE_NORMALIZATION_MAP[trimmed.toLowerCase()] || trimmed;
}

export function hasAccess(userRole: string, route: string): boolean {
  return ROLE_TO_ROUTES[userRole]?.includes(route) ?? false;
}

function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split("/");
  const potentialLocale = segments[1] ?? "";
  return routing.locales.includes(potentialLocale as "vi" | "en")
    ? potentialLocale
    : routing.defaultLocale;
}

function getLocalizedPath(pathname: string, basePath: string): string {
  const locale = getLocaleFromPath(pathname);
  return locale === routing.defaultLocale ? basePath : `/${locale}${basePath}`;
}

export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const authToken = request.cookies.get("accessToken")?.value;
  const userRole = normalizeRole(request.cookies.get("userRole")?.value);

  const segments = pathname.split("/");
  const protectedRoute = PROTECTED_ROUTES.find((route) =>
    segments.includes(route),
  );
  const isAuthPage =
    segments.includes("login") || segments.includes("register");
  const forceLogout = searchParams.get("forceLogout") === "1";

  if (protectedRoute && !authToken) {
    const loginPath = getLocalizedPath(pathname, "/login");
    const loginUrl = new URL(loginPath, request.nextUrl.origin);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (protectedRoute && authToken && userRole) {
    const allowedRoles = ROUTE_TO_ROLES[protectedRoute];

    if (!allowedRoles.includes(userRole)) {
      const unauthorizedPath = getLocalizedPath(pathname, "/unauthorized");
      return NextResponse.redirect(
        new URL(unauthorizedPath, request.nextUrl.origin),
      );
    }
  }

  if (isAuthPage && forceLogout) {
    const response = intlMiddleware(request);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("userRole");
    return response;
  }

  if (isAuthPage && authToken && !forceLogout) {
    const roleToDefaultPath: Record<string, string> = {
      Admin: "/dashboard",
      Manager: "/dashboard",
      Staff: "/dashboard",
      Consultant: "/consultant",
      Caretaker: "/dashboard",
      Shipper: "/dashboard",
      Customer: "/",
    };

    const basePath = userRole ? roleToDefaultPath[userRole] || "/" : "/";
    const targetPath = getLocalizedPath(pathname, basePath);

    return NextResponse.redirect(new URL(targetPath, request.nextUrl.origin));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
