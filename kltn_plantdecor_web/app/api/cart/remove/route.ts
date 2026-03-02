import { NextRequest, NextResponse } from 'next/server';
import { removeFromCartMock } from '@/lib/api/cartMockData';

export async function DELETE(request: NextRequest) {
  try {
    const { userId, plantId } = await request.json();
    
    if (!userId || !plantId) {
      return NextResponse.json(
        { error: 'userId and plantId are required' },
        { status: 400 }
      );
    }

    const cartItems = removeFromCartMock(userId, plantId);
    
    return NextResponse.json({
      success: true,
      data: cartItems,
      message: 'Item removed from cart successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove item from cart', details: String(error) },
      { status: 500 }
    );
  }
}
