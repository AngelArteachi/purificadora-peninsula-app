import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { useTheme, type Palette } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * 20 L garrafón silhouette in a 120×160 box: short neck, rounded shoulders and
 * a tall straight body with softly rounded base, like the PET jugs delivered
 * door to door.
 */
const BODY =
  'M50 24 C39 26 27 33 25 48 L25 143 Q25 154 36 154 L84 154 Q95 154 95 143 L95 48 C93 33 81 26 70 24 Z';

/** Horizontal reinforcement rings moulded into the body. */
const RINGS = [64, 92, 120];

/** Water surface limits inside the box (also used to align the level scale). */
export const JUG_VIEWBOX_HEIGHT = 160;
export const JUG_EMPTY_Y = 152;
export const JUG_FULL_Y = 44;
const LEFT = 22;
const RIGHT = 98;

/** Closed path for a water body whose surface is a moving sine wave. */
function wavePath(surface: number, phase: number, amplitude: number) {
  'worklet';
  let d = `M${LEFT} 160 L${LEFT} ${surface.toFixed(2)}`;
  for (let x = LEFT; x <= RIGHT; x += 4) {
    const y = surface + Math.sin(((x - LEFT) / (RIGHT - LEFT)) * Math.PI * 3 + phase) * amplitude;
    d += ` L${x} ${y.toFixed(2)}`;
  }
  return `${d} L${RIGHT} 160 Z`;
}

/** Jug colors per scheme: light sits on a pale card, dark on a deep-blue one. */
function jugColors(t: Palette) {
  return t.scheme === 'dark'
    ? {
        outline: 'rgba(255,255,255,0.78)',
        glass: 'rgba(255,255,255,0.07)',
        glassEdge: 'rgba(255,255,255,0.26)',
        ring: 'rgba(255,255,255,0.22)',
        highlight: 'rgba(255,255,255,0.30)',
        water: ['#E6FBFF', '#9BE7FF', '#3FC2F2'] as const,
        backWater: '#BFF1FF',
        cap: '#FFFFFF',
        capRidge: 'rgba(11,107,211,0.22)',
        bubble: 'rgba(255,255,255,0.85)',
      }
    : {
        outline: 'rgba(11,107,211,0.55)',
        glass: 'rgba(11,107,211,0.05)',
        glassEdge: 'rgba(255,255,255,0.85)',
        ring: 'rgba(11,107,211,0.20)',
        highlight: 'rgba(255,255,255,0.75)',
        water: ['#B8E4FF', '#5DB4F7', '#0B6BD3'] as const,
        backWater: '#8CCBFF',
        cap: '#0B6BD3',
        capRidge: 'rgba(255,255,255,0.35)',
        bubble: 'rgba(255,255,255,0.9)',
      };
}

/** A bubble that rises from the bottom to the current water surface. */
function Bubble({
  x,
  r,
  duration,
  delay,
  surface,
  color,
}: {
  x: number;
  r: number;
  duration: number;
  delay: number;
  surface: SharedValue<number>;
  color: string;
}) {
  const rise = useSharedValue(0);
  useEffect(() => {
    rise.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.in(Easing.quad) }), -1, false));
  }, [delay, duration, rise]);

  const props = useAnimatedProps(() => {
    const top = surface.value + 6;
    return {
      cy: 148 - (148 - top) * rise.value,
      cx: x + Math.sin(rise.value * Math.PI * 3) * 2,
      opacity: top < 146 ? 0.85 * (1 - rise.value * 0.6) : 0,
    };
  });

  return <AnimatedCircle r={r} fill={color} animatedProps={props} />;
}

type LoyaltyJugProps = {
  /** Fill level, 0–1. Changes animate with a spring, like water sloshing in. */
  level: number;
  height?: number;
};

/**
 * The Club Hidra garrafón: a 20 L jug whose water rises with every purchase,
 * with two out-of-phase waves on the surface and bubbles drifting up.
 */
