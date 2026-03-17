import { NextResponse } from 'next/server';

const deprecatedResponse = () =>
	NextResponse.json(
		{
			error: 'This endpoint is deprecated. Use the server-to-server authentication actions instead.',
		},
		{ status: 410 }
	);

export async function POST() {
	return deprecatedResponse();
}

export async function GET() {
	return deprecatedResponse();
}
