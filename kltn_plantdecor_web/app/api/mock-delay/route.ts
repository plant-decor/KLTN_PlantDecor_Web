import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DELAY_MS = 5000;

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  return NextResponse.json(
    {
      success: true,
      message: 'Mock delay response after 5 seconds',
      delayMs: DELAY_MS,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
