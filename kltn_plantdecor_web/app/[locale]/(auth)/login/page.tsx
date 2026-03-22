import AuthFormContainer from '@/components/auth/AuthFormContainer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ forceLogout?: string }>;
}

/**
 * Login Page
 * 
 * Sử dụng LoginForm component để handle đăng nhập
 * LoginForm sẽ gọi Server Action (loginAction) để thực hiện login
 */
export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const { forceLogout } = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get('accessToken')?.value;
  const isForceLogout = forceLogout === '1';

  if (authToken && !isForceLogout) {
    redirect(`/${locale}`);
  }

  return <AuthFormContainer />;
}
