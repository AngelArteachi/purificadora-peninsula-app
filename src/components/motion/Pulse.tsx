import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionActive } from '@/components/motion/useMotionActive';

function Ring({ color, size, delay, duration }: { color: string; size: number; delay: number; duration: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), -1, false));
  }, [delay, duration, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.5 * (1 - progress.value),
    transform: [{ scale: 0.6 + progress.value * 1.4 }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius: size / 2, backgroundColor: color, width: size, height: size },
        style,
      ]}
    />
  );
}

/**
 * Expanding "sonar" rings behind its child, for live things: the courier,
 * an active step, a fresh notification. Paused off-screen or with reduced motion.
 */
export function Pulse({
  color,
  size,
  rings = 2,
  duration = 1800,
  children,
  style,
}: {
  color: string;
  size: number;
  rings?: number;
  duration?: number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const active = useMotionActive();
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {!active
        ? null
        : Array.from({ length: rings }).map((_, index) => (
            <Ring key={index} color={color} size={size} delay={(index * duration) / rings} duration={duration} />
          ))}
      {children}
    </View>
  );
}
