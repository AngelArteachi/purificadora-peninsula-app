import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Pulse } from '@/components/motion/Pulse';
import { MAX_FONT_SCALE, fonts, makeStyles, radius, useTheme, type Palette } from '@/theme';

export type PillTone = 'primary' | 'success' | 'warning' | 'neutral';

function toneColors(t: Palette, tone: PillTone) {
  switch (tone) {
    case 'primary':
      return { bg: t.primarySoft, fg: t.primaryText };
    case 'success':
      return { bg: t.successSoft, fg: t.success };
    case 'warning':
      return { bg: t.warningSoft, fg: t.warning };
    case 'neutral':
      return { bg: t.surfaceMuted, fg: t.textSecondary };
  }
}

type StatusPillProps = {
  label: string;
  tone?: PillTone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Shows a dot — used for live states. */
  live?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Compact status chip used for "En camino", delivery slots, badges… */
export function StatusPill({ label, tone = 'primary', icon, live = false, style }: StatusPillProps) {
  const t = useTheme();
  const styles = useStyles();
  const palette = toneColors(t, tone);

  return (
    <View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
      {live ? (
        <Pulse color={palette.fg} size={7} rings={1} duration={1600}>
          <View style={[styles.dot, { backgroundColor: palette.fg }]} />
        </Pulse>
      ) : icon ? (
        <Ionicons name={icon} size={13} color={palette.fg} />
      ) : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.label, { color: palette.fg }]}>
        {label}
      </Text>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
}));
