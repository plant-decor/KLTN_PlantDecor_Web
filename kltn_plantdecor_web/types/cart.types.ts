import type { Plant } from '@/data/sampledata';
import type { OrderInvoice } from '@/types/order.types';

export interface CartItem {
  id: number;
  cartId: number;
  commonPlantId: number | null;
  plantId?: number | null;
  plantComboId?: number | null;
  materialId?: number | null;
  price: number;
  productName: string;
  quantity: number;
  imageUrl: string | null;
  subtotal: number;
  createdAt?: string;
  nurseryId?: number | null;
  nurseryName?: string;
  nurseryMaterialId?: number | null;
  nurseryPlantComboId?: number | null;
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
  paymentStrategy?: number;
  orderType?: number;
  plantInstanceId?: number | null;
  buyNowItemId?: number | null;
  buyNowItemType?: number | null;
  buyNowQuantity?: number | null;
  paymentMethod?: string;
  useProfileInfo?: boolean;
  /** Set after createOrder when checkout creates the order before payment */
  orderId?: number;
  invoices?: OrderInvoice[];
  subtotal: number;
  // shippingFee: number;
  total: number;
  createdAt?: string;
}

export interface CartState {
  items: CartItem[];
  checkoutData?: CheckoutData;
  
  // Cart actions
  addToCart: (plant: Plant, quantity?: number) => void;
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
