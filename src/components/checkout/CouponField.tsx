import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Animated, {
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { DEMO_COUPON, findCoupon, type Coupon } from '@/domain/order';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

/**
 * Discount code input. Reports the matched coupon (or `null`) upwards and
 * shows an error when the code doesn't exist.
 */
export function CouponField({
  applied,
  onChange,
}: {
  applied: Coupon | null;
  onChange: (coupon: Coupon | null) => void;
}) {
  const t = useTheme();
  const styles = useStyles();
  const [input, setInput] = useState('');
  const [invalid, setInvalid] = useState(false);
  const shake = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));

  const handleChangeText = (value: string) => {
    setInput(value);
    setInvalid(false);
    if (applied) onChange(null);
  };

  const handleApply = () => {
    const coupon = findCoupon(input);
    const wrong = coupon === null && input.trim().length > 0;
    setInvalid(wrong);
    if (wrong) {
      shake.set(
        withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withSpring(0, { damping: 12 }),
        ),
      );
    }
    onChange(coupon);
  };

  return (
    <View>
      <Animated.View
        style={[styles.field, invalid && styles.fieldInvalid, applied && styles.fieldApplied, shakeStyle]}
      >
        {applied ? (
          <Animated.View entering={ZoomIn.springify().damping(10)}>
            <Ionicons name="checkmark-circle" size={20} color={t.success} />
          </Animated.View>
        ) : (
          <Ionicons name="pricetag-outline" size={20} color={t.textTertiary} />
        )}
        <TextInput
          value={input}
          onChangeText={handleChangeText}
          onSubmitEditing={handleApply}
          placeholder="Código de descuento"
          placeholderTextColor={t.textTertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          accessibilityLabel="Código de descuento"
          style={styles.input}
          selectionColor={t.primary}
        />
        {applied ? null : (
          <PressableScale
            haptic="light"
            scaleTo={0.94}
            accessibilityRole="button"
            accessibilityLabel="Aplicar cupón"
            onPress={handleApply}
            hitSlop={8}
          >
            <Text style={styles.apply}>Aplicar</Text>
          </PressableScale>
        )}
      </Animated.View>
      {invalid ? (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={[styles.hint, styles.hintError]}
          accessibilityLiveRegion="polite"
        >
          Ese código no existe o ya expiró.
        </Animated.Text>
      ) : applied ? (
        <Animated.Text
          entering={FadeIn.duration(200)}
          style={[styles.hint, styles.hintSuccess]}
          accessibilityLiveRegion="polite"
        >
          {applied.label} aplicado.
        </Animated.Text>
      ) : (
        <Text style={styles.hint}>¿Tienes un cupón? Prueba {DEMO_COUPON}.</Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.borderStrong,
    backgroundColor: t.surface,
  },
  fieldInvalid: {
    borderColor: t.danger,
  },
  fieldApplied: {
    borderColor: t.success,
  },
  input: {
    flex: 1,
    color: t.text,
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 0.8,
    paddingVertical: 0,
  },
  apply: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.primaryText,
  },
  hint: {
    marginTop: 6,
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textTertiary,
  },
  hintError: {
    color: t.danger,
  },
  hintSuccess: {
    color: t.success,
  },
}));
