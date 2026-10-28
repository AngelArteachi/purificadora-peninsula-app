import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { WaterBackground } from '@/components/ui/WaterBackground';
import { fill, fonts, makeStyles, useTheme } from '@/theme';

const BADGE = 104;
const DROPS = 12;

/** One ripple that expands from the badge once. */
function Ripple({ delay, color }: { delay: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 1.8 }],
  }));

  return <Animated.View style={[styles.ripple, { borderColor: color }, style]} />;
}

/** A water drop that bursts outward from the badge and fades. */
function Drop({ index, color }: { index: number; color: string }) {
  const progress = useSharedValue(0);
  const angle = (index / DROPS) * Math.PI * 2;
  const distance = 90 + (index % 3) * 26;

  useEffect(() => {
    progress.value = withDelay(120, withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value < 0.15 ? progress.value / 0.15 : 1 - (progress.value - 0.15) / 0.85,
    transform: [
      { translateX: Math.cos(angle) * distance * progress.value },
      // Drops arc down a little, like water would.
      { translateY: Math.sin(angle) * distance * progress.value + progress.value * progress.value * 30 },
      { rotate: `${(angle * 180) / Math.PI + 90}deg` },
      { scale: 1 - progress.value * 0.4 },
    ],
  }));

  return (
    <Animated.View style={[styles.drop, style]}>
      <Svg width={12} height={16} viewBox="0 0 12 16">
        <Path d="M6 0 C6 0 12 7 12 10.5 C12 13.8 9.3 16 6 16 C2.7 16 0 13.8 0 10.5 C0 7 6 0 6 0 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

type SuccessOverlayProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
};

/** Full-screen confirmation: ripples, a bouncing check and a splash of drops. */
export function SuccessOverlay({
  visible,
  title = '¡Pago confirmado!',
  subtitle = 'Estamos preparando tu pedido…',
}: SuccessOverlayProps) {
  const t = useTheme();
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const pop = useSharedValue(0);
  const check = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      pop.value = 0;
      check.value = 0;
      return;
    }
    pop.value = withSequence(withSpring(1.12, { damping: 10, stiffness: 220 }), withSpring(1, { damping: 14 }));
    check.value = withDelay(180, withSpring(1, { damping: 9, stiffness: 200 }));
  }, [check, pop, visible]);

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }], opacity: Math.min(1, pop.value) }));
  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: check.value }, { rotate: `${(1 - check.value) * -40}deg` }],
  }));

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.host} accessibilityLiveRegion="polite">
      <WaterBackground />

      <View style={styles.burst}>
        {reduceMotion ? null : (
          <>
            <Ripple delay={0} color={t.success} />
            <Ripple delay={260} color={t.success} />
            <Ripple delay={520} color={t.primary} />
            {Array.from({ length: DROPS }).map((_, index) => (
              <Drop key={index} index={index} color={index % 2 ? t.primary : t.success} />
            ))}
          </>
        )}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Animated.View style={checkStyle}>
            <Ionicons name="checkmark" size={52} color={t.onPrimary} />
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.Text entering={FadeInUp.delay(260).springify().damping(16)} style={styles.title}>
        {title}
      </Animated.Text>
      <Animated.View entering={FadeInUp.delay(360).springify().damping(16)}>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ripple: {
    position: 'absolute',
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    borderWidth: 3,
  },
  drop: {
    position: 'absolute',
  },
});

const useStyles = makeStyles((t) => ({
  host: {
    ...fill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    zIndex: 20,
    backgroundColor: t.background,
  },
  burst: {
    width: BADGE,
    height: BADGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  badge: {
    height: BADGE,
    width: BADGE,
    borderRadius: BADGE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.success,
    boxShadow: t.scheme === 'dark' ? 'none' : '0px 10px 30px rgba(10,138,95,0.35)',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.4,
    color: t.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    color: t.textSecondary,
    textAlign: 'center',
  },
}));
