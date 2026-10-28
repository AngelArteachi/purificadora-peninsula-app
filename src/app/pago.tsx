import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CouponField } from '@/components/checkout/CouponField';
import { Reveal } from '@/components/motion/Reveal';
import { OrderLines } from '@/components/checkout/OrderLines';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { PaymentMethods, paymentMethod, type PaymentMethodId } from '@/components/checkout/PaymentMethods';
import { SectionHeader } from '@/components/checkout/SectionHeader';
import { DeliveryNote } from '@/components/order/DeliveryNote';
import { DeliverySheet } from '@/components/order/DeliverySheet';
import { SuccessOverlay } from '@/components/order/SuccessOverlay';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Segmented } from '@/components/ui/Segmented';
import { formatMoney } from '@/domain/money';
import { useIsOnline } from '@/hooks/useIsOnline';
import { cartTotals, rewardDiscount, unitsLabel, type Coupon } from '@/domain/order';
import { useCart, type Frequency } from '@/state/cart';
import { useLoyalty } from '@/state/loyalty';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'unica', label: 'Una vez' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
];

export default function PaymentScreen() {
  const t = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { rewardReady, completePurchase } = useLoyalty();
  const {
    cart,
    frequency,
    address,
    deliveryWindow,
    setQuantity,
    setFrequency,
    setDelivery,
    placeOrder,
  } = useCart();
  const [methodId, setMethodId] = useState<PaymentMethodId>('cash');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [note, setNote] = useState('Dejar con la portera del edificio B');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const totals = useMemo(
    () => cartTotals(cart, { coupon, reward: rewardDiscount(cart, rewardReady) }),
    [cart, coupon, rewardReady],
  );
  const method = paymentMethod(methodId);
  const empty = totals.items === 0;
  const online = useIsOnline();

  // Frozen when the user confirms, so placing the order can clear the cart.
  const confirmed = useRef<{ total: number; redeemedReward: boolean } | null>(null);

  const confirm = () => {
    confirmed.current = { total: totals.total, redeemedReward: totals.reward > 0 };
    setStatus('loading');
  };

  // Visual-only payment flow: spinner → confirmation → tracking screen.
  useEffect(() => {
    if (status !== 'loading') return;
    const loading = setTimeout(() => setStatus('success'), 1500);
    return () => clearTimeout(loading);
  }, [status]);

  useEffect(() => {
    if (status !== 'success' || !confirmed.current) return;
    const order = confirmed.current;
    const done = setTimeout(() => {
      completePurchase({ redeemedReward: order.redeemedReward });
      placeOrder(order.total);
      router.replace('/seguimiento');
    }, 1900);
    return () => clearTimeout(done);
  }, [completePurchase, placeOrder, status]);

  const goToCatalog = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <Screen>
      <ScreenHeader title="Tu pedido" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 150 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Reveal index={0}>
          <SectionHeader title="Entrega" gap={false} />
          <Card padded={false}>
            <PressableScale
              haptic="light"
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={`Entregar en ${address.line}. Cambiar dirección u horario`}
              onPress={() => setDeliveryOpen(true)}
              style={styles.deliveryRow}
            >
              <Ionicons name="location-outline" size={22} color={t.textSecondary} />
              <View style={styles.flex}>
                <Text style={styles.deliveryTitle} numberOfLines={1}>
                  {address.line}
                </Text>
                <Text style={styles.deliverySub}>
                  {address.label} · {address.sub}
                </Text>
              </View>
              <Text style={styles.change}>Cambiar</Text>
            </PressableScale>
            <PressableScale
              haptic="light"
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={`Horario ${deliveryWindow.label} ${deliveryWindow.sub}. Cambiar`}
              onPress={() => setDeliveryOpen(true)}
              style={[styles.deliveryRow, styles.divider]}
            >
              <Ionicons name="time-outline" size={22} color={t.textSecondary} />
              <View style={styles.flex}>
                <Text style={styles.deliveryTitle}>
                  {deliveryWindow.label}, {deliveryWindow.sub}
                </Text>
                <Text style={styles.deliverySub}>Envío {formatMoney(totals.shipping)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
            </PressableScale>
          </Card>
        </Reveal>

        <Reveal index={1}>
          <SectionHeader title="Productos" meta={unitsLabel(totals.items)} />
          <OrderLines lines={totals.lines} onChangeQuantity={setQuantity} onAddMore={goToCatalog} />
          {totals.reward > 0 ? (
            <View style={styles.rewardNote}>
              <Ionicons name="gift-outline" size={16} color={t.success} />
              <Text style={styles.rewardNoteText}>Club Hidra: un garrafón purificado va gratis.</Text>
            </View>
          ) : null}
        </Reveal>

        <Reveal index={2}>
          <DeliveryNote value={note} onChangeText={setNote} style={styles.sectionGap} />
        </Reveal>

        <Reveal index={3}>
          <SectionHeader title="Frecuencia" meta="Opcional" />
          <Segmented<Frequency>
            options={FREQUENCY_OPTIONS}
            sublabels={{ unica: 'Solo hoy', semanal: 'Cada martes', quincenal: 'Días 1 y 15' }}
            value={frequency}
            onChange={setFrequency}
          />
        </Reveal>

        <Reveal index={4}>
          <SectionHeader title="Pago" />
          <PaymentMethods value={methodId} onChange={setMethodId} />
        </Reveal>

        <Reveal index={5} style={styles.sectionGap}>
          <CouponField applied={coupon} onChange={setCoupon} />
        </Reveal>

        <Reveal index={6}>
          <SectionHeader title="Resumen" />
          <OrderSummary totals={totals} couponLabel={coupon?.label} note={method.hint} />
        </Reveal>
      </ScrollView>

      <View style={[styles.sticky, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          label={
            empty
              ? 'Agrega productos'
              : !online
                ? 'Sin conexión'
                : status === 'idle'
                  ? 'Confirmar pedido'
                  : 'Procesando…'
          }
          icon={!online && !empty ? 'cloud-offline-outline' : undefined}
          trailingAmount={empty || !online ? undefined : totals.total}
          loading={status === 'loading'}
          disabled={empty || !online || status !== 'idle'}
          haptic="success"
          onPress={confirm}
        />
        <Text style={styles.trustText}>Puedes cancelar sin costo antes de que salga el repartidor.</Text>
      </View>

      <DeliverySheet
        visible={deliveryOpen}
        addressId={address.id}
        windowId={deliveryWindow.id}
        onClose={() => setDeliveryOpen(false)}
        onSave={setDelivery}
      />

      <SuccessOverlay
        visible={status === 'success'}
        title="¡Pedido confirmado!"
        subtitle="Tu agua va en camino. Te avisamos cuando esté cerca."
      />
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionGap: {
    marginTop: spacing['2xl'],
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  deliveryTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  deliverySub: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  change: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: t.primaryText,
  },
  rewardNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginLeft: 2,
  },
  rewardNoteText: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: t.success,
  },
  sticky: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: 12,
    backgroundColor: t.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: t.border,
    boxShadow: t.floatShadow,
  },
  trustText: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: t.textTertiary,
  },
}));
