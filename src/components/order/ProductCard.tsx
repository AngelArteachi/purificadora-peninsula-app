import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  ZoomIn,
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ProductImage } from '@/components/order/ProductImage';
import { PressableScale } from '@/components/ui/PressableScale';
import { Stepper } from '@/components/ui/Stepper';
import type { Product } from '@/data/catalog';
import { formatMoney } from '@/domain/money';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

type ProductCardProps = {
  product: Product;
  quantity: number;
  onChange: (quantity: number) => void;
};

const MEDIA_HEIGHT = 132;

/**
 * Catalogue tile: an inset photo with rounded corners, name and size, and a
 * footer where the price sits next to a soft "+" that turns into a stepper.
 */
export function ProductCard({ product, quantity, onChange }: ProductCardProps) {
  const t = useTheme();
  const styles = useStyles();
  const inCart = quantity > 0;

  // The tile gives a small "got it" bounce each time an item is added.
  const bounce = useSharedValue(1);
  const lastQuantity = useRef(quantity);
  useEffect(() => {
    if (quantity > lastQuantity.current) {
      bounce.value = withSequence(withTiming(1.03, { duration: 110 }), withSpring(1, { damping: 11, stiffness: 240 }));
    }
    lastQuantity.current = quantity;
  }, [bounce, quantity]);
  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));

  return (
    <Animated.View style={[styles.card, bounceStyle]}>
      <View style={styles.media}>
        <ProductImage product={product} height={MEDIA_HEIGHT} />
        {product.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}
        {inCart ? (
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            exiting={ZoomOut.duration(140)}
            style={styles.count}
            accessibilityLabel={`${quantity} en tu pedido`}
          >
            <Text style={styles.countText}>{quantity}</Text>
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {product.tagline.split(' · ')[0]}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>{formatMoney(product.price)}</Text>
          {inCart ? (
            <Animated.View key="stepper" entering={ZoomIn.springify().damping(15)} exiting={ZoomOut.duration(120)}>
              <Stepper size="compact" value={quantity} onChange={onChange} itemLabel={product.name} />
            </Animated.View>
          ) : (
            <Animated.View key="add" entering={ZoomIn.springify().damping(14)} exiting={ZoomOut.duration(120)}>
              <PressableScale
                haptic="light"
                scaleTo={0.88}
                accessibilityRole="button"
                accessibilityLabel={`Agregar ${product.name}`}
                onPress={() => onChange(1)}
                hitSlop={8}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color={t.primaryText} />
              </PressableScale>
            </Animated.View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    flex: 1,
    padding: 6,
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
    boxShadow: t.cardShadow,
  },
  media: {
    height: MEDIA_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: t.success,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: t.onPrimary,
  },
  count: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primary,
    borderWidth: 2,
    borderColor: t.surface,
  },
  countText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: t.onPrimary,
  },
  body: {
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 6,
  },
  name: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  meta: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textTertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginTop: 10,
    height: 34,
  },
  price: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
  },
  addButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primarySoft,
  },
}));
