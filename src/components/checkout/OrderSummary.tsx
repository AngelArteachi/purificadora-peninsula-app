import React from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInLeft, FadeOut, LinearTransition } from 'react-native-reanimated';

import { CountUpMoney } from '@/components/motion/CountUp';
import { Card } from '@/components/ui/Card';
import { formatMoney } from '@/domain/money';
import type { cartTotals } from '@/domain/order';
import { fonts, makeStyles } from '@/theme';

type Totals = ReturnType<typeof cartTotals>;

/** Price breakdown: products, shipping, discounts and the final total. */
export function OrderSummary({
  totals,
  couponLabel,
  note,
  style,
}: {
  totals: Totals;
  couponLabel?: string;
  note: string;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <Card style={style}>
      <SummaryRow label={`Productos (${totals.items})`} value={formatMoney(totals.subtotal)} />
      <SummaryRow label="Envío" value={formatMoney(totals.shipping)} />
      {totals.couponDiscount > 0 ? (
        <SummaryRow label={couponLabel ?? 'Cupón'} value={`-${formatMoney(totals.couponDiscount)}`} discount />
      ) : null}
      {totals.reward > 0 ? (
        <SummaryRow label="Garrafón gratis · Club Hidra" value={`-${formatMoney(totals.reward)}`} discount />
      ) : null}

      <Animated.View layout={LinearTransition.springify().damping(18)} style={styles.divider} />

      <Animated.View layout={LinearTransition.springify().damping(18)} style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <CountUpMoney value={totals.total} style={styles.totalValue} />
      </Animated.View>

      <Animated.Text layout={LinearTransition.springify().damping(18)} style={styles.note}>
        Precios en MXN · {note}
      </Animated.Text>
    </Card>
  );
}

function SummaryRow({ label, value, discount = false }: { label: string; value: string; discount?: boolean }) {
  const styles = useStyles();
  return (
    <Animated.View
      entering={discount ? FadeInLeft.springify().damping(16) : undefined}
      exiting={discount ? FadeOut.duration(150) : undefined}
      layout={LinearTransition.springify().damping(18)}
      style={styles.row}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, discount && styles.discount]}>{value}</Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: t.textSecondary,
  },
  value: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  discount: {
    color: t.success,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: t.borderStrong,
    marginTop: 4,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: t.text,
  },
  totalValue: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: t.text,
    fontVariant: ['tabular-nums'],
  },
  note: {
    marginTop: 10,
    fontFamily: fonts.regular,
    fontSize: 12,
    color: t.textTertiary,
  },
}));
