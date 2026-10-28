import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/** Demo loyalty: the user starts with 7 of 10 purchases. */
export const LOYALTY_START = 7;
export const LOYALTY_TARGET = 10;

type LoyaltyContextValue = {
  purchases: number;
  target: number;
  remaining: number;
  rewardReady: boolean;
  /** Records a completed order. Redeeming the reward starts a new card. */
  completePurchase: (options: { redeemedReward: boolean }) => void;
};

const LoyaltyContext = createContext<LoyaltyContextValue | null>(null);

/**
 * In-memory loyalty state for the prototype. Each completed order adds one
 * purchase up to the target; an order that uses the free garrafón resets it.
 */
export function LoyaltyProvider({ children }: { children: React.ReactNode }) {
  const [purchases, setPurchases] = useState(LOYALTY_START);

  const completePurchase = useCallback(({ redeemedReward }: { redeemedReward: boolean }) => {
    setPurchases((value) => (redeemedReward ? 0 : Math.min(LOYALTY_TARGET, value + 1)));
  }, []);

  const value = useMemo(
    () => ({
      purchases,
      target: LOYALTY_TARGET,
      remaining: Math.max(0, LOYALTY_TARGET - purchases),
      rewardReady: purchases >= LOYALTY_TARGET,
      completePurchase,
    }),
    [completePurchase, purchases],
  );

  return <LoyaltyContext.Provider value={value}>{children}</LoyaltyContext.Provider>;
}

export function useLoyalty() {
  const value = useContext(LoyaltyContext);
  if (!value) throw new Error('useLoyalty must be used inside LoyaltyProvider');
  return value;
}
