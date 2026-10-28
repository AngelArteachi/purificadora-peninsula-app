import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { makeStyles, radius } from '@/theme';

type CardProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Inner padding. Off for cards whose content runs edge to edge (photos). */
  padded?: boolean;
  /** Muted fill for secondary groupings that shouldn't compete with cards. */
  tone?: 'default' | 'muted';
};

/**
 * Solid surface for grouped content. Light mode lifts it with a soft shadow;
 * dark mode separates it with a hairline instead, since shadows vanish there.
 */
export function Card({ children, style, padded = true, tone = 'default' }: CardProps) {
  const styles = useStyles();
  return (
    <View style={[styles.card, tone === 'muted' && styles.muted, padded && styles.padded, style]}>
      {children}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  card: {
    backgroundColor: t.surface,
    borderRadius: radius.xl,
    borderWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: t.border,
    boxShadow: t.cardShadow,
  },
  muted: {
    backgroundColor: t.surfaceMuted,
    boxShadow: 'none',
    borderWidth: 0,
  },
  padded: {
    padding: 16,
  },
}));
