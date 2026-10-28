import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { CountUpMoney } from '@/components/motion/CountUp';
import { PressableScale, type HapticStrength } from '@/components/ui/PressableScale';
import { MAX_FONT_SCALE, fonts, makeStyles, radius, useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Trailing content, e.g. the total on a checkout button. */
  trailing?: string;
  /** Trailing money amount that counts up/down when it changes. */
  trailingAmount?: number;
  variant?: Variant;
  size?: 'regular' | 'small';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: HapticStrength;
  accessibilityLabel?: string;
};

/** Solid action button. One primary per screen; secondary/ghost for the rest. */
export function Button({
  label,
  onPress,
  icon,
  trailing,
  trailingAmount,
  variant = 'primary',
  size = 'regular',
  loading = false,
  disabled = false,
  style,
  haptic = 'medium',
  accessibilityLabel,
}: ButtonProps) {
  const t = useTheme();
  const styles = useStyles();
  const isDisabled = disabled || loading;
  const foreground = variant === 'primary' ? t.onPrimary : t.primaryText;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={isDisabled ? undefined : onPress}
      haptic={isDisabled ? 'none' : haptic}
      scaleTo={0.98}
      style={[
        styles.base,
        size === 'small' && styles.small,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={size === 'small' ? 16 : 18} color={foreground} /> : null}
          <Text
            maxFontSizeMultiplier={MAX_FONT_SCALE}
            style={[styles.label, size === 'small' && styles.labelSmall, { color: foreground }]}
          >
            {label}
          </Text>
          {trailing ? (
            <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.trailing, { color: foreground }]}>
              {trailing}
            </Text>
          ) : null}
          {trailingAmount !== undefined ? (
            <CountUpMoney value={trailingAmount} style={[styles.trailing, { color: foreground }]} />
          ) : null}
        </View>
      )}
    </PressableScale>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    height: 54,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  primary: {
    backgroundColor: t.primary,
  },
  secondary: {
    backgroundColor: t.primarySoft,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  labelSmall: {
    fontSize: 14,
  },
  trailing: {
    marginLeft: 6,
    fontFamily: fonts.bold,
    fontSize: 16,
    opacity: 0.9,
    fontVariant: ['tabular-nums'],
  },
}));
