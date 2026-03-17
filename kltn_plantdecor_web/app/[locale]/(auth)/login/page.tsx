import AuthFormContainer from '@/components/auth/AuthFormContainer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Login Page
 * 
 * Sử dụng LoginForm component để handle đăng nhập
 * LoginForm sẽ gọi Server Action (loginAction) để thực hiện login
 */
export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;

  if (authToken) {
    redirect(`/${locale}`);
  }

  return <AuthFormContainer />;
}
