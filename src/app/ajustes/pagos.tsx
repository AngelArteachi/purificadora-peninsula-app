import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { PAYMENT_METHODS, type PaymentMethodId } from '@/components/checkout/PaymentMethods';
import { Reveal } from '@/components/motion/Reveal';
import { PaymentCard } from '@/components/order/PaymentCard';
import { Card } from '@/components/ui/Card';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

export default function PaymentsScreen() {
  const t = useTheme();
  const styles = useStyles();
  const [preferred, setPreferred] = useState<PaymentMethodId>('cash');
  const [soon, setSoon] = useState(false);

  return (
    <Screen>
      <ScreenHeader title="Métodos de pago" fallback="/perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal index={0}>
          <Text style={styles.sectionTitle}>Tarjeta guardada</Text>
          <PaymentCard />
          <Text style={styles.cardHint}>Toca la tarjeta para ver el reverso</Text>
        </Reveal>

        <Reveal index={1}>
          <Text style={styles.sectionTitle}>Método preferido</Text>
          <Card padded={false} style={styles.group}>
            {PAYMENT_METHODS.map((method, index) => {
              const active = method.id === preferred;
              return (
                <PressableScale
                  key={method.id}
                  haptic="light"
                  scaleTo={0.99}
                  accessibilityRole="radio"
                  accessibilityLabel={`${method.title}. ${method.subtitle}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => setPreferred(method.id)}
                  style={[styles.row, index > 0 && styles.divider]}
                >
                  <View style={styles.icon}>
                    <Ionicons name={method.icon} size={20} color={t.textSecondary} />
                  </View>
                  <View style={styles.body}>
                    <Text style={styles.title}>{method.title}</Text>
                    <Text style={styles.subtitle}>{method.subtitle}</Text>
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
          </Card>
          <Text style={styles.note}>Lo usaremos por defecto al confirmar tus pedidos.</Text>
        </Reveal>

        <Reveal index={2}>
          <PressableScale
            haptic="light"
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Agregar tarjeta"
            onPress={() => setSoon(true)}
            style={styles.add}
          >
            <Ionicons name="card-outline" size={20} color={t.primaryText} />
            <Text style={styles.addText}>Agregar tarjeta</Text>
          </PressableScale>
          <ComingSoon visible={soon} message="Muy pronto podrás guardar más tarjetas." />
        </Reveal>
      </ScrollView>
    </Screen>
  );
}

const useStyles = makeStyles((t) => ({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontFamily: fonts.bold,
    fontSize: 17,
    color: t.text,
  },
  cardHint: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: t.textTertiary,
  },
  group: {
    overflow: 'hidden',
  },
  row: {
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
  icon: {
    height: 40,
    width: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  note: {
    marginTop: 8,
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textTertiary,
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: t.borderStrong,
  },
  addText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.primaryText,
  },
}));
