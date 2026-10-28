import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';

import { Pulse } from '@/components/motion/Pulse';
import { fonts, useTheme, type Palette } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Map coordinate space; the SVG slices to fill whatever box it is given. */
const VIEW = { width: 360, height: 640 };

type Pt = { x: number; y: number };

/** Route pinned to the street grid: store → avenue → cross street → home. */
const BASE_ROUTE: Pt[] = [
  { x: 104, y: 432 },
  { x: 104, y: 328 },
  { x: 264, y: 328 },
  { x: 264, y: 236 },
];

/** Samples a rounded corner between three points (quadratic bezier). */
function quadPoint(a: Pt, control: Pt, b: Pt, t: number): Pt {
  const v = 1 - t;
  return {
    x: v * v * a.x + 2 * v * t * control.x + t * t * b.x,
    y: v * v * a.y + 2 * v * t * control.y + t * t * b.y,
  };
}

/**
 * Converts a sharp polyline into a dense list of points with rounded corners.
 * The marker travels this exact list, so it can never drift off the line.
 */
function roundCorners(points: Pt[], radius: number, stepsPerCorner = 12): Pt[] {
  const out: Pt[] = [points[0]];
  for (let i = 1; i < points.length - 1; i += 1) {
    const previous = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];
    const inLength = Math.hypot(previous.x - corner.x, previous.y - corner.y);
    const outLength = Math.hypot(next.x - corner.x, next.y - corner.y);
    const cut = Math.min(radius, inLength / 2, outLength / 2);
    const start = {
      x: corner.x + ((previous.x - corner.x) / inLength) * cut,
      y: corner.y + ((previous.y - corner.y) / inLength) * cut,
    };
    const end = {
      x: corner.x + ((next.x - corner.x) / outLength) * cut,
      y: corner.y + ((next.y - corner.y) / outLength) * cut,
    };
    out.push(start);
    for (let step = 1; step <= stepsPerCorner; step += 1) {
      out.push(quadPoint(start, corner, end, step / stepsPerCorner));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

const ROUTE = roundCorners(BASE_ROUTE, 26);
const STORE = BASE_ROUTE[0];
const HOME = BASE_ROUTE[BASE_ROUTE.length - 1];
/** How far along the route the courier is (matches the "En camino" step). */
const COURIER_PROGRESS = 0.62;

function routeToPath(points: Pt[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`).join(' ');
}

/** Path length across the sampled points, used for the draw-in animation. */
function measure(points: Pt[]) {
  let length = 0;
  for (let i = 1; i < points.length; i += 1) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return length;
}

/** Linear position along the sampled route for a normalized 0–1 progress. */
function pointOnRoute(points: Pt[], t: number) {
  'worklet';
  const last = points.length - 1;
  const position = Math.min(0.9999, Math.max(0, t)) * last;
  const index = Math.floor(position);
  const u = position - index;
  const from = points[index];
  const to = points[Math.min(last, index + 1)];
  return {
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  };
}

const STREETS_Y = [58, 148, 238, 328, 418, 508, 596];
const AVENUES_X = [18, 104, 184, 264, 344];
/** Wider roads, drawn like main avenues. */
const MAIN_STREET = 3;
const MAIN_AVENUE = 1;

type Block = { x: number; y: number; w: number; h: number; park: boolean };

/** Deterministic city blocks between the streets, a few of them parks. */
function buildCity(): Block[] {
  const blocks: Block[] = [];
  let seed = 1337;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let row = 0; row < STREETS_Y.length - 1; row += 1) {
    for (let col = 0; col < AVENUES_X.length - 1; col += 1) {
      const gap = 6;
      blocks.push({
        x: AVENUES_X[col] + gap,
        y: STREETS_Y[row] + gap,
        w: AVENUES_X[col + 1] - AVENUES_X[col] - gap * 2,
        h: STREETS_Y[row + 1] - STREETS_Y[row] - gap * 2,
        park: random() > 0.84,
      });
    }
  }
  return blocks;
}

/** Map-app style colors for each scheme. */
function mapColors(t: Palette) {
  return t.scheme === 'dark'
    ? {
        ground: '#17212B',
        block: '#1D2934',
        park: '#1B3329',
        water: '#163049',
        road: '#2A3946',
        mainRoad: '#36495A',
        label: '#8A9BA9',
      }
    : {
        ground: '#EBEEF1',
        block: '#E2E6EA',
        park: '#CDEBD3',
        water: '#A9D3F5',
        road: '#FFFFFF',
        mainRoad: '#FFE9A8',
        label: '#5E6B76',
      };
}

/**
 * Vector stand-in for a real map, used on web where `react-native-maps` isn't
 * available: plain blocks, roads, a river, the route and the courier marker.
 */
export function MockMap() {
  const t = useTheme();
  const c = mapColors(t);
  const city = useMemo(() => buildCity(), []);
  const routePath = useMemo(() => routeToPath(ROUTE), []);
  const routeLength = useMemo(() => measure(ROUTE), []);
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // The route draws itself in, then the courier travels to its current spot.
  const draw = useSharedValue(0);
  const travel = useSharedValue(0);
  React.useEffect(() => {
    draw.value = withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) });
    travel.value = withDelay(500, withTiming(COURIER_PROGRESS, { duration: 2400, easing: Easing.out(Easing.cubic) }));
  }, [draw, travel]);

  const drawProps = useAnimatedProps(() => ({ strokeDashoffset: routeLength * (1 - draw.value) }));

  // Same slice math as the SVG, so the RN marker sits exactly on the route.
  const mapScale =
    layout.width && layout.height ? Math.max(layout.width / VIEW.width, layout.height / VIEW.height) : 1;
  const offsetX = (layout.width - VIEW.width * mapScale) / 2;
  const offsetY = (layout.height - VIEW.height * mapScale) / 2;

  const markerStyle = useAnimatedStyle(() => {
    const point = pointOnRoute(ROUTE, travel.value);
    return {
      transform: [
        { translateX: offsetX + point.x * mapScale - 28 },
        { translateY: offsetY + point.y * mapScale - 28 },
      ],
    };
  });

  const label = { fill: c.label, fontSize: 9, fontFamily: 'System', fontWeight: '600' as const };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
      }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={VIEW.width} height={VIEW.height} fill={c.ground} />

        {city.map((block, index) => (
          <Rect
            key={`block-${index}`}
            x={block.x}
            y={block.y}
            width={block.w}
            height={block.h}
            rx={3}
            fill={block.park ? c.park : c.block}
          />
        ))}

        <Path
          d="M-20 262 C60 240 96 300 168 292 C240 284 268 224 330 214 C360 209 372 218 386 214"
          stroke={c.water}
          strokeWidth={14}
          strokeLinecap="round"
          fill="none"
        />
        <Ellipse cx={176} cy={126} rx={40} ry={22} fill={c.water} />

        <G>
          {STREETS_Y.map((y, index) => (
            <Rect
              key={`street-${index}`}
              x={-10}
              y={y - (index === MAIN_STREET ? 7 : 5)}
              width={VIEW.width + 20}
              height={index === MAIN_STREET ? 14 : 10}
              fill={index === MAIN_STREET ? c.mainRoad : c.road}
            />
          ))}
          {AVENUES_X.map((x, index) => (
            <Rect
              key={`avenue-${index}`}
              x={x - (index === MAIN_AVENUE ? 7 : 5)}
              y={-10}
              width={index === MAIN_AVENUE ? 14 : 10}
              height={VIEW.height + 20}
              fill={index === MAIN_AVENUE ? c.mainRoad : c.road}
            />
          ))}
        </G>

        <G {...label}>
          <SvgText x={190} y={344}>
            Av. Universidad
          </SvgText>
          <SvgText x={96} y={600} transform="rotate(-90 96 600)">
            Calz. de Tlalpan
          </SvgText>
          <SvgText x={206} y={548} fill={t.scheme === 'dark' ? '#6FA488' : '#3C7A4E'}>
            Viveros de Coyoacán
          </SvgText>
        </G>

        {/* Route: outline + fill, like map apps draw directions */}
        <AnimatedPath
          d={routePath}
          stroke={t.scheme === 'dark' ? '#0B4E92' : '#0849A0'}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={routeLength}
          animatedProps={drawProps}
        />
        <AnimatedPath
          d={routePath}
          stroke={t.primary}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={routeLength}
          animatedProps={drawProps}
        />

        {/* Store */}
        <Circle cx={STORE.x} cy={STORE.y} r={9} fill={t.surface} stroke={t.primary} strokeWidth={3} />

      </Svg>

      {/* Customer pin, with a slow pulse so it reads as the destination */}
      <Pulse
        color={t.danger}
        size={44}
        rings={1}
        duration={2200}
        style={[
          styles.pin,
          { left: offsetX + HOME.x * mapScale - 22, top: offsetY + HOME.y * mapScale - 22 },
        ]}
      >
        <View style={[styles.pinDot, { backgroundColor: t.danger, borderColor: t.surface }]} />
      </Pulse>

      <Animated.View pointerEvents="none" style={[styles.marker, markerStyle]}>
        <Pulse color={t.primary} size={56}>
          <View style={[styles.markerBody, { backgroundColor: t.text, borderColor: t.surface }]}>
            <Text style={[styles.markerText, { color: t.surface }]}>CR</Text>
          </View>
        </Pulse>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 56,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    position: 'absolute',
  },
  pinDot: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  markerBody: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    boxShadow: '0px 2px 6px rgba(0,0,0,0.3)',
  },
  markerText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
