'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import CartBadge from '@/components/cart/CartBadge';
import LanguageSwitcher from './LanguageSwitcher';
import HeaderUnifiedSearch from './HeaderUnifiedSearch';
import { getCategoryTree, type CategoryResponse } from '@/lib/api/categoriesService';
import {
  Home as HomeIcon,
  Storefront as StorefrontIcon,
  MiscellaneousServices as ServicesIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  LocalFlorist as LocalFloristIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  SmartToy as SmartToyIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  GUEST_ACTIONS,
  type HeaderNavItem,
  NAV_ITEMS_BY_ROLE,
  type UserRole,
  USER_MENU_ITEMS,
  type HeaderIconKey,
} from '@/lib/constants/header';
import { useAuthStore } from '@/lib/store/authStore';
import { logoutAction } from '@/app/actions/loginAction';
import Image from 'next/image';

const NAV_LABEL_KEYS: Record<HeaderIconKey, string> = {
  home: 'home',
  store: 'plantStore',
  services: 'services',
  contact: 'contact',
  about: 'about',
  myPlant: 'myPlant',
  ai: 'aiRecommendation',
  aiChat: 'aiChatSupport',
};

const getNavLabelKey = (icon: HeaderIconKey): string => NAV_LABEL_KEYS[icon];

const USER_MENU_LABEL_KEYS: Record<string, string> = {
  '/profile/[userid]': 'profile',
  '/orders/[userid]': 'orderHistory',
  '/wishlist/[userid]': 'wishlist',
  '/logout': 'logout',
};

const ICONS: Record<HeaderIconKey, ReactNode> = {
  home: <HomeIcon sx={{ fontSize: 20 }} />,
  store: <StorefrontIcon sx={{ fontSize: 20 }} />,
  services: <ServicesIcon sx={{ fontSize: 20 }} />,
  contact: <PhoneIcon sx={{ fontSize: 20 }} />,
  about: <InfoIcon sx={{ fontSize: 20 }} />,
  myPlant: <LocalFloristIcon sx={{ fontSize: 20 }} />,
  ai: <SmartToyIcon sx={{ fontSize: 20 }} />,
  aiChat: <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} />,
};

interface NavigationProps {
  initialStoreCategories?: CategoryResponse[];
}

const resolveHref = (href: string, userId?: number | null) => {
  if (/\[(userid|userId)\]/.test(href)) {
    if (userId) {
      return href.replace(/\[(userid|userId)\]/g, String(userId));
    }

    return `/login?redirectTo=${encodeURIComponent(href)}`;
  }

  return href;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join('') || 'U';
};

