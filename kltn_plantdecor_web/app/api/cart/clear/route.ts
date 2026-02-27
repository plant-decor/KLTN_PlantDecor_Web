import { NextRequest, NextResponse } from 'next/server';
import { clearCartMock } from '@/lib/api/cartMockData';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const cartItems = clearCartMock(userId);
    const itemsCleared = Array.isArray(cartItems) ? cartItems.length : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        itemsCleared,
      },
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear cart', details: String(error) },
      { status: 500 }
    );
  }
}
