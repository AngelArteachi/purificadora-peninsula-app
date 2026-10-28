import React, { useEffect, useRef, useState } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { formatMoney } from '@/domain/money';

/**
 * Tweens a number towards `value` whenever it changes (ease-out, ~450 ms).
 * Runs on the JS thread so it works the same with any text formatting.
 */
export function useCountUp(value: number, duration = 450) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    if (reduceMotion) {
      from.current = value;
      return;
    }
    const start = from.current;
    const startedAt = Date.now();
    let frame = 0;
    const tick = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = start + (value - start) * eased;
      from.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, reduceMotion, value]);

  return reduceMotion ? value : display;
}

/** Money text that counts to its new value instead of jumping. */
export function CountUpMoney({ value, style }: { value: number; style?: StyleProp<TextStyle> }) {
  const display = useCountUp(value);
  return (
    <Text style={style} accessibilityLabel={formatMoney(value)}>
      {formatMoney(Math.round(display * 100) / 100)}
    </Text>
  );
}
