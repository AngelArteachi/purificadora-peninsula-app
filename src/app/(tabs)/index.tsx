import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  SlideInDown,
  SlideOutDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CountUpMoney } from '@/components/motion/CountUp';
import { Reveal } from '@/components/motion/Reveal';
import { useTabBarInset } from '@/components/order/BottomNav';
import { DeliverySheet } from '@/components/order/DeliverySheet';
import { FeaturedProduct } from '@/components/order/FeaturedProduct';
import { LoyaltyCard } from '@/components/order/LoyaltyCard';
import { ProductCard } from '@/components/order/ProductCard';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { PRODUCTS } from '@/data/catalog';
import { formatMoney } from '@/domain/money';
import { cartTotals, unitsLabel } from '@/domain/order';
import { useCart } from '@/state/cart';
import { useLoyalty } from '@/state/loyalty';
import { useSession } from '@/state/session';
import { fadeBottom, fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

const CART_BAR_SPACE = 78;

/** Splits a list into rows of two for the catalogue grid. */
function pairs<T>(list: T[]): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < list.length; index += 2) rows.push(list.slice(index, index + 2));
  return rows;
}

export default function HomeScreen() {
  const t = useTheme();
  const styles = useStyles();
  const tabInset = useTabBarInset();
  const { user } = useSession();
  const { purchases, target } = useLoyalty();
  const { cart, setQuantity, address, deliveryWindow, setDelivery } = useCart();
  const [deliveryOpen, setDeliveryOpen] = useState(false);

  const { items, total } = useMemo(() => cartTotals(cart), [cart]);

  // Header gains a surface + hairline once content scrolls under it; the
  // greeting drifts up and fades a little faster than the scroll.
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 40], [0, 1], Extrapolation.CLAMP),
  }));
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 80], [0, -14], Extrapolation.CLAMP) }],
  }));

  // The cart bar jumps a little every time something is added.
  const cartBounce = useSharedValue(1);
  const lastItems = useRef(items);
  useEffect(() => {
    if (items > lastItems.current) {
      cartBounce.value = withSequence(withTiming(1.05, { duration: 120 }), withSpring(1, { damping: 9, stiffness: 260 }));
    }
    lastItems.current = items;
  }, [cartBounce, items]);
  const cartBounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: cartBounce.value }] }));

  const [featured, ...rest] = PRODUCTS;
  const featuredQuantity = cart[featured.id] ?? 0;

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <Animated.View pointerEvents="none" style={[styles.headerSurface, headerStyle]} />
        <PressableScale
          haptic="light"
          scaleTo={0.98}
          accessibilityRole="button"
          accessibilityLabel={`Entregar en ${address.line}, ${deliveryWindow.label} ${deliveryWindow.sub}. Cambiar.`}
          onPress={() => setDeliveryOpen(true)}
          style={styles.addressButton}
        >
          <Text style={styles.addressLabel}>Entregar en {address.label.toLowerCase()}</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressValue} numberOfLines={1}>
              {address.line}
            </Text>
            <Ionicons name="chevron-down" size={18} color={t.text} />
          </View>
        </PressableScale>

        <PressableScale
          haptic="light"
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={`Perfil de ${user?.name ?? 'usuario'}`}
          onPress={() => router.navigate('/perfil')}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{user?.initials}</Text>
        </PressableScale>
      </View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabInset + (items > 0 ? CART_BAR_SPACE : 0) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <Animated.View style={greetingStyle}>
            <Text style={styles.greeting}>Hola, {user?.name}</Text>
            <View style={styles.eta}>
              <Ionicons name="time-outline" size={16} color={t.success} />
              <Text style={styles.etaText}>
                Entrega {deliveryWindow.label.toLowerCase()} · {deliveryWindow.sub}
              </Text>
            </View>
          </Animated.View>
        </Reveal>

        <Reveal index={1}>
          <LoyaltyCard current={purchases} target={target} />
        </Reveal>

        <Reveal index={2}>
          <FeaturedProduct
            product={featured}
            quantity={featuredQuantity}
            onAdd={() => setQuantity(featured.id, featuredQuantity + 1)}
          />
        </Reveal>

        <Reveal index={3}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Más productos
          </Text>
        </Reveal>

        <View style={styles.grid}>
          {pairs(rest).map((row, rowIndex) => (
            <Reveal key={row.map((product) => product.id).join('-')} index={4 + rowIndex} style={styles.gridRow}>
              {row.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={cart[product.id] ?? 0}
                  onChange={(quantity) => setQuantity(product.id, quantity)}
                />
              ))}
              {row.length === 1 ? <View style={styles.gridSpacer} /> : null}
            </Reveal>
          ))}
        </View>

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={16} color={t.textTertiary} />
          <Text style={styles.noteText}>Agua purificada certificada · pago al recibir disponible</Text>
        </View>
      </Animated.ScrollView>

      {items > 0 ? (
        <Animated.View
          entering={SlideInDown.springify().damping(17)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.cartBar, { bottom: tabInset }]}
        >
          <LinearGradient pointerEvents="none" colors={fadeBottom(t)} style={styles.cartFade} />
          <Animated.View style={cartBounceStyle}>
            <PressableScale
              haptic="medium"
              scaleTo={0.97}
              accessibilityRole="button"
              accessibilityLabel={`Ver pedido, ${unitsLabel(items, ['producto', 'productos'])}, total ${formatMoney(total)}`}
              onPress={() => router.push('/pago')}
              style={styles.cartButton}
            >
              <View style={styles.cartCount}>
                <Animated.Text key={items} entering={SlideInDown.springify().damping(12)} style={styles.cartCountText}>
                  {items}
                </Animated.Text>
              </View>
              <Text style={styles.cartLabel}>Ver pedido</Text>
              <CountUpMoney value={total} style={styles.cartTotal} />
            </PressableScale>
          </Animated.View>
        </Animated.View>
      ) : null}

      <DeliverySheet
        visible={deliveryOpen}
        addressId={address.id}
        windowId={deliveryWindow.id}
        onClose={() => setDeliveryOpen(false)}
        onSave={setDelivery}
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  header: {
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSurface: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.chrome,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  addressButton: {
    flex: 1,
  },
  addressLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textSecondary,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  addressValue: {
    flexShrink: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: t.text,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primarySoft,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: t.primaryText,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    color: t.text,
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  etaText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: t.success,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    marginBottom: -4,
    fontFamily: fonts.display,
    fontSize: 20,
    color: t.text,
  },
  grid: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridSpacer: {
    flex: 1,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  noteText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textTertiary,
  },
  cartBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: 4,
    paddingBottom: 12,
    backgroundColor: t.background,
  },
  cartButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
    backgroundColor: t.primary,
    boxShadow: '0px 6px 18px rgba(11,107,211,0.35)',
  },
  cartCount: {
    height: 32,
    minWidth: 32,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  cartCountText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.onPrimary,
  },
  cartLabel: {
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    color: t.onPrimary,
  },
  cartTotal: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: t.onPrimary,
    fontVariant: ['tabular-nums'],
  },
  cartFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    height: 24,
  },
}));