export default function Navigation({ initialStoreCategories = [] }: NavigationProps) {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStoreHoverOpen, setIsStoreHoverOpen] = useState(false);
  const [storeCategories, setStoreCategories] = useState<CategoryResponse[]>(initialStoreCategories);
  const { user, clearAll } = useAuthStore();
  const tNav = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const tUserMenu = useTranslations('headerUserMenu');

  const getUserMenuLabel = (href: string) => {
    const key = USER_MENU_LABEL_KEYS[href];
    return key ? tUserMenu(key) : href;
  };

  const activeUser = user || null;
  const rawRole = activeUser?.role ?? 'guest';
  const normalizedRole = String(rawRole).trim().toLowerCase();
  const roleAliasMap: Record<string, UserRole> = {
    guest: 'guest',
    customer: 'customer',
    admin: 'admin',
    manager: 'manager',
    staff: 'staff',
    consultant: 'consultant',
    shipper: 'shipper',
    caretaker: 'caretaker',
  };
  const role: UserRole = roleAliasMap[normalizedRole] ?? 'guest';
  const navItems: HeaderNavItem[] = NAV_ITEMS_BY_ROLE[role] ?? NAV_ITEMS_BY_ROLE.guest;
  const isGuest = role === 'guest';
  const isCustomerLike = role === 'customer';
  const canShowStoreCategoryMenu = isGuest || isCustomerLike;
  const userId = activeUser?.id ?? null;
  const avatarLabel = activeUser?.email ? getInitials(activeUser.email) : 'U';

  const redirectToLogin = () => {
    clearAll();
    setIsMenuOpen(false);
    const locale = Array.isArray(params?.locale) ? params.locale[0] : params?.locale;
    const loginPath = locale ? `/${locale}/login` : '/login';
    router.replace(loginPath);
  };

  const handleLogout = async () => {
    try {
      const result = await logoutAction();
      if (!result.success) {
        console.warn('Logout action reported failure, continuing with local cleanup.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Keep logout fail-soft: local cleanup and redirect should always happen.
      redirectToLogin();
    }
  };

  useEffect(() => {
    if (!canShowStoreCategoryMenu) {
      setStoreCategories([]);
      return;
    }

    if (storeCategories.length > 0) {
      return;
    }

    let isMounted = true;

    const fetchStoreCategories = async () => {
      try {
        const response = await getCategoryTree(false);
        const tree = response.payload ?? response.data ?? [];

        if (!isMounted) {
          return;
        }

        setStoreCategories(tree.filter((category) => category.isActive));
      } catch (error) {
        if (isMounted) {
          console.error('Failed to fetch public categories tree:', error);
        }
      }
    };

    fetchStoreCategories();

    return () => {
      isMounted = false;
    };
  }, [canShowStoreCategoryMenu, storeCategories.length]);

  const filteredStoreCategories = useMemo(() => {
    const filterTree = (nodes: CategoryResponse[]): CategoryResponse[] => {
      return nodes
        .filter((node) => node.isActive)
        .map((node) => ({
          ...node,
          subCategories: Array.isArray(node.subCategories) ? filterTree(node.subCategories) : [],
        }));
    };

    return filterTree(storeCategories);
  }, [storeCategories]);

  const renderStoreCategoryTree = (nodes: CategoryResponse[], level = 0): ReactNode => {
    if (!nodes.length) {
      return null;
    }

    return (
      <ul className={level === 0 ? 'space-y-1' : 'space-y-1 pl-4 border-l border-gray-100 mt-1'}>
        {nodes.map((category) => (
          <li key={category.id}>
            <Link
              href={`/plant-store?categoryIds=${category.id}`}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
              onClick={() => {
                setIsStoreHoverOpen(false);
                setIsMenuOpen(false);
              }}
            >
              {category.name}
            </Link>
            {Array.isArray(category.subCategories) && category.subCategories.length > 0
              ? renderStoreCategoryTree(category.subCategories, level + 1)
              : null}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="hidden md:flex items-center justify-around h-12">
          <div className="flex items-center gap-1 lg:gap-6">
            {navItems.map((item: HeaderNavItem) => {
              const isStoreItem = item.icon === 'store';
              const shouldRenderStoreMenu = isStoreItem && canShowStoreCategoryMenu;

              if (!shouldRenderStoreMenu) {
          return (
            <Link
              key={item.icon}
              href={resolveHref(item.href, userId)}
              className="inline-flex items-center gap-1.5 lg:gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 px-2.5 lg:px-4 py-2 rounded-full"
            >
              <span className="hidden lg:inline-flex">{ICONS[item.icon as HeaderIconKey]}</span>
              <span className="text-xs lg:text-sm font-semibold whitespace-nowrap">
                {tNav(getNavLabelKey(item.icon))}
              </span>
            </Link>
          );
              }

              return (
          <div
            key={item.icon}
            className="relative"
            onMouseEnter={() => setIsStoreHoverOpen(true)}
            onMouseLeave={() => setIsStoreHoverOpen(false)}
          >
            <Link
              href={resolveHref(item.href, userId)}
              className="inline-flex items-center gap-1.5 lg:gap-2 text-gray-700 hover:text-green-600 transition-colors duration-200 hover:bg-green-50 px-2.5 lg:px-4 py-2 rounded-full"
            >
              <span className="hidden lg:inline-flex">{ICONS[item.icon as HeaderIconKey]}</span>
              <span className="text-xs lg:text-sm font-semibold whitespace-nowrap">
                {tNav(getNavLabelKey(item.icon))}
              </span>
            </Link>

            {isStoreHoverOpen && (
              <div className="absolute left-0 top-full z-50 w-96 pt-2">
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl max-h-[60vh] overflow-y-auto">
            {filteredStoreCategories.length > 0 ? (
              renderStoreCategoryTree(filteredStoreCategories)
            ) : (
              <p className="px-3 py-2 text-sm text-gray-500">No categories available</p>
            )}
                </div>
              </div>
            )}
          </div>
              );
            })}
          </div>
        </div>

        <div className="md:hidden flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo/logo-landscape.png"
              alt="Plant Decor Logo"
              width={130}
              height={80}
              className="w-auto h-26 object-contain"
            />
          </Link>

          <div className="flex items-center gap-3">
            <CartBadge />
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-gray-100">
            <div className="pt-3 px-2">
              <HeaderUnifiedSearch width="100%" onNavigate={() => setIsMenuOpen(false)} />
            </div>

            <div className="pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.icon}
                  href={resolveHref(item.href, userId)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {ICONS[item.icon as HeaderIconKey]}
                  <span className="text-sm font-medium">
                    {tNav(getNavLabelKey(item.icon))}
                  </span>
                </Link>
              ))}
            </div>

            {/* {canShowStoreCategoryMenu && (
              <div className="px-2 pt-2">
                <button
                  className="flex w-full items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700"
                  onClick={() => setIsMobileStoreOpen((prev) => !prev)}
                >
                  <span>Categories</span>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{ transform: isMobileStoreOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                  />
                </button>

                {isMobileStoreOpen && (
                  <div className="mt-2 rounded-lg border border-gray-100 bg-white p-2">
                    {filteredStoreCategories.length > 0 ? (
                      renderMobileCategoryTree(filteredStoreCategories)
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">No categories available</p>
                    )}
                  </div>
                )}
              </div>
            )} */}

            <div className="border-t border-gray-100 pt-3 mt-1 px-4 space-y-2">
              {isGuest && (
                <>
                  <Link
                    href={GUEST_ACTIONS.login.href}
                    className="block w-full text-center py-2 rounded-lg border border-green-600 text-green-600 text-sm font-medium hover:bg-green-50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tAuth('login')}
                  </Link>
                  <Link
                    href={GUEST_ACTIONS.register.href}
                    className="block w-full text-center py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tAuth('register')}
                  </Link>
                </>
              )}

              {isCustomerLike && (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-sm font-semibold text-white">
                      {avatarLabel}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{activeUser?.email}</span>
                  </div>
                  {USER_MENU_ITEMS.map((item) => (
                    item.href === '/logout' ? (
                      <button
                        key={item.label}
                        type="button"
                        className="block w-full px-2 py-2 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg text-sm transition-colors"
                        onClick={handleLogout}
                      >
                        {getUserMenuLabel(item.href)}
                      </button>
                    ) : (
                      <Link
                        key={item.label}
                        href={resolveHref(item.href, userId)}
                        className="block px-2 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg text-sm transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {getUserMenuLabel(item.href)}
                      </Link>
                    )
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
