import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { IconButton } from '@/components/ui/PressableScale';
import { fonts, makeStyles, spacing } from '@/theme';

/** Back button + centered title for stack screens pushed over the tabs. */
export function ScreenHeader({ title, fallback = '/' }: { title: string; fallback?: '/' | '/perfil' }) {
  const styles = useStyles();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  };

  return (
    <View style={styles.header}>
      <IconButton name="chevron-back" accessibilityLabel="Regresar" onPress={goBack} />
      <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bold,
    fontSize: 17,
    color: t.text,
  },
  spacer: {
    width: 44,
  },
}));
