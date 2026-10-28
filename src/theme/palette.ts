/**
 * Semantic color palettes. Both schemes expose the same keys, so components
 * only ever ask for a role ("surface", "textSecondary") and never a raw color.
 */

export type Palette = {
  scheme: 'light' | 'dark';

  /** Screen canvas. */
  background: string;
  /** Cards, sheets and bars that sit on the canvas. */
  surface: string;
  /** Inset areas inside a card: image wells, inputs, stepper tracks. */
  surfaceMuted: string;
  /** Pressed / selected fill for neutral controls. */
  surfacePressed: string;

  border: string;
  borderStrong: string;

  text: string;
  textSecondary: string;
  textTertiary: string;

  /** Brand action color: buttons, links, selected states. */
  primary: string;
  onPrimary: string;
  primarySoft: string;
  /** Primary used as text on surfaces (slightly darker in light mode for contrast). */
  primaryText: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;

  /** Scrim behind sheets and dialogs. */
  overlay: string;
  /** Translucent fill for floating bars over a blur. */
  chrome: string;
  /** CSS-style shadow for raised cards; 'none' where borders do the job. */
  cardShadow: string;
  /** Stronger shadow for floating elements (tab bar, sheets, sticky CTAs). */
  floatShadow: string;
};

export const light: Palette = {
  scheme: 'light',

  background: '#F2F5F8',
  surface: '#FFFFFF',
  surfaceMuted: '#EDF2F6',
  surfacePressed: '#E3EAF0',

  border: '#E1E7ED',
  borderStrong: '#C9D3DC',

  text: '#0E1A24',
  textSecondary: '#4B5B68',
  textTertiary: '#64737F',

  primary: '#0B6BD3',
  onPrimary: '#FFFFFF',
  primarySoft: '#E4F0FC',
  primaryText: '#0A5EBA',

  success: '#0A8A5F',
  successSoft: '#E1F5EC',
  warning: '#A35F00',
  warningSoft: '#FFF2DB',
  danger: '#C8324A',
  dangerSoft: '#FCE8EB',

  overlay: 'rgba(10,20,30,0.42)',
  chrome: 'rgba(255,255,255,0.92)',
  cardShadow: '0px 1px 2px rgba(16,32,48,0.06), 0px 6px 18px rgba(16,32,48,0.06)',
  floatShadow: '0px -2px 18px rgba(16,32,48,0.10)',
};

export const dark: Palette = {
  scheme: 'dark',

  background: '#0A141D',
  surface: '#121F2B',
  surfaceMuted: '#1A2A38',
  surfacePressed: '#22364A',

  border: '#1F3142',
  borderStrong: '#2E465C',

  text: '#EDF3F7',
  textSecondary: '#A6B6C3',
  textTertiary: '#8396A5',

  primary: '#3B97F5',
  onPrimary: '#04111D',
  primarySoft: 'rgba(59,151,245,0.16)',
  primaryText: '#6CB2FF',

  success: '#3CCF95',
  successSoft: 'rgba(60,207,149,0.14)',
  warning: '#F2B24A',
  warningSoft: 'rgba(242,178,74,0.14)',
  danger: '#FF6F81',
  dangerSoft: 'rgba(255,111,129,0.14)',

  overlay: 'rgba(0,0,0,0.6)',
  chrome: 'rgba(18,31,43,0.94)',
  cardShadow: 'none',
  floatShadow: '0px -2px 18px rgba(0,0,0,0.35)',
};

export const palettes = { light, dark } as const;
