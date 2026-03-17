import { NextRequest, NextResponse } from 'next/server';
import { loginWithGoogleAction } from '@/app/actions/authenticationActions';
import type { GoogleLoginRequest } from '@/types/auth.types';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { accessToken, deviceId } = body as GoogleLoginRequest;

		if (!accessToken) {
			return NextResponse.json(
				{ error: 'Access token is required' },
				{ status: 400 }
			);
		}

		const result = await loginWithGoogleAction({
			accessToken,
			deviceId: deviceId || 'web-client',
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Google login error:', error);
		return NextResponse.json(
			{ error: 'Login failed' },
			{ status: 500 }
		);
	}
}
