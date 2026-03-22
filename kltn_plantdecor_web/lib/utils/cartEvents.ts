'use client';

export const CART_UPDATED_EVENT = 'cart:updated';

export const notifyCartUpdated = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
};

export const subscribeCartUpdated = (listener: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(CART_UPDATED_EVENT, listener);
  return () => {
    window.removeEventListener(CART_UPDATED_EVENT, listener);
  };
};
