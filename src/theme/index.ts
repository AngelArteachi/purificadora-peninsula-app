import { useSyncExternalStore } from 'react';
import { Platform, StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { palettes, type Palette } from '@/theme/palette';

export type { Palette } from '@/theme/palette';

/**
 * Design tokens for the Hidra app. Colors follow the system light/dark
 * setting through `useTheme()` / `makeStyles()`; sizes are static.
 */

type Scheme = keyof typeof palettes;
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

const darkQuery = isWebEnvironment() ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function isWebEnvironment() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

function subscribeToWebScheme(onChange: () => void) {
  darkQuery?.addEventListener('change', onChange);
  return () => darkQuery?.removeEventListener('change', onChange);
}

function useScheme(): Scheme {
  const native = useColorScheme();
  // On web, read the media query directly so the theme follows the OS live,
  // without a reload (react-native-web only samples it on load).
  const webDark = useSyncExternalStore(
    subscribeToWebScheme,
    () => darkQuery?.matches ?? false,
    () => false,
  );
  if (darkQuery) return webDark ? 'dark' : 'light';
  return native === 'dark' ? 'dark' : 'light';
}

/** Current palette. Use for icon colors, gradients and other non-style props. */
export function useTheme(): Palette {
  return palettes[useScheme()];
}

/**
 * Builds a hook that returns a StyleSheet for the current scheme. Each scheme's
 * sheet is created once and cached, so calling the hook on every render is free.
 *
 *   const useStyles = makeStyles((t) => ({ card: { backgroundColor: t.surface } }));
 *   function Card() { const styles = useStyles(); ... }
 */
export function makeStyles<S extends NamedStyles>(factory: (t: Palette) => S & NamedStyles) {
  const cache: Partial<Record<Scheme, Readonly<S>>> = {};
  return function useStyles(): Readonly<S> {
    const scheme = useScheme();
    const cached = cache[scheme];
    if (cached) return cached;
    // The factory's return type already checks every style; `create` just registers it.
    const sheet = StyleSheet.create(factory(palettes[scheme]) as never) as Readonly<S>;
    cache[scheme] = sheet;
    return sheet;
  };
}

/** Bottom fade that blends scrolled content into the canvas behind sticky bars. */
export function fadeBottom(t: Palette) {
  const clear = t.scheme === 'dark' ? 'rgba(10,20,29,0)' : 'rgba(242,245,248,0)';
  return [clear, t.background] as const;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 44,
  '5xl': 60,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
  display: 'SpaceGrotesk_700Bold',
  displaySemibold: 'SpaceGrotesk_600SemiBold',
} as const;

/** Type scale. Nothing user-facing goes below `caption` (12). */
export const type = {
  largeTitle: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  title: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  headline: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  callout: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19 },
  footnote: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} as const;

export const layout = {
  screenPadding: 20,
  /** On wide screens (web/tablet preview) the app is centered at phone width. */
  maxContentWidth: 430,
};

/** Respect the user's text size, but keep layouts from breaking at extremes. */
export const MAX_FONT_SCALE = 1.3;

/** Absolute-fill object; RN 0.88 types dropped `StyleSheet.absoluteFillObject`. */
export const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;

export const isWeb = Platform.OS === 'web';
