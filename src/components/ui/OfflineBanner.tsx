import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOnline } from '@/hooks/useIsOnline';
import { fonts, makeStyles, radius } from '@/theme';

/** Floating notice that slides down from the top while the device is offline. */
export function OfflineBanner() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const online = useIsOnline();

  if (online) return null;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(16)}
      exiting={SlideOutUp.duration(220)}
      pointerEvents="none"
      style={[styles.banner, { top: insets.top + 8 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
      <Text style={styles.text}>Sin conexión. Revisa tu internet para hacer pedidos.</Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  banner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.lg,
    backgroundColor: t.scheme === 'dark' ? '#3A2430' : '#2B3440',
    boxShadow: '0px 6px 20px rgba(0,0,0,0.25)',
  },
  text: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
}));
