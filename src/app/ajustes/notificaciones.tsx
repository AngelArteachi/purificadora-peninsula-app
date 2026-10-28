import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Reveal } from '@/components/motion/Reveal';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

type Setting = {
  key: 'status' | 'reorder' | 'promos' | 'club';
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  detail: string;
};

const SETTINGS: Setting[] = [
  { key: 'status', icon: 'bicycle-outline', title: 'Estado del pedido', detail: 'Cuando se confirma, sale y llega' },
  { key: 'reorder', icon: 'repeat-outline', title: 'Recordatorio de agua', detail: 'Te avisamos cuando toque pedir de nuevo' },
  { key: 'club', icon: 'water-outline', title: 'Club Hidra', detail: 'Avances y tu garrafón gratis' },
  { key: 'promos', icon: 'pricetag-outline', title: 'Promociones', detail: 'Cupones y ofertas de temporada' },
];

export default function NotificationsScreen() {
  const t = useTheme();
  const styles = useStyles();
  const [enabled, setEnabled] = useState<Record<Setting['key'], boolean>>({
    status: true,
    reorder: true,
    club: true,
    promos: false,
  });

  return (
    <Screen>
      <ScreenHeader title="Notificaciones" fallback="/perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Reveal index={0}>
          <Card padded={false} style={styles.group}>
            {SETTINGS.map((setting, index) => (
              <View key={setting.key} style={[styles.row, index > 0 && styles.divider]}>
                <View style={styles.icon}>
                  <Ionicons name={setting.icon} size={20} color={t.primaryText} />
                </View>
                <View style={styles.body}>
                  <Text style={styles.title}>{setting.title}</Text>
                  <Text style={styles.detail}>{setting.detail}</Text>
                </View>
                <Switch
                  value={enabled[setting.key]}
                  onValueChange={(value) => setEnabled((current) => ({ ...current, [setting.key]: value }))}
                  trackColor={{ false: t.borderStrong, true: t.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={t.borderStrong}
                  accessibilityLabel={setting.title}
                />
              </View>
            ))}
          </Card>
        </Reveal>
        <Reveal index={1}>
          <Text style={styles.note}>
            Los avisos del estado del pedido te ayudan a recibir al repartidor a tiempo.
          </Text>
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
  group: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    backgroundColor: t.primarySoft,
  },
  body: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: t.text,
  },
  detail: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  note: {
    marginLeft: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: t.textTertiary,
  },
}));
