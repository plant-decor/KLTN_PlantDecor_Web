import { NextRequest, NextResponse } from 'next/server';
import { addToCartMock } from '@/lib/api/cartMockData';
import { SAMPLE_PLANTS } from '@/data/sampledata';

export async function POST(request: NextRequest) {
  try {
    const { userId, plantId, quantity } = await request.json();
    
    if (!userId || !plantId || !quantity) {
      return NextResponse.json(
        { error: 'userId, plantId, and quantity are required' },
        { status: 400 }
      );
    }

    // Find plant in sample data
    const plant = SAMPLE_PLANTS.find((p) => p.id === plantId);
    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    // Check stock
    if (plant.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    const cartItems = addToCartMock(userId, plant, quantity);
    
    return NextResponse.json({
      success: true,
      data: cartItems,
      message: 'Item added to cart successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add item to cart', details: String(error) },
      { status: 500 }
    );
  }
}
