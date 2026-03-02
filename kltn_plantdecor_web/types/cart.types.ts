import type { SamplePlant } from '@/data/sampledata';

export interface CartItem {
  id: number;
  plantId: number;
  plant: SamplePlant;
  quantity: number;
  addedAt: string;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
}

export interface CheckoutData {
  cartId: string;
  items: CartItem[];
  shippingInfo?: ShippingInfo;
  paymentMethod?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt?: string;
}

export interface CartState {
  items: CartItem[];
  checkoutData?: CheckoutData;
  
  // Cart actions
  addToCart: (plant: SamplePlant, quantity?: number) => void;
  removeFromCart: (plantId: number) => void;
  updateQuantity: (plantId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItems: () => CartItem[];
  
  // Checkout actions
  setCheckoutData: (data: CheckoutData) => void;
  updateCheckoutData: (data: Partial<CheckoutData>) => void;
  getCheckoutData: () => CheckoutData | undefined;
  clearCheckoutData: () => void;
}
