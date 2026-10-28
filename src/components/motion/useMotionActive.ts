import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * Whether looping, decorative animations (waves, bubbles, shimmer, pulses)
 * should run right now: the screen is focused, the app is in the foreground
 * and the user hasn't asked to reduce motion. Tabs stay mounted when hidden,
 * so without this every screen would keep animating in the background.
 */
export function useMotionActive() {
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  return focused && foreground && !reduceMotion;
}
