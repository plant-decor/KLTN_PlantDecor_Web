import { NextRequest, NextResponse } from 'next/server';
import { getCartByUser } from '@/lib/api/cartMockData';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const cartItems = getCartByUser(userId);
    
    return NextResponse.json({
      success: true,
      data: cartItems,
      message: 'Cart retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve cart', details: String(error) },
      { status: 500 }
    );
  }
}