export function LoyaltyJug({ level, height = 132 }: LoyaltyJugProps) {
  const t = useTheme();
  const c = jugColors(t);
  // SVG ids are global on web; keep each scheme's gradients separate.
  const id = (name: string) => `jug-${name}-${t.scheme}`;

  const active = useMotionActive();
  const surface = useSharedValue(JUG_EMPTY_Y);
  const phase = useSharedValue(0);
  const slosh = useSharedValue(0);

  const target = JUG_EMPTY_Y + (JUG_FULL_Y - JUG_EMPTY_Y) * Math.max(0, Math.min(1, level));

  useEffect(() => {
    surface.value = withDelay(250, withSpring(target, { damping: 14, stiffness: 60, mass: 1.2 }));
    // A taller wave right after the level changes, settling back to a ripple.
    slosh.value = 1;
    slosh.value = withDelay(250, withTiming(0, { duration: 2200, easing: Easing.out(Easing.quad) }));
  }, [slosh, surface, target]);

  useEffect(() => {
    if (!active) {
      cancelAnimation(phase);
      return;
    }
    phase.value = withRepeat(withTiming(Math.PI * 2, { duration: 2600, easing: Easing.linear }), -1, false);
  }, [phase, active]);

  const backWave = useAnimatedProps(() => ({
    d: wavePath(surface.value - 2, -phase.value + 1.2, 2.5 + slosh.value * 5),
  }));
  const frontWave = useAnimatedProps(() => ({
    d: wavePath(surface.value, phase.value, 2 + slosh.value * 6),
  }));

  const width = (height / JUG_VIEWBOX_HEIGHT) * 120;

  return (
    <View style={{ width, height }}>
      <Svg width="100%" height="100%" viewBox="0 0 120 160">
        <Defs>
          <LinearGradient id={id('water')} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.water[0]} />
            <Stop offset="0.35" stopColor={c.water[1]} />
            <Stop offset="1" stopColor={c.water[2]} />
          </LinearGradient>
          <LinearGradient id={id('glass')} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={c.glassEdge} />
            <Stop offset="0.22" stopColor="rgba(255,255,255,0)" />
            <Stop offset="0.8" stopColor="rgba(255,255,255,0)" />
            <Stop offset="1" stopColor={c.glassEdge} stopOpacity={0.6} />
          </LinearGradient>
          <ClipPath id={id('body')}>
            <Path d={BODY} />
          </ClipPath>
        </Defs>

        {/* Moulded handle on the shoulder, behind the body */}
        <Path
          d="M70 21 C86 17 97 26 92 40"
          fill="none"
          stroke={c.outline}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <Path d="M71 22 C84 19 92 27 89 37" fill="none" stroke={c.glass} strokeWidth={2} strokeLinecap="round" />

        {/* Glass body */}
        <Path d={BODY} fill={c.glass} />

        <G clipPath={`url(#${id('body')})`}>
          <AnimatedPath fill={c.backWater} fillOpacity={0.5} animatedProps={backWave} />
          <AnimatedPath fill={`url(#${id('water')})`} animatedProps={frontWave} />
          {!active ? null : (
            <>
              <Bubble x={44} r={2.6} duration={2600} delay={0} surface={surface} color={c.bubble} />
              <Bubble x={62} r={1.8} duration={2100} delay={900} surface={surface} color={c.bubble} />
              <Bubble x={78} r={2.2} duration={2900} delay={1600} surface={surface} color={c.bubble} />
            </>
          )}
          {/* Reinforcement rings: a groove line with a light lip under it */}
          {RINGS.map((y) => (
            <G key={y}>
              <Path d={`M20 ${y} Q60 ${y + 5} 100 ${y}`} fill="none" stroke={c.ring} strokeWidth={2.4} />
              <Path d={`M20 ${y + 3} Q60 ${y + 8} 100 ${y + 3}`} fill="none" stroke={c.highlight} strokeWidth={1} strokeOpacity={0.5} />
            </G>
          ))}
          {/* Vertical highlight down the left side + shoulder glint */}
          <Rect x={31} y={50} width={6} height={94} rx={3} fill={c.highlight} />
          <Path d="M36 38 C42 32 48 29 54 28" fill="none" stroke={c.highlight} strokeWidth={3} strokeLinecap="round" />
        </G>

        <Path d={BODY} fill={`url(#${id('glass')})`} />
        <Path d={BODY} fill="none" stroke={c.outline} strokeWidth={2.2} strokeLinejoin="round" />

        {/* Neck with collar ring */}
        <Rect x={50} y={13} width={20} height={12} rx={2} fill={c.glass} stroke={c.outline} strokeWidth={1.6} />
        <Rect x={46} y={19} width={28} height={4} rx={2} fill={c.outline} />

        {/* Ridged cap */}
        <Rect x={46} y={2} width={28} height={13} rx={3.5} fill={c.cap} />
        {[51, 56, 61, 66].map((x) => (
          <Rect key={x} x={x} y={4} width={1.6} height={9} rx={0.8} fill={c.capRidge} />
        ))}
      </Svg>
    </View>
  );
}
