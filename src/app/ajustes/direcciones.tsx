import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { ADDRESSES } from '@/data/catalog';
import { useCart } from '@/state/cart';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

export default function AddressesScreen() {
  const t = useTheme();
  const styles = useStyles();
  const { address: current, deliveryWindow, setDelivery } = useCart();
  const [soon, setSoon] = useState(false);

  return (
    <Screen>
      <ScreenHeader title="Direcciones" fallback="/perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal index={0}>
          <Text style={styles.hint}>Toca una dirección para usarla en tus próximos pedidos.</Text>
        </Reveal>

        {ADDRESSES.map((address, index) => {
          const selected = address.id === current.id;
          return (
            <Reveal key={address.id} index={index + 1}>
              <PressableScale
                haptic="light"
                scaleTo={0.98}
                accessibilityRole="radio"
                accessibilityLabel={`${address.label}, ${address.line}, ${address.sub}`}
                accessibilityState={{ selected }}
                onPress={() => setDelivery(address.id, deliveryWindow.id)}
              >
                <Card style={[styles.card, selected && styles.cardSelected]}>
                  <View style={styles.icon}>
                    <Ionicons
                      name={address.id === 'casa' ? 'home-outline' : 'business-outline'}
                      size={20}
                      color={t.primaryText}
                    />
                  </View>
                  <View style={styles.body}>
                    <View style={styles.titleRow}>
                      <Text style={styles.label}>{address.label}</Text>
                      {selected ? (
                        <Animated.View entering={ZoomIn.springify().damping(14)}>
                          <StatusPill label="Predeterminada" tone="primary" />
                        </Animated.View>
                      ) : null}
                    </View>
                    <Text style={styles.line}>{address.line}</Text>
                    <Text style={styles.sub}>{address.sub}</Text>
                  </View>
                </Card>
              </PressableScale>
            </Reveal>
          );
        })}

        <Reveal index={ADDRESSES.length + 1}>
          <PressableScale
            haptic="light"
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Agregar dirección"
            onPress={() => setSoon(true)}
            style={styles.add}
          >
            <Ionicons name="add-circle-outline" size={20} color={t.primaryText} />
            <Text style={styles.addText}>Agregar dirección</Text>
          </PressableScale>
          <ComingSoon visible={soon} message="Muy pronto podrás guardar más direcciones." />
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
    gap: spacing.md,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: t.primary,
  },
  icon: {
    height: 42,
    width: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primarySoft,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: t.text,
  },
  line: {
    marginTop: 4,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: t.text,
  },
  sub: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
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
