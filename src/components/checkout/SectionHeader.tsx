import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, makeStyles, spacing } from '@/theme';

/** Section title + right-aligned meta (text or any node) above a card. */
export function SectionHeader({
  title,
  meta,
  gap = true,
  style,
}: {
  title: string;
  meta?: React.ReactNode;
  /** Adds the standard space above the section. Off for the first section. */
  gap?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  return (
    <View style={[styles.header, gap && styles.gap, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {typeof meta === 'string' ? <Text style={styles.meta}>{meta}</Text> : meta}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: spacing.md,
  },
  gap: {
    marginTop: spacing['2xl'],
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 19,
    color: t.text,
    letterSpacing: -0.2,
  },
  meta: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textTertiary,
  },
}));
