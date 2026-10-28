import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { Button } from '@/components/ui/Button';
import { fonts, makeStyles, useTheme } from '@/theme';

type EmptyStateProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `compact` fits inside a card; `full` centers on a whole screen. */
  size?: 'compact' | 'full';
  style?: StyleProp<ViewStyle>;
};

/** Friendly "nothing here yet" state with a gently floating icon and one action. */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  size = 'full',
  style,
}: EmptyStateProps) {
  const t = useTheme();
  const styles = useStyles();
  const compact = size === 'compact';
  const active = useMotionActive();
  const float = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(float);
      return;
    }
    float.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [active, float]);

  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: float.value * -6 }] }));

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      <Animated.View entering={ZoomIn.springify().damping(14)} style={floatStyle}>
        <View style={[styles.badge, compact && styles.badgeCompact]}>
          <Ionicons name={icon} size={compact ? 26 : 36} color={t.primaryText} />
        </View>
      </Animated.View>
      <Text style={[styles.title, compact && styles.titleCompact]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          size={compact ? 'small' : 'regular'}
          variant={compact ? 'secondary' : 'primary'}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  wrapCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badge: {
    height: 84,
    width: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primarySoft,
  },
  badgeCompact: {
    height: 56,
    width: 56,
    borderRadius: 28,
  },
  title: {
    marginTop: 18,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 22,
    color: t.text,
  },
  titleCompact: {
    marginTop: 12,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  message: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: t.textSecondary,
  },
  action: {
    marginTop: 18,
  },
}));
