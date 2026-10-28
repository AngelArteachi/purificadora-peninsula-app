import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { useTabBarInset } from '@/components/order/BottomNav';
import { LoyaltyCard } from '@/components/order/LoyaltyCard';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import { Screen } from '@/components/ui/Screen';
import { ADDRESSES } from '@/data/catalog';
import { useLoyalty } from '@/state/loyalty';
import { useSession } from '@/state/session';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

type Row = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  detail: string;
  href: Href;
};

const ROWS: Row[] = [
  { icon: 'location-outline', label: 'Direcciones', detail: `${ADDRESSES.length} guardadas`, href: '/ajustes/direcciones' },
  { icon: 'card-outline', label: 'Métodos de pago', detail: 'Visa ·· 4821', href: '/ajustes/pagos' },
  { icon: 'notifications-outline', label: 'Notificaciones', detail: 'Activadas', href: '/ajustes/notificaciones' },
  { icon: 'help-circle-outline', label: 'Ayuda', detail: 'Preguntas frecuentes y contacto', href: '/ajustes/ayuda' },
];

export default function ProfileScreen() {
  const t = useTheme();
  const styles = useStyles();
  const tabInset = useTabBarInset();
  const { user, signOut } = useSession();
  const { purchases, target } = useLoyalty();

  return (
    <Screen edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabInset + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <Reveal index={0}>
          <Text style={styles.title} accessibilityRole="header">
            Perfil
          </Text>
        </Reveal>

        <Reveal index={1}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.initials}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
        </Reveal>

        <Reveal index={2}>
          <LoyaltyCard current={purchases} target={target} />
        </Reveal>

        <Reveal index={3}>
          <Card padded={false} style={styles.list}>
            {ROWS.map((row, index) => (
              <PressableScale
                key={row.label}
                haptic="light"
                scaleTo={0.99}
                accessibilityRole="button"
                accessibilityLabel={`${row.label}, ${row.detail}`}
                onPress={() => router.push(row.href)}
                style={[styles.row, index > 0 && styles.divider]}
              >
                <Ionicons name={row.icon} size={22} color={t.textSecondary} />
                <View style={styles.flex}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  <Text style={styles.rowDetail}>{row.detail}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={t.textTertiary} />
              </PressableScale>
            ))}
          </Card>
        </Reveal>

        <Reveal index={4}>
          <PressableScale
            haptic="medium"
            scaleTo={0.98}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            onPress={signOut}
            style={styles.signOut}
          >
            <Text style={styles.signOutText}>Cerrar sesión</Text>
          </PressableScale>
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.primarySoft,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: t.primaryText,
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: t.text,
  },
  userEmail: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
  list: {
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  row: {
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
  rowLabel: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  rowDetail: {
    marginTop: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  signOut: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: t.surface,
    borderWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: t.border,
    boxShadow: t.cardShadow,
  },
  signOutText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.danger,
  },
}));
