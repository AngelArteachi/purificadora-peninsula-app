import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { ProductImage } from '@/components/order/ProductImage';
import { PressableScale } from '@/components/ui/PressableScale';
import type { Product } from '@/data/catalog';
import { formatMoney } from '@/domain/money';
import { fonts, makeStyles, radius } from '@/theme';

type FeaturedProductProps = {
  product: Product;
  quantity: number;
  onAdd: () => void;
};

const HERO_HEIGHT = 184;
const ADD_SIZE = 42;

/**
 * Image-led hero for the most-ordered product: the photo fills the card and
 * the copy sits on a soft scrim at the bottom, with one compact action.
 */
export function FeaturedProduct({ product, quantity, onAdd }: FeaturedProductProps) {
  const styles = useStyles();
  const active = useMotionActive();

  // Slow "Ken Burns" drift on the photo so the hero never feels static.
  const drift = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(drift);
      return;
    }
    drift.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift, active]);
  const photoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1.04 + drift.value * 0.06 }, { translateY: drift.value * -6 }],
  }));

  // The "+" spins a quarter turn on every add, so the tap feels acknowledged.
  const spin = useSharedValue(0);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 90}deg` }] }));
  const handleAdd = () => {
    spin.set(withSpring(spin.get() + 1, { damping: 12, stiffness: 180 }));
    onAdd();
  };

  return (
    <View style={styles.card}>
      <Animated.View style={[StyleSheet.absoluteFill, photoStyle]}>
        <ProductImage product={product} height={HERO_HEIGHT} />
      </Animated.View>
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(4,14,26,0)', 'rgba(4,14,26,0.35)', 'rgba(4,14,26,0.82)']}
        locations={[0.25, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.tag}>
        <Ionicons name="flame" size={12} color="#0A5EBA" />
        <Text style={styles.tagText}>El más pedido</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {product.tagline}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatMoney(product.price)}</Text>
            {quantity > 0 ? (
              <Animated.Text key={quantity} entering={FadeIn.duration(200)} style={styles.inCart}>
                · {quantity} en tu pedido
              </Animated.Text>
            ) : null}
          </View>
        </View>

        <PressableScale
          haptic="light"
          scaleTo={0.88}
          accessibilityRole="button"
          accessibilityLabel={quantity > 0 ? `Agregar otro ${product.name}` : `Agregar ${product.name}`}
          onPress={handleAdd}
          hitSlop={6}
          style={styles.add}
        >
          {/* Frosted glass over the photo; the tint keeps it legible on bright shots. */}
          <BlurView intensity={30} tint="light" style={[StyleSheet.absoluteFill, styles.addGlass]} />
          <Animated.View style={spinStyle}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Animated.View>
        </PressableScale>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    height: HERO_HEIGHT,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: t.surface,
    boxShadow: t.cardShadow,
  },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  tagText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#0A5EBA',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  price: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: '#FFFFFF',
  },
  inCart: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  add: {
    width: ADD_SIZE,
    height: ADD_SIZE,
    borderRadius: ADD_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  // Web's backdrop-filter ignores the parent's rounded clip, so round it too.
  addGlass: {
    borderRadius: ADD_SIZE / 2,
  },
}));
