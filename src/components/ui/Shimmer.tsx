import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { makeStyles, useTheme } from '@/theme';

/**
 * Skeleton placeholder: a muted block with a soft highlight sweeping across,
 * shown while content (like a product photo) is still loading.
 */
export function Shimmer({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const styles = useStyles();
  const active = useMotionActive();
  const highlight =
    t.scheme === 'dark'
      ? (['rgba(255,255,255,0)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0)'] as const)
      : (['rgba(255,255,255,0)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0)'] as const);
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(sweep);
      return;
    }
    sweep.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [active, sweep]);

  const sweepStyle = useAnimatedStyle(() => ({ left: `${-60 + sweep.value * 160}%` }));

  return (
    <View style={[styles.base, style]} accessibilityLabel="Cargando">
      <Animated.View style={[styles.sweep, sweepStyle]}>
        <LinearGradient
          colors={highlight}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    overflow: 'hidden',
    backgroundColor: t.scheme === 'dark' ? '#1A2C3B' : '#E3ECF5',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '60%',
  },
}));
