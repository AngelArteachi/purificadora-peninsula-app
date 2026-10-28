import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticStrength = 'none' | 'light' | 'medium' | 'heavy' | 'success';

function fireHaptic(strength: HapticStrength) {
  if (Platform.OS === 'web' || strength === 'none') return;
  switch (strength) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      break;
  }
}

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far the element compresses while pressed. */
  scaleTo?: number;
  haptic?: HapticStrength;
  children?: React.ReactNode;
};

/**
 * The tactile building block of the app: every tappable surface springs
 * slightly under the finger and fires a matching haptic on device.
 */
export function PressableScale({
  style,
  scaleTo = 0.965,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  // Scale only: animating opacity here would override a caller's own opacity
  // (e.g. a disabled button's dimmed style).
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (event) => {
      scale.set(withSpring(scaleTo, { damping: 20, stiffness: 340, mass: 0.6 }));
      onPressIn?.(event);
    },
    [onPressIn, scale, scaleTo],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (event) => {
      scale.set(withSpring(1, { damping: 14, stiffness: 220, mass: 0.5 }));
      onPressOut?.(event);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (event) => {
      fireHaptic(haptic);
      onPress?.(event);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}

type IconButtonProps = {
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  color?: string;
  /** `surface` sits on the canvas; `floating` adds a shadow for use over the map. */
  variant?: 'surface' | 'floating' | 'primary';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
};

/** 44pt circular action used on headers, cards and the map. */
export function IconButton({
  name,
  size = 20,
  color,
  variant = 'surface',
  onPress,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const t = useTheme();
  const isPrimary = variant === 'primary';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      haptic="light"
      scaleTo={0.9}
      style={[
        {
          height: 44,
          width: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? t.primary : t.surface,
          borderWidth: isPrimary || t.scheme === 'light' ? 0 : 1,
          borderColor: t.border,
          boxShadow: variant === 'floating' ? '0px 2px 10px rgba(0,0,0,0.16)' : t.cardShadow,
        },
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color ?? (isPrimary ? t.onPrimary : t.text)} />
    </PressableScale>
  );
}
