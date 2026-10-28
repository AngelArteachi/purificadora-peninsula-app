import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  ADDRESSES,
  DEFAULT_CART,
  DELIVERY_WINDOWS,
  type DeliveryAddress,
  type DeliveryWindow,
} from '@/data/catalog';
import { clampQuantity, type Cart } from '@/domain/order';

export type Frequency = 'unica' | 'semanal' | 'quincenal';

/** Snapshot of a confirmed order, so later cart edits don't change tracking. */
export type PlacedOrder = {
  cart: Cart;
  total: number;
  address: DeliveryAddress;
  deliveryWindow: DeliveryWindow;
};

type CartContextValue = {
  cart: Cart;
  frequency: Frequency;
  address: DeliveryAddress;
  deliveryWindow: DeliveryWindow;
  activeOrder: PlacedOrder | null;
  setQuantity: (id: string, quantity: number) => void;
  replaceCart: (next: Cart) => void;
  setFrequency: (frequency: Frequency) => void;
  setDelivery: (addressId: string, windowId: string) => void;
  placeOrder: (total: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Prototype order state shared by the catalogue, checkout and tracking screens.
 * Everything is in memory: a reload returns to the sample order.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ ...DEFAULT_CART });
  const [frequency, setFrequency] = useState<Frequency>('unica');
  const [addressId, setAddressId] = useState(ADDRESSES[0].id);
  const [windowId, setWindowId] = useState(DELIVERY_WINDOWS[0].id);
  const [activeOrder, setActiveOrder] = useState<PlacedOrder | null>(null);

  const address = ADDRESSES.find((item) => item.id === addressId) ?? ADDRESSES[0];
  const deliveryWindow = DELIVERY_WINDOWS.find((item) => item.id === windowId) ?? DELIVERY_WINDOWS[0];

  const setQuantity = useCallback((id: string, quantity: number) => {
    setCart((current) => {
      const next = { ...current };
      const safeQuantity = clampQuantity(quantity);

      if (safeQuantity === 0) {
        delete next[id];
      } else {
        next[id] = safeQuantity;
      }

      return next;
    });
  }, []);

  const replaceCart = useCallback((next: Cart) => {
    setCart({ ...next });
  }, []);

  const setDelivery = useCallback((nextAddressId: string, nextWindowId: string) => {
    setAddressId(nextAddressId);
    setWindowId(nextWindowId);
  }, []);

  const placeOrder = useCallback(
    (total: number) => {
      setActiveOrder({ cart, total, address, deliveryWindow });
      setCart({});
    },
    [address, cart, deliveryWindow],
  );

  const value = useMemo(
    () => ({
      cart,
      frequency,
      address,
      deliveryWindow,
      activeOrder,
      setQuantity,
      replaceCart,
      setFrequency,
      setDelivery,
      placeOrder,
    }),
    [activeOrder, address, cart, deliveryWindow, frequency, placeOrder, replaceCart, setDelivery, setQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
