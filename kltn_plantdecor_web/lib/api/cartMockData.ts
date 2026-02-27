import type { CartItem } from '@/types/cart.types';
import type { SamplePlant } from '@/data/sampledata';
import { SAMPLE_PLANTS, ACTIVE_SAMPLE_USER_ID } from '@/data/sampledata';

// Mock database - in production, this would be a real database
// Key: userId, Value: array of cart items
const cartDatabase: Map<string, CartItem[]> = new Map();

// Initialize sample cart data for active user
function initializeSampleCart() {
  const sampleCartItems: CartItem[] = [
    {
      id: 10001,
      plantId: 1,
      plant: SAMPLE_PLANTS[0], // Monstera Deliciosa
      quantity: 2,
      addedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: 10002,
      plantId: 3,
      plant: SAMPLE_PLANTS[2], // Fiddle Leaf Fig
      quantity: 1,
      addedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      id: 10003,
      plantId: 4,
      plant: SAMPLE_PLANTS[3], // Pothos
      quantity: 3,
      addedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    },
  ];
  
  cartDatabase.set(String(ACTIVE_SAMPLE_USER_ID), sampleCartItems);
}

// Initialize on module load
initializeSampleCart();

export function getCartByUser(userId: string): CartItem[] {
  return cartDatabase.get(userId) || [];
}

export function addToCartMock(userId: string, plant: SamplePlant, quantity: number): CartItem[] {
  const userCart = cartDatabase.get(userId) || [];
  
  const existingItem = userCart.find((item) => item.plantId === plant.id);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const newItem: CartItem = {
      id: Date.now(),
      plantId: plant.id,
      plant,
      quantity,
      addedAt: new Date().toISOString(),
    };
    userCart.push(newItem);
  }
  
  cartDatabase.set(userId, userCart);
  return userCart;
}

export function removeFromCartMock(userId: string, plantId: number): CartItem[] {
  const userCart = cartDatabase.get(userId) || [];
  const filtered = userCart.filter((item) => item.plantId !== plantId);
  cartDatabase.set(userId, filtered);
  return filtered;
}

export function updateQuantityMock(userId: string, plantId: number, quantity: number): CartItem[] {
  const userCart = cartDatabase.get(userId) || [];
  const item = userCart.find((item) => item.plantId === plantId);
  
  if (item) {
    item.quantity = Math.max(0, quantity);
  }
  
  cartDatabase.set(userId, userCart);
  return userCart;
}

export function clearCartMock(userId: string): CartItem[] {
  cartDatabase.set(userId, []);
  return [];
}
