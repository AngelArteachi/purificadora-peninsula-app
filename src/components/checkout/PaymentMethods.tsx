import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutUp, ZoomIn } from 'react-native-reanimated';

import { PaymentCard } from '@/components/order/PaymentCard';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type PaymentMethodId = 'card' | 'cash' | 'store';

type PaymentMethod = {
  id: PaymentMethodId;
  title: string;
  subtitle: string;
  icon: IconName;
  /** Filled icon for compact pills. */
  solidIcon: IconName;
  /** Short name for the sticky footer pill. */
  short: string;
  /** What will happen with this method, shown under the list and in the summary. */
  hint: string;
  hintIcon: IconName;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'cash',
    title: 'Efectivo al recibir',
    subtitle: 'Paga al repartidor en la puerta',
    icon: 'cash-outline',
    solidIcon: 'cash',
    short: 'Efectivo',
    hint: 'Pagarás en efectivo al recibir',
    hintIcon: 'cash-outline',
  },
  {
    id: 'card',
    title: 'Tarjeta terminación 4821',
    subtitle: 'Visa crédito · guardada',
    icon: 'card-outline',
    solidIcon: 'card',
    short: 'Visa ·· 4821',
    hint: 'Se cobrará a tu tarjeta ·· 4821',
    hintIcon: 'shield-checkmark-outline',
  },
  {
    id: 'store',
    title: 'OXXO o transferencia',
    subtitle: 'Referencia válida por 24 h',
    icon: 'storefront-outline',
    solidIcon: 'storefront',
    short: 'OXXO / SPEI',
    hint: 'Referencia válida por 24 horas',
    hintIcon: 'time-outline',
  },
];

export function paymentMethod(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((method) => method.id === id) ?? PAYMENT_METHODS[0];
}

/** Radio list of payment methods; the card method previews the saved card. */
export function PaymentMethods({
  value,
  onChange,
}: {
  value: PaymentMethodId;
  onChange: (id: PaymentMethodId) => void;
}) {
  const t = useTheme();
  const styles = useStyles();
  const selected = paymentMethod(value);

  return (
    <View>
      <Card padded={false} style={styles.group}>
        <View accessibilityRole="radiogroup">
          {PAYMENT_METHODS.map((item, index) => {
            const active = value === item.id;
            return (
              <PressableScale
                key={item.id}
                haptic="light"
                scaleTo={0.99}
                accessibilityRole="radio"
                accessibilityLabel={`${item.title}. ${item.subtitle}`}
                accessibilityState={{ selected: active }}
                onPress={() => onChange(item.id)}
                style={[styles.method, index > 0 && styles.divider]}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name={item.icon} size={20} color={t.textSecondary} />
                </View>
                <View style={styles.methodCopy}>
                  <Text style={styles.methodTitle}>{item.title}</Text>
                  <Text style={styles.methodSubtitle}>{item.subtitle}</Text>
                </View>
                {active ? (
                  <Animated.View key="on" entering={ZoomIn.springify().damping(11)}>
                    <Ionicons name="checkmark-circle" size={24} color={t.primary} />
                  </Animated.View>
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={t.borderStrong} />
                )}
              </PressableScale>
            );
          })}
        </View>
      </Card>

      {value === 'card' ? (
        <Animated.View
          entering={FadeInDown.springify().damping(16)}
          exiting={FadeOutUp.duration(150)}
          style={styles.cardPreview}
        >
          <PaymentCard />
          <Text style={styles.cardHint}>Toca la tarjeta para ver el reverso</Text>
        </Animated.View>
      ) : null}

      <Animated.View key={selected.id} entering={FadeIn.duration(250)} style={styles.note}>
        <Ionicons name={selected.hintIcon} size={16} color={t.textTertiary} />
        <Text style={styles.noteText}>{selected.hint}</Text>
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  group: {
    overflow: 'hidden',
  },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  methodIcon: {
    height: 40,
    width: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  methodCopy: {
    flex: 1,
  },
  methodTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  methodSubtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  cardPreview: {
    marginTop: spacing.lg,
  },
  cardHint: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: t.textTertiary,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginLeft: 2,
  },
  noteText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textSecondary,
  },
}));
