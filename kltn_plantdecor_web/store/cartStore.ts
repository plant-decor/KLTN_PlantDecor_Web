import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartState, CartItem, CheckoutData } from '@/types/cart.types';
import type { SamplePlant } from '@/data/sampledata';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      checkoutData: undefined,

      addToCart: (plant: SamplePlant, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.plantId === plant.id);

          if (existingItem) {
            // Nếu sản phẩm đã có trong cart, tăng số lượng
            return {
              items: state.items.map((item) =>
                item.plantId === plant.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          // Nếu sản phẩm chưa có, thêm mới
          const newItem: CartItem = {
            id: Date.now(),
            plantId: plant.id,
            plant,
            quantity,
            addedAt: new Date().toISOString(),
          };

          return {
            items: [...state.items, newItem],
          };
        });
      },

      removeFromCart: (plantId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.plantId !== plantId),
        }));
      },

      updateQuantity: (plantId: number, quantity: number) => {
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.plantId !== plantId)
              : state.items.map((item) =>
                  item.plantId === plantId ? { ...item, quantity } : item
                ),
        }));
      },

      clearCart: () => {
        set({
          items: [],
        });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          return total + item.plant.price * item.quantity;
        }, 0);
      },

      getCartItems: () => {
        return get().items;
      },

      // Checkout actions
      setCheckoutData: (data: CheckoutData) => {
        set({
          checkoutData: {
            ...data,
            createdAt: data.createdAt || new Date().toISOString(),
          },
        });
      },

      updateCheckoutData: (data: Partial<CheckoutData>) => {
        set((state) => ({
          checkoutData: state.checkoutData
            ? {
                ...state.checkoutData,
                ...data,
              }
            : undefined,
        }));
      },

      getCheckoutData: () => {
        return get().checkoutData;
      },

      clearCheckoutData: () => {
        set({
          checkoutData: undefined,
        });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // Persist items array and checkoutData
      partialize: (state) => ({
        items: state.items,
        checkoutData: state.checkoutData,
      }),
    }
  )
);
