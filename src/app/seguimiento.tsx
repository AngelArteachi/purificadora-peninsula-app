import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  LinearTransition,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { TrackingMap } from '@/components/map/TrackingMap';
import { ProductImage } from '@/components/order/ProductImage';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton, PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { DELIVERY } from '@/data/catalog';
import { formatMoney } from '@/domain/money';
import { cartTotals, unitsLabel } from '@/domain/order';
import { useCart } from '@/state/cart';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

type Step = { key: string; label: string; state: 'done' | 'active' | 'pending' };

const STEPS: Step[] = [
  { key: 'confirmed', label: 'Confirmado', state: 'done' },
  { key: 'packing', label: 'Preparado', state: 'done' },
  { key: 'onway', label: 'En camino', state: 'active' },
  { key: 'delivered', label: 'Entregado', state: 'pending' },
];

/** Light sweep that runs across the active segment, so "en camino" feels live. */
function ActiveSweep() {
  const styles = useStyles();
  const active = useMotionActive();
  const sweep = useSharedValue(0);
  React.useEffect(() => {
    if (!active) {
      cancelAnimation(sweep);
      return;
    }
    sweep.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, [active, sweep]);
  const style = useAnimatedStyle(() => ({ left: `${-40 + sweep.value * 140}%` }));
  return <Animated.View style={[styles.sweep, style]} />;
}

/** Segmented progress bar with the four delivery steps underneath. */
function DeliveryProgress() {
  const styles = useStyles();
  const active = STEPS.find((step) => step.state === 'active');
  return (
    <View accessible accessibilityLabel={`Estado del pedido: ${active?.label ?? ''}`}>
      <View style={styles.progress}>
        {STEPS.map((step) => (
          <View
            key={step.key}
            style={[
              styles.progressSegment,
              step.state === 'done' && styles.progressDone,
              step.state === 'active' && styles.progressActive,
            ]}
          >
            {step.state === 'active' ? <ActiveSweep /> : null}
          </View>
        ))}
      </View>
      <View style={styles.progressLabels}>
        {STEPS.map((step) => (
          <Text
            key={step.key}
            style={[styles.progressLabel, step.state === 'active' && styles.progressLabelActive]}
            numberOfLines={1}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function TrackingScreen() {
  const t = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { activeOrder, address: currentAddress } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(320);

  const { lines, items } = cartTotals(activeOrder?.cart ?? {});
  const total = activeOrder?.total ?? 0;
  const address = activeOrder?.address ?? currentAddress;
  const firstName = DELIVERY.courier.name.split(' ')[0];

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (!activeOrder) {
    return (
      <Screen>
        <View style={styles.emptyHeader}>
          <IconButton name="chevron-back" accessibilityLabel="Regresar" onPress={goBack} />
        </View>
        <View style={styles.emptyBody}>
          <EmptyState
            icon="navigate-outline"
            title="No tienes pedidos en camino"
            message="Cuando confirmes un pedido, aquí verás al repartidor acercarse en tiempo real."
            actionLabel="Hacer un pedido"
            onAction={() => router.replace('/')}
          />
        </View>
      </Screen>
    );
  }

  const handleSheetLayout = (event: LayoutChangeEvent) => {
    setSheetHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={styles.root}>
      <TrackingMap padding={{ top: insets.top + 64, right: 24, bottom: sheetHeight + 16, left: 24 }} />

      <Animated.View
        entering={FadeInDown.delay(200).springify().damping(16)}
        style={[styles.topBar, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <IconButton name="chevron-back" variant="floating" accessibilityLabel="Regresar" onPress={goBack} />
        <IconButton name="share-outline" variant="floating" accessibilityLabel="Compartir seguimiento" />
      </Animated.View>

      <Animated.View
        entering={SlideInDown.delay(80).springify().damping(18)}
        layout={LinearTransition.springify().damping(20)}
        onLayout={handleSheetLayout}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <View style={styles.handle} />

        <View style={styles.etaRow}>
          <View style={styles.flex}>
            <Text style={styles.eta} accessibilityRole="header">
              Llega en {DELIVERY.etaMinutes} min
            </Text>
            <Text style={styles.etaCopy} numberOfLines={1}>
              {firstName} va hacia {address.line}
            </Text>
          </View>
          <View style={styles.etaTime} accessible accessibilityLabel="Hora estimada 6:12 pm">
            <Text style={styles.etaTimeValue}>6:12</Text>
            <Text style={styles.etaTimeUnit}>pm</Text>
          </View>
        </View>

        <DeliveryProgress />

        <View style={styles.courierRow}>
          <View style={styles.courierAvatar}>
            <Text style={styles.courierInitials}>{DELIVERY.courier.initials}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.courierName}>{DELIVERY.courier.name}</Text>
            <Text style={styles.courierMeta}>
              ★ {DELIVERY.courier.rating} · {DELIVERY.courier.vehicle}
            </Text>
          </View>
          <IconButton name="chatbubble-outline" accessibilityLabel={`Enviar mensaje a ${firstName}`} />
          <IconButton name="call" variant="primary" accessibilityLabel={`Llamar a ${firstName}`} />
        </View>

        <PressableScale
          haptic="light"
          scaleTo={0.99}
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          accessibilityLabel="Detalles del pedido"
          accessibilityState={{ expanded }}
          style={styles.detailsToggle}
        >
          <View style={styles.flex}>
            <Text style={styles.detailsTitle}>Pedido #{DELIVERY.orderId}</Text>
            <Text style={styles.detailsMeta}>
              {unitsLabel(items, ['producto', 'productos'])} · {formatMoney(total)}
            </Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={t.textTertiary} />
        </PressableScale>

        {expanded ? (
          <Animated.View entering={FadeIn.duration(200)}>
            {lines.map((line, index) => (
              <Animated.View
                key={line.product.id}
                entering={FadeInDown.delay(index * 60).springify().damping(16)}
                style={styles.detailLine}
              >
                <ProductImage product={line.product} height={40} style={styles.detailThumb} />
                <Text style={styles.detailName} numberOfLines={1}>
                  {line.quantity} × {line.product.name}
                </Text>
                <Text style={styles.detailPrice}>{formatMoney(line.quantity * line.product.price)}</Text>
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },
  flex: {
    flex: 1,
  },
  emptyHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  emptyBody: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: 8,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    backgroundColor: t.surface,
    boxShadow: t.floatShadow,
  },
  handle: {
    alignSelf: 'center',
    height: 5,
    width: 36,
    borderRadius: 3,
    backgroundColor: t.borderStrong,
    marginBottom: 14,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  eta: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    color: t.text,
  },
  etaCopy: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
  etaTime: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: t.surfaceMuted,
  },
  etaTimeValue: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: t.text,
  },
  etaTimeUnit: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: t.textSecondary,
  },
  progress: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: t.surfaceMuted,
  },
  progressDone: {
    backgroundColor: t.success,
  },
  progressActive: {
    backgroundColor: t.primary,
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  progressLabels: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  progressLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: t.textTertiary,
  },
  progressLabelActive: {
    fontFamily: fonts.bold,
    color: t.primaryText,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  courierAvatar: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  courierInitials: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.textSecondary,
  },
  courierName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  courierMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  detailsTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  detailsMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  detailThumb: {
    width: 40,
    borderRadius: radius.sm,
  },
  detailName: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: t.text,
  },
  detailPrice: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: t.text,
  },
}));
