import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { useTabBarInset } from '@/components/order/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { StatusPill } from '@/components/ui/StatusPill';
import { DEFAULT_CART, DELIVERY } from '@/data/catalog';
import { formatMoney } from '@/domain/money';
import { cartTotals } from '@/domain/order';
import { useCart } from '@/state/cart';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

const HABITUAL = cartTotals(DEFAULT_CART);

const HISTORY = [
  { date: '12 oct', detail: '2 purificados · 1 alcalino', total: 118 },
  { date: '5 oct', detail: '1 purificado · 1 combo con bomba', total: 164 },
  { date: '28 sep', detail: '3 purificados', total: 105 },
];

export default function OrdersScreen() {
  const t = useTheme();
  const styles = useStyles();
  const tabInset = useTabBarInset();
  const { replaceCart, address: currentAddress, activeOrder, setFrequency } = useCart();
  const address = activeOrder?.address ?? currentAddress;

  const repeatHabitual = () => {
    replaceCart(DEFAULT_CART);
    setFrequency('unica');
    router.push('/pago');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabInset + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <Text style={styles.title} accessibilityRole="header">
            Pedidos
          </Text>
        </Reveal>

        <Reveal index={1}>
          <Text style={styles.sectionTitle}>En curso</Text>
          {activeOrder ? (
            <PressableScale
              haptic="light"
              scaleTo={0.99}
              accessibilityRole="button"
              accessibilityLabel={`Pedido ${DELIVERY.orderId} en camino, llega en ${DELIVERY.etaMinutes} minutos. Ver rastreo.`}
              onPress={() => router.push('/seguimiento')}
            >
              <Card>
                <View style={styles.activeTop}>
                  <StatusPill label="En camino" tone="success" live />
                  <Text style={styles.orderId}>#{DELIVERY.orderId}</Text>
                </View>
                <Text style={styles.eta}>Llega en {DELIVERY.etaMinutes} min</Text>
                <Text style={styles.etaCopy} numberOfLines={1}>
                  {address.line}
                </Text>

                <View style={styles.courierRow}>
                  <View style={styles.courierAvatar}>
                    <Text style={styles.courierInitials}>{DELIVERY.courier.initials}</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.courierName}>{DELIVERY.courier.name}</Text>
                    <Text style={styles.courierMeta}>
                      {DELIVERY.courier.vehicle} · ★ {DELIVERY.courier.rating}
                    </Text>
                  </View>
                  <View style={styles.trackLink}>
                    <Text style={styles.trackText}>Rastrear</Text>
                    <Ionicons name="chevron-forward" size={16} color={t.primaryText} />
                  </View>
                </View>
              </Card>
            </PressableScale>
          ) : (
            <Card>
              <EmptyState
                size="compact"
                icon="water-outline"
                title="Sin pedidos en curso"
                message="Pide tus garrafones y síguelos desde aquí."
                actionLabel="Pedir ahora"
                onAction={() => router.navigate('/')}
              />
            </Card>
          )}
        </Reveal>

        <Reveal index={2}>
          <Text style={styles.sectionTitle}>Tu pedido habitual</Text>
          <Card>
            <Text style={styles.habitualTitle}>2 purificados + 1 alcalino</Text>
            <Text style={styles.habitualCopy}>
              {formatMoney(HABITUAL.subtotal)} + {formatMoney(HABITUAL.shipping)} de envío
            </Text>
            <View style={styles.habitualFooter}>
              <Text style={styles.habitualTotal}>{formatMoney(HABITUAL.total)}</Text>
              <Button label="Repetir pedido" icon="repeat" size="small" onPress={repeatHabitual} />
            </View>
          </Card>
        </Reveal>

        <Reveal index={3}>
          <Text style={styles.sectionTitle}>Anteriores</Text>
          <Card padded={false}>
            {HISTORY.map((entry, index) => (
              <View key={entry.date} style={[styles.historyRow, index > 0 && styles.divider]}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark" size={16} color={t.success} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.historyDetail}>{entry.detail}</Text>
                  <Text style={styles.historyMeta}>Entregado · {entry.date}</Text>
                </View>
                <Text style={styles.historyTotal}>{formatMoney(entry.total)}</Text>
              </View>
            ))}
          </Card>
        </Reveal>
      </ScrollView>
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
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: t.text,
  },
  sectionTitle: {
    marginTop: spacing['2xl'],
    marginBottom: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: t.text,
  },
  activeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textTertiary,
  },
  eta: {
    marginTop: 12,
    fontFamily: fonts.display,
    fontSize: 24,
    color: t.text,
  },
  etaCopy: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  courierAvatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  courierInitials: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: t.textSecondary,
  },
  courierName: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  courierMeta: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  trackLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: t.primaryText,
  },
  habitualTitle: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: t.text,
  },
  habitualCopy: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
  habitualFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  habitualTotal: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: t.text,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  historyIcon: {
    height: 32,
    width: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.successSoft,
  },
  historyDetail: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: t.text,
  },
  historyMeta: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textTertiary,
  },
  historyTotal: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
}));
