import { NextRequest, NextResponse } from 'next/server';
import { updateQuantityMock } from '@/lib/api/cartMockData';

export async function PUT(request: NextRequest) {
  try {
    const { userId, plantId, quantity } = await request.json();
    
    if (!userId || !plantId || quantity === undefined) {
      return NextResponse.json(
        { error: 'userId, plantId, and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    const cartItems = updateQuantityMock(userId, plantId, quantity);
    
    return NextResponse.json({
      success: true,
      data: cartItems,
      message: 'Cart item quantity updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cart item quantity', details: String(error) },
      { status: 500 }
    );
  }
}
