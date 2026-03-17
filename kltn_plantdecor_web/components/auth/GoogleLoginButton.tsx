'use client';

import { useGoogleLogin } from '@react-oauth/google';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/auth.types';

export default function GoogleLoginButton() {
    const t = useTranslations('auth');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuthStore();

    const googleLogin = useGoogleLogin({
        onSuccess: (credentialResponse) => {
            console.log('=== GOOGLE LOGIN SUCCESS ===', credentialResponse);
            fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: credentialResponse.access_token,
                    deviceId: 'web-client'
                }),
            })
                .then(async (res) => {
                    const data = await res.json();
                    
                    if (!res.ok || !data.success) {
                        toast.error(data.message || data.error || t('loginFailed'));
                        return;
                    }

                    if (data.user) {
                        // Cập nhật auth store với user info
                        setUser(data.user as User);
                        
                        // Hiển thị thông báo thành công
                        toast.success(data.message || t('welcomeUser'));
                        
                        // Lấy redirect URL từ query params hoặc redirect về home
                        const redirectToRaw = searchParams.get('redirectTo');
                        const redirectTo = redirectToRaw && redirectToRaw.startsWith('/')
                            ? redirectToRaw
                            : '/';
                        const resolvedRedirectTo = data.user.id
                            ? redirectTo.replace(/\[(userid|userId)\]/g, String(data.user.id))
                            : redirectTo;
                        
                        // Redirect đến home/dashboard sau khi login thành công
                        setTimeout(() => {
                            router.push(resolvedRedirectTo);
                        }, 500);
                    } else {
                        toast.error(t('loginFailed'));
                    }
                })
                .catch((error) => {
                    console.error('Google login error:', error);
                    toast.error(t('loginFailed'));
                });
        },
        onError: () => {
            toast.error(t('loginFailed'));
        }
    });


    return (
        <button
            onClick={() => googleLogin()}
            className="w-full h-12 border border-gray-300 hover:bg-blue-300 font-semibold rounded-lg cursor-pointer transition-all hover:scale-105 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
            <span>{t('loginWithGoogle')}</span>
            <span className="w-2"></span>
            <svg width="30" height="30" viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fill-rule="evenodd">
                    <path d="M255.68 131c0-10.6-.95-20.8-2.73-30.6H130v57.9h70.4c-3 16.2-12.1 29.9-25.7 39v32h41.5c24.3-22.4 39.48-55.4 39.48-98.3z"
                        fill="#4285F4" />

                    <path d="M130 261.1c34.9 0 64.2-11.6 85.6-31.4l-41.5-32c-11.6 7.8-26.5 12.4-44.1 12.4-33.9 0-62.7-22.9-73-53.7H13.5v33.7C34.8 232.8 79 261.1 130 261.1z"
                        fill="#34A853" />

                    <path d="M57 156.4c-2.7-7.8-4.2-16.2-4.2-24.9s1.5-17.1 4.2-24.9V72.9H13.5C4.9 90.2 0 110.2 0 131.5s4.9 41.3 13.5 58.6L57 156.4z"
                        fill="#FBBC05" />

                    <path d="M130 52.3c19 0 36.1 6.5 49.6 19.3l37.2-37.2C194.1 12.3 164.9 0 130 0 79 0 34.8 28.3 13.5 72.9l43.5 33.7c10.3-30.8 39.1-53.7 73-53.7z"
                        fill="#EA4335" />
                </g>
            </svg>

        </button>

    );
}