import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/components/ui/Card';
import { fonts, makeStyles, radius, useTheme } from '@/theme';

type DeliveryNoteProps = {
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
};

/** Editable note for the courier, placed at checkout. */
export function DeliveryNote({ value, onChangeText, style }: DeliveryNoteProps) {
  const t = useTheme();
  const styles = useStyles();

  return (
    <Card style={[styles.row, style]}>
      <View style={styles.icon}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={t.primaryText} />
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>Nota para el repartidor</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ej. Dejar con la portera del edificio B"
          placeholderTextColor={t.textTertiary}
          style={styles.input}
          selectionColor={t.primary}
          maxLength={120}
          returnKeyType="done"
          accessibilityLabel="Nota para el repartidor"
        />
      </View>

      <Ionicons name="create-outline" size={18} color={t.textTertiary} />
    </Card>
  );
}

const useStyles = makeStyles((t) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  input: {
    marginTop: 2,
    padding: 0,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: t.textSecondary,
  },
}));
