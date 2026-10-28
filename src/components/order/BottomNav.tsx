import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { MAX_FONT_SCALE, fonts, makeStyles, radius, useTheme } from '@/theme';

type Tab = {
  /** Route name inside `(tabs)`, or `null` for a tab that pushes a stack screen. */
  route: string | null;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
};

const TABS: Tab[] = [
  { route: 'index', label: 'Inicio', icon: 'home-outline', activeIcon: 'home' },
  { route: 'pedidos', label: 'Pedidos', icon: 'receipt-outline', activeIcon: 'receipt' },
  // Tracking is a full-screen map, so it lives in the root stack above the tabs.
  { route: null, label: 'Rastreo', icon: 'navigate-outline', activeIcon: 'navigate' },
  { route: 'perfil', label: 'Perfil', icon: 'person-outline', activeIcon: 'person' },
];

const BAR_HEIGHT = 60;
const INDICATOR_WIDTH = 56;

function bottomPadding(insetBottom: number) {
  return Math.max(insetBottom, 8);
}

/** Space a tab screen must leave at the bottom so content clears the bar. */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return BAR_HEIGHT + bottomPadding(insets.bottom);
}

/** Icon + label that bounce when the tab becomes active. */
function TabItem({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
  const t = useTheme();
  const styles = useStyles();
  const bounce = useSharedValue(1);
  const color = active ? t.primary : t.textTertiary;

  useEffect(() => {
    if (!active) return;
    bounce.value = withSequence(withTiming(0.82, { duration: 90 }), withSpring(1, { damping: 9, stiffness: 260 }));
  }, [active, bounce]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bounce.value }, { translateY: (1 - bounce.value) * 10 }],
  }));

  return (
    <PressableScale
      haptic="light"
      scaleTo={0.9}
      onPress={onPress}
      style={styles.tab}
      accessibilityRole={tab.route === null ? 'button' : 'tab'}
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: active }}
    >
      <Animated.View style={iconStyle}>
        <Ionicons name={active ? tab.activeIcon : tab.icon} size={24} color={color} />
      </Animated.View>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.label, { color }]}>
        {tab.label}
      </Text>
    </PressableScale>
  );
}

/** Docked tab bar with a pill that slides to the active tab. */
export function BottomNav({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const t = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;
  const activeIndex = Math.max(0, TABS.findIndex((tab) => tab.route === activeRoute));
  const [rowWidth, setRowWidth] = useState(0);
  const slot = rowWidth / TABS.length;
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    if (!slot) return;
    indicatorX.value = withSpring(slot * activeIndex + (slot - INDICATOR_WIDTH) / 2, {
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    });
  }, [activeIndex, indicatorX, slot]);

  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }));

  const handlePress = (tab: Tab) => {
    if (tab.route === null) {
      router.push('/seguimiento');
      return;
    }

    const route = state.routes.find((item) => item.name === tab.route);
    if (!route) return;

    const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (tab.route !== activeRoute && !event.defaultPrevented) {
      navigateToTab(route.key);
    }
  };

  return (
    <View style={[styles.host, { paddingBottom: bottomPadding(insets.bottom) }]}>
      <BlurView intensity={50} tint={t.scheme === 'dark' ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.chrome]} />
      <View
        style={styles.row}
        accessibilityRole="tablist"
        onLayout={(event: LayoutChangeEvent) => setRowWidth(event.nativeEvent.layout.width)}
      >
        {slot ? <Animated.View style={[styles.indicator, indicatorStyle]} /> : null}
        {TABS.map((tab) => (
          <TabItem
            key={tab.label}
            tab={tab}
            active={tab.route !== null && tab.route === activeRoute}
            onPress={() => handlePress(tab)}
          />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.borderStrong,
    overflow: 'hidden',
  },
  chrome: {
    backgroundColor: t.chrome,
  },
  row: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 6,
    left: 0,
    width: INDICATOR_WIDTH,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: t.primarySoft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
}));
