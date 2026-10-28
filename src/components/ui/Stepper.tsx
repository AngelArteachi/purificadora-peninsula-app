import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeOutDown, FadeOutUp } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

type StepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** Product name, so screen readers say "Agregar Garrafón purificado". */
  itemLabel?: string;
  /** `compact` is a soft tinted pill that fits inside a product card footer. */
  size?: 'regular' | 'compact';
  style?: StyleProp<ViewStyle>;
};

/** Quantity control: muted track, primary "+"; the number rolls up or down as it changes. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  itemLabel,
  size = 'regular',
  style,
}: StepperProps) {
  const t = useTheme();
  const styles = useStyles();
  const compact = size === 'compact';
  const iconSize = compact ? 16 : 18;
  const atMin = value <= min;
  const atMax = value >= max;
  const suffix = itemLabel ? ` ${itemLabel}` : '';

  // Remember the previous value to roll the digit in the direction of change.
  const [previous, setPrevious] = useState(value);
  const [increased, setIncreased] = useState(true);
  if (value !== previous) {
    setPrevious(value);
    setIncreased(value > previous);
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      <PressableScale
        haptic="light"
        scaleTo={0.88}
        accessibilityRole="button"
        accessibilityLabel={`Quitar uno${suffix}`}
        disabled={atMin}
        onPress={() => onChange(value - 1)}
        hitSlop={4}
        style={[styles.button, compact && styles.buttonCompact, atMin && styles.idle]}
      >
        <Ionicons name="remove" size={iconSize} color={compact ? t.primaryText : t.text} />
      </PressableScale>

      <View style={[styles.valueWrap, compact && styles.valueWrapCompact]} accessibilityLabel={`${value} en el pedido`}>
        <Animated.Text
          key={value}
          entering={(increased ? FadeInUp : FadeInDown).duration(180)}
          exiting={(increased ? FadeOutUp : FadeOutDown).duration(140)}
          style={[styles.value, compact && styles.valueCompact]}
        >
          {value}
        </Animated.Text>
      </View>

      <PressableScale
        haptic="light"
        scaleTo={0.88}
        accessibilityRole="button"
        accessibilityLabel={`Agregar uno${suffix}`}
        disabled={atMax}
        onPress={() => onChange(value + 1)}
        hitSlop={4}
        style={[styles.button, compact ? styles.buttonCompact : styles.add, atMax && styles.idle]}
      >
        <Ionicons name="add" size={iconSize} color={compact ? t.primaryText : t.onPrimary} />
      </PressableScale>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: t.surfaceMuted,
    borderRadius: radius.pill,
    padding: 3,
  },
  wrapCompact: {
    padding: 2,
    backgroundColor: t.primarySoft,
  },
  button: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCompact: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  add: {
    backgroundColor: t.primary,
  },
  idle: {
    opacity: 0.35,
  },
  valueWrap: {
    minWidth: 30,
    height: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrapCompact: {
    minWidth: 20,
  },
  value: {
    position: 'absolute',
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
    fontVariant: ['tabular-nums'],
  },
  valueCompact: {
    fontSize: 14,
    color: t.primaryText,
  },
}));
