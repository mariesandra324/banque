/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Direction : « Banking premium » — thème bancaire bleu : fond clair bleuté, surfaces blanches,
 * texte anthracite, bleu principal pour les interactions, bleu nuit pour les cartes bancaires,
 * vert/rouge pour les mouvements.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#172033',
    background: '#F5F7FC',
    backgroundElement: '#E8F1FC',
    backgroundSelected: '#E1E7F0',
    surface: '#FFFFFF',
    textSecondary: '#7A8499',
    line: '#E1E7F0',
    accent: '#2F80ED',
    accentSoft: '#E8F1FC',
    danger: '#E05252',
    dangerSoft: '#FDEAEA',
    primary: '#1557A6',
    primarySoft: '#E8F1FC',
    success: '#20B26B',
    successSoft: '#E3F7EC',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
  dark: {
    text: '#EDF3FC',
    background: '#0B1226',
    backgroundElement: '#12203F',
    backgroundSelected: '#1A2C52',
    surface: '#101B33',
    textSecondary: '#9AA8C0',
    line: '#22365E',
    accent: '#6EA8FF',
    accentSoft: '#1A2C52',
    danger: '#F17878',
    dangerSoft: '#3A2226',
    primary: '#3D7FD6',
    primarySoft: '#1E3A6B',
    success: '#3CCB82',
    successSoft: '#153A2C',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

/** Ombres douces et légères : cartes, boutons primaires, éléments flottants. */
export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#0B1220',
      shadowOpacity: 0.07,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
    },
    default: { elevation: 4 },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#0B1220',
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
    },
    default: { elevation: 10 },
  }),
  pressed: Platform.select({
    ios: { opacity: 0.85 },
    default: { opacity: 0.85 },
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;