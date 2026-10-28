import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { layout, useTheme, type Palette } from '@/theme';

/** Canvas colors: a soft water tint at the top that settles into the page color. */
function canvas(t: Palette) {
  return t.scheme === 'dark'
    ? { gradient: ['#10294A', '#0C1B2B', t.background] as const, glow: '#2F86E8', wave: '#3B97F5' }
    : { gradient: ['#D6E8FB', '#E9F2FB', t.background] as const, glow: '#4FA3F7', wave: '#0B6BD3' };
}

type Blob = { size: number; top: number; left: number; drift: number; duration: number; opacity: number };

/** Large blurred "light through water" spots, as fractions of the screen. */
const BLOBS: Blob[] = [
  { size: 1.1, top: -0.18, left: -0.35, drift: 26, duration: 11000, opacity: 0.32 },
  { size: 0.9, top: 0.18, left: 0.45, drift: 34, duration: 14000, opacity: 0.22 },
  { size: 1.0, top: 0.62, left: -0.4, drift: 30, duration: 16000, opacity: 0.16 },
];

/** Small bubbles rising from the bottom, staggered so there's always one in view. */
const BUBBLES = [
  { x: 0.06, r: 3, duration: 11000, delay: 2000 },
  { x: 0.12, r: 5, duration: 13000, delay: 0 },
  { x: 0.2, r: 2.5, duration: 9000, delay: 5000 },
  { x: 0.3, r: 3, duration: 10000, delay: 3500 },
  { x: 0.38, r: 7, duration: 16000, delay: 7000 },
  { x: 0.46, r: 3.5, duration: 12000, delay: 500 },
  { x: 0.55, r: 6, duration: 15000, delay: 1500 },
  { x: 0.63, r: 2.5, duration: 9500, delay: 4200 },
  { x: 0.72, r: 3.5, duration: 11500, delay: 6000 },
  { x: 0.8, r: 5.5, duration: 14500, delay: 2800 },
  { x: 0.88, r: 4.5, duration: 14000, delay: 8000 },
  { x: 0.95, r: 3, duration: 10500, delay: 1000 },
];

function GlowBlob({
  blob,
  id,
  width,
  height,
  color,
}: {
  blob: Blob;
  /** Unique gradient id: SVG ids are global on web. */
  id: string;
  width: number;
  height: number;
  color: string;
}) {
  const active = useMotionActive();
  const phase = useSharedValue(0);
  const size = width * blob.size;

  useEffect(() => {
    if (!active) {
      cancelAnimation(phase);
      return;
    }
    phase.value = withRepeat(withTiming(1, { duration: blob.duration, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [blob.duration, phase, active]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: (phase.value - 0.5) * blob.drift * 2 },
      { translateY: (0.5 - phase.value) * blob.drift },
      { scale: 1 + phase.value * 0.08 },
    ],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', width: size, height: size, top: height * blob.top, left: width * blob.left },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id={id} cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={blob.opacity} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

function Bubble({ x, r, duration, delay, height, color }: (typeof BUBBLES)[number] & { height: number; color: string }) {
  const active = useMotionActive();
  const rise = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(rise);
      return;
    }
    rise.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false));
  }, [delay, duration, active, rise]);

  const style = useAnimatedStyle(() => ({
    opacity: rise.value === 0 ? 0 : Math.sin(rise.value * Math.PI) * 0.5,
    transform: [
      { translateY: -rise.value * height * 0.75 },
      { translateX: Math.sin(rise.value * Math.PI * 4) * 8 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 40,
          left: `${x * 100}%`,
          width: r * 2,
          height: r * 2,
          borderRadius: r,
          borderWidth: 1.2,
          borderColor: color,
        },
        style,
      ]}
    />
  );
}

/** Builds a closed sine wave path that tiles seamlessly (whole periods only). */
function wavePath(width: number, height: number, amplitude: number, periods: number) {
  const step = 8;
  let path = '';
  for (let x = 0; x <= width; x += step) {
    const y = amplitude + Math.sin((x / width) * Math.PI * 2 * periods) * amplitude;
    path += `${x === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return `${path}L${width} ${height} L0 ${height} Z`;
}

function Wave({
  width,
  height,
  amplitude,
  periods,
  duration,
  color,
  opacity,
  reverse = false,
}: {
  width: number;
  height: number;
  amplitude: number;
  periods: number;
  duration: number;
  color: string;
  opacity: number;
  reverse?: boolean;
}) {
  const active = useMotionActive();
  const offset = useSharedValue(reverse ? -width : 0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(offset);
      return;
    }
    offset.value = withRepeat(
      withTiming(reverse ? 0 : -width, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, offset, active, reverse, width]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

  return (
    <Animated.View style={[styles.wave, { width: width * 2, height }, style]}>
      <Svg width={width * 2} height={height}>
        <Path d={wavePath(width * 2, height, amplitude, periods * 2)} fill={color} fillOpacity={opacity} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Animated water canvas behind a screen: tinted gradient, drifting light
 * blobs, rising bubbles and slow waves at the bottom. Purely decorative, so
 * it ignores touches and stays still when the user prefers reduced motion.
 */
export function WaterBackground() {
  const t = useTheme();
  const window = useWindowDimensions();
  const width = Math.min(window.width, layout.maxContentWidth);
  const height = window.height;
  const c = canvas(t);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={c.gradient} locations={[0, 0.38, 0.8]} style={StyleSheet.absoluteFill} />

      {BLOBS.map((blob, index) => (
        <GlowBlob key={index} id={`water-glow-${t.scheme}-${index}`} blob={blob} width={width} height={height} color={c.glow} />
      ))}

      {BUBBLES.map((bubble, index) => (
        <Bubble key={index} {...bubble} height={height} color={c.wave} />
      ))}

      <View style={styles.waves}>
        <Wave width={width} height={90} amplitude={10} periods={2} duration={16000} color={c.wave} opacity={0.05} />
        <Wave width={width} height={70} amplitude={8} periods={3} duration={11000} color={c.wave} opacity={0.06} reverse />
        <Wave width={width} height={50} amplitude={6} periods={4} duration={8000} color={c.wave} opacity={0.07} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
  waves: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },
  wave: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});
