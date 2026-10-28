import { Stack } from 'expo-router';
import React from 'react';

import { useTheme } from '@/theme';

/** Profile sub-screens (addresses, payments, notifications, help). */
export default function SettingsLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
