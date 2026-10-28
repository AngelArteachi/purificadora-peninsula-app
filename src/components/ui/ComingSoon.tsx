import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { fonts, makeStyles, radius, useTheme } from '@/theme';

/**
 * Inline note for prototype actions that aren't built yet ("Agregar
 * dirección"…), so a tap gets an honest answer instead of doing nothing.
 */
export function ComingSoon({ visible, message }: { visible: boolean; message: string }) {
  const t = useTheme();
  const styles = useStyles();
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOut.duration(150)}
      style={styles.note}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="time-outline" size={16} color={t.primaryText} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((t) => ({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: t.primarySoft,
  },
  text: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.primaryText,
  },
}));
