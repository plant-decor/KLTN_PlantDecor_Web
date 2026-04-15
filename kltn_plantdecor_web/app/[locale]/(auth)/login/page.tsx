import AuthFormContainer from '@/components/auth/AuthFormContainer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDefaultPath } from '@/lib/utils/roleHelper';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ forceLogout?: string; redirectTo?: string }>;
}

/**
 * Login Page
 * 
 * Sử dụng LoginForm component để handle đăng nhập
 * LoginForm sẽ gọi Server Action (loginAction) để thực hiện login
 */
export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { forceLogout, redirectTo } = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get('accessToken')?.value;
  const userRole = cookieStore.get('userRole')?.value;
  const isForceLogout = forceLogout === '1';

  if (authToken && !isForceLogout) {
    const isSafeRedirectTo = redirectTo?.startsWith('/');
    const basePath: string = isSafeRedirectTo && redirectTo
      ? redirectTo
      : getDefaultPath(userRole) || '/';

    if (locale === 'vi') {
      redirect(basePath);
    }

    redirect(basePath === '/' ? `/${locale}` : `/${locale}${basePath}`);
  }

  return <AuthFormContainer />;
}
