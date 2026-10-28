import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { fonts, useTheme } from '@/theme';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type GarrafonVariant = 'purificada' | 'alcalina' | 'bomba' | 'hielo';

type VariantTheme = {
  cap: string;
  water: [string, string];
  /** How full the bottle looks, 0–1. */
  level: number;
  label: string;
};

const THEMES: Record<GarrafonVariant, VariantTheme> = {
  purificada: {
    cap: '#1E7FE0',
    water: ['rgba(120,200,255,0.95)', 'rgba(30,128,228,0.9)'],
    level: 0.66,
    label: '20 L',
  },
  alcalina: {
    cap: '#2BA88A',
    water: ['rgba(140,228,206,0.95)', 'rgba(32,160,170,0.88)'],
    level: 0.8,
    label: '20 L',
  },
  bomba: {
    cap: '#1E7FE0',
    water: ['rgba(120,200,255,0.95)', 'rgba(30,128,228,0.9)'],
    level: 0.56,
    label: '19 L',
  },
  hielo: {
    cap: '#BFEFFF',
    water: ['rgba(220,250,255,0.9)', 'rgba(140,205,255,0.5)'],
    level: 0.72,
    label: '5 kg',
  },
};

/** Reusable 20 L garrafón silhouette. */
export const GARRAFON_BODY_PATH =
  'M26 116 C26 130 34 142 48 145 L72 145 C86 142 94 130 94 116 L94 52 C94 45 91 41 85 37 L74 27 L74 19 L46 19 L46 27 L35 37 C29 41 26 45 26 52 Z';

const EMPTY_Y = 150;
const FULL_Y = 34;

const ICE_CUBES = [
  { x: 34, y: 46, r: -12 },
  { x: 62, y: 40, r: 9 },
  { x: 40, y: 74, r: 15 },
  { x: 68, y: 82, r: -7 },
  { x: 34, y: 104, r: 5 },
  { x: 64, y: 110, r: -15 },
];

type GarrafonArtProps = {
  variant?: GarrafonVariant;
  /** Rendered height in px; the art keeps a 120x160 aspect ratio. */
  height?: number;
  /** Staggers the rise-in animation between cards. */
  delay?: number;
  /** Overrides the water level, 0–1. Used by the loyalty card. */
  level?: number;
  /** Overrides the printed volume; pass `null` to hide it. */
  label?: string | null;
};

/**
 * Hand-drawn garrafón illustration. Pure vector: gradient water that rises on
 * mount, drifting bubbles, a product-specific cap and an optional pump.
 */
export function GarrafonArt({
  variant = 'purificada',
  height = 132,
  delay = 0,
  level,
  label,
}: GarrafonArtProps) {
  const t = useTheme();
  // On a light canvas the glass needs a tinted outline instead of a white rim.
  const outline = t.scheme === 'dark' ? 'rgba(255,255,255,0.44)' : 'rgba(20,80,140,0.28)';
  const glassTint = t.scheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(30,128,228,0.06)';
  const theme = THEMES[variant];
  const isIce = variant === 'hielo';
  const waterLevel = useSharedValue(isIce ? FULL_Y + 20 : EMPTY_Y);
  const pulse = useSharedValue(0);

  const clampedLevel = level === undefined ? theme.level : Math.max(0, Math.min(1, level));
  const targetY = EMPTY_Y + (FULL_Y - EMPTY_Y) * clampedLevel;
  const printedLabel = label === undefined ? theme.label : label;

  useEffect(() => {
    waterLevel.value = withDelay(
      160 + delay,
      withTiming(isIce ? FULL_Y + 20 : targetY, { duration: 1400, easing: Easing.out(Easing.cubic) }),
    );
  }, [delay, isIce, targetY, waterLevel]);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);

  const waterProps = useAnimatedProps(() => ({
    y: waterLevel.value,
    height: Math.max(0, 152 - waterLevel.value),
  }));

  const bubbleProps = useAnimatedProps(() => ({
    cy: 132 - pulse.value * 34,
    opacity: 0.14 + pulse.value * 0.42,
  }));

  const iceProps = useAnimatedProps(() => ({
    opacity: 0.35 + pulse.value * 0.3,
  }));

  const width = (height / 160) * 120;

  return (
    <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width="100%" height="100%" viewBox="0 0 120 160">
        <Defs>
          <SvgGradient id={`water-${variant}`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={theme.water[0]} />
            <Stop offset="1" stopColor={theme.water[1]} />
          </SvgGradient>
          <SvgGradient id={`glass-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="rgba(255,255,255,0.26)" />
            <Stop offset="0.45" stopColor="rgba(255,255,255,0.05)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0.16)" />
          </SvgGradient>
          <ClipPath id={`body-${variant}`}>
            <Path d={GARRAFON_BODY_PATH} />
          </ClipPath>
        </Defs>

        <G clipPath={`url(#body-${variant})`}>
          <Rect x={22} y={16} width={76} height={140} fill={glassTint} />

          {isIce ? (
            <G>
              {ICE_CUBES.map((cube, index) => (
                <Rect
                  key={index}
                  x={cube.x}
                  y={cube.y}
                  width={26}
                  height={24}
                  rx={7}
                  fill="rgba(214,246,255,0.55)"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth={1.2}
                  transform={`rotate(${cube.r} ${cube.x + 13} ${cube.y + 12})`}
                />
              ))}
            </G>
          ) : (
            <>
              <AnimatedRect x={22} width={76} fill={`url(#water-${variant})`} animatedProps={waterProps} />
              <AnimatedCircle cx={44} r={3} fill="rgba(255,255,255,0.75)" animatedProps={bubbleProps} />
              <AnimatedCircle cx={70} r={2} fill="rgba(255,255,255,0.6)" animatedProps={bubbleProps} />
            </>
          )}

          {/* Ribs and rim light of a reusable garrafón */}
          {[38, 58, 78].map((x) => (
            <Rect key={x} x={x} y={20} width={3} height={140} rx={1.5} fill="rgba(255,255,255,0.10)" />
          ))}
          <Rect x={32} y={20} width={9} height={140} rx={4.5} fill="rgba(255,255,255,0.18)" />
        </G>

        <Path d={GARRAFON_BODY_PATH} fill={`url(#glass-${variant})`} />
        <Path d={GARRAFON_BODY_PATH} fill="none" stroke={outline} strokeWidth={2} strokeLinejoin="round" />

        {/* Neck + cap */}
        <Rect x={44} y={12} width={32} height={14} rx={4} fill={outline} />
        <Rect x={40} y={4} width={40} height={13} rx={5} fill={theme.cap} />
        <Rect x={40} y={4} width={40} height={5} rx={2.5} fill="rgba(255,255,255,0.32)" />

        {/* Manual pump accessory */}
        {variant === 'bomba' ? (
          <G>
            <Rect x={86} y={30} width={26} height={7} rx={3.5} fill="#2B3A48" />
            <Rect x={104} y={28} width={12} height={52} rx={5} fill={outline} />
            <Circle cx={110} cy={86} r={6} fill="#2B3A48" />
          </G>
        ) : null}

        {isIce ? <AnimatedRect x={28} y={50} width={64} height={90} rx={16} fill="rgba(255,255,255,0.05)" animatedProps={iceProps} /> : null}
      </Svg>

      {printedLabel ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: height * 0.6 }}>
          <Text
            style={{
              fontFamily: fonts.bold,
              fontSize: Math.max(10, height * 0.085),
              letterSpacing: 1.4,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {printedLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
