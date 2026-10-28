import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DropMark } from '@/components/ui/Logo';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { CartProvider } from '@/state/cart';
import { LoyaltyProvider } from '@/state/loyalty';
import { SessionProvider, useSession } from '@/state/session';
import { isWeb, layout, makeStyles, useTheme } from '@/theme';

/** Plain branded state while the fonts load — same look as the native splash. */
function Boot() {
  const styles = useStyles();
  return (
    <View style={styles.boot}>
      <DropMark size={64} />
    </View>
  );
}

/**
 * On wide web viewports the app is centered at phone width so the mobile
 * layout keeps its proportions. No fake status bar: the browser has its own.
 */
function WebFrame({ children }: { children: React.ReactNode }) {
  const styles = useStyles();
  if (!isWeb) return <>{children}</>;
  return (
    <View style={styles.webStage}>
      <View style={styles.webFrame}>{children}</View>
    </View>
  );
}

/** Signed-out users only see the login; everything else needs a session. */
function RootStack() {
  const t = useTheme();
  const { user } = useSession();
  const signedIn = user !== null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: t.background },
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        {/* Checkout rises like a sheet; tracking fades up over the tabs. */}
        <Stack.Screen name="pago" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="seguimiento" options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="ajustes" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const styles = useStyles();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="auto" />
      <SessionProvider>
        <CartProvider>
          <LoyaltyProvider>
            {fontsLoaded ? (
              <WebFrame>
                <RootStack />
                <OfflineBanner />
              </WebFrame>
            ) : (
              <Boot />
            )}
          </LoyaltyProvider>
        </CartProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((t) => ({
  root: {
    flex: 1,
    backgroundColor: t.background,
  },
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.background,
  },
  webStage: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: t.scheme === 'dark' ? '#05090D' : '#DCE3EA',
  },
  webFrame: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    overflow: 'hidden',
    backgroundColor: t.background,
  },
}));
