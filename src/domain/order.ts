import { DELIVERY, PRODUCTS, type Product } from '@/data/catalog';

/**
 * Order rules shared by every screen: cart lines, coupons, the Club Hidra
 * reward and the final totals. Pure functions only, so they can move to the
 * backend (or be unit-tested) without touching the UI.
 */

export type Cart = Record<string, number>;
export type CartLine = { product: Product; quantity: number };

export const MAX_QUANTITY = 12;

/** Product the Club Hidra reward pays for once the card is full. */
export const REWARD_PRODUCT_ID = 'purificada-20';

export type Coupon = { code: string; label: string; amount: number };

/** Prototype coupons. Replace with a server-side validation call. */
const COUPONS: Coupon[] = [{ code: 'HIDRA10', label: 'Cupón HIDRA10', amount: 10 }];

export const DEMO_COUPON = COUPONS[0].code;

export function findCoupon(input: string): Coupon | null {
  const code = input.trim().toUpperCase();
  return COUPONS.find((coupon) => coupon.code === code) ?? null;
}

export function clampQuantity(quantity: number) {
  return Math.min(MAX_QUANTITY, Math.max(0, Math.round(quantity)));
}

export function cartLines(cart: Cart): CartLine[] {
  return PRODUCTS.filter((product) => (cart[product.id] ?? 0) > 0).map((product) => ({
    product,
    quantity: cart[product.id],
  }));
}

/** The reward only applies when a 20 L purified garrafón is in the cart. */
export function rewardDiscount(cart: Cart, rewardReady: boolean) {
  if (!rewardReady || (cart[REWARD_PRODUCT_ID] ?? 0) === 0) return 0;
  return PRODUCTS.find((product) => product.id === REWARD_PRODUCT_ID)?.price ?? 0;
}

export type Discounts = { coupon?: Coupon | null; reward?: number };

export function cartTotals(cart: Cart, discounts: Discounts = {}) {
  const lines = cartLines(cart);
  const items = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  const shipping = items > 0 ? DELIVERY.fee : 0;
  const couponDiscount = discounts.coupon?.amount ?? 0;
  const reward = discounts.reward ?? 0;
  const total = Math.max(0, subtotal + shipping - couponDiscount - reward);
  return { lines, items, subtotal, shipping, couponDiscount, reward, total };
}

/** `1` → "1 unidad", `3` → "3 unidades" (or any singular/plural pair). */
export function unitsLabel(items: number, noun: [string, string] = ['unidad', 'unidades']) {
  return `${items} ${items === 1 ? noun[0] : noun[1]}`;
}
