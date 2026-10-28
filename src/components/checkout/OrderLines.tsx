import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOutLeft, LinearTransition } from 'react-native-reanimated';

import { ProductImage } from '@/components/order/ProductImage';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Stepper } from '@/components/ui/Stepper';
import { formatMoney } from '@/domain/money';
import type { CartLine } from '@/domain/order';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

type OrderLinesProps = {
  lines: CartLine[];
  onChangeQuantity: (productId: string, quantity: number) => void;
  onAddMore: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Editable cart lines for checkout, with an empty state and "add more". */
export function OrderLines({ lines, onChangeQuantity, onAddMore, style }: OrderLinesProps) {
  const t = useTheme();
  const styles = useStyles();

  return (
    <Card padded={false} style={style}>
      {lines.length === 0 ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.empty}>
          <Ionicons name="water-outline" size={28} color={t.textTertiary} />
          <Text style={styles.emptyTitle}>Tu pedido está vacío</Text>
          <Text style={styles.emptyCopy}>Agrega un garrafón para continuar.</Text>
        </Animated.View>
      ) : (
        lines.map((line, index) => (
          <Animated.View
            key={line.product.id}
            layout={LinearTransition.springify().damping(18)}
            exiting={FadeOutLeft.duration(200)}
            style={[styles.line, index > 0 && styles.divider]}
          >
            <ProductImage product={line.product} height={64} style={styles.thumb} />
            <View style={styles.lineBody}>
              <View style={styles.lineTop}>
                <Text style={styles.lineName} numberOfLines={1}>
                  {line.product.name}
                </Text>
                <Text style={styles.lineTotal}>{formatMoney(line.quantity * line.product.price)}</Text>
              </View>
              <Text style={styles.lineMeta}>{formatMoney(line.product.price)} c/u</Text>
              <Stepper
                value={line.quantity}
                onChange={(quantity) => onChangeQuantity(line.product.id, quantity)}
                itemLabel={line.product.name}
                style={styles.stepper}
              />
            </View>
          </Animated.View>
        ))
      )}

      <Animated.View layout={LinearTransition.springify().damping(18)}>
        <PressableScale
          haptic="light"
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel="Agregar más productos"
          onPress={onAddMore}
          style={[styles.addMore, styles.divider]}
        >
          <Ionicons name="add-circle-outline" size={20} color={t.primaryText} />
          <Text style={styles.addMoreText}>Agregar más productos</Text>
        </PressableScale>
      </Animated.View>
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  line: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  thumb: {
    width: 64,
    borderRadius: radius.md,
  },
  lineBody: {
    flex: 1,
  },
  lineTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  lineName: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  lineTotal: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
  },
  lineMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  stepper: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  addMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  addMoreText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.primaryText,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    marginTop: 8,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
  },
  emptyCopy: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
}));
