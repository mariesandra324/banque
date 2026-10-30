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
    text: '#0F172A',
    background: '#F4F7FC',
    backgroundTop: '#FBFCFE',
    backgroundBottom: '#EDF2FA',
    backgroundElement: '#EEF3FA',
    backgroundSelected: '#E3EAF4',
    surface: '#FFFFFF',
    textSecondary: '#6B7A93',
    line: '#E4EAF4',
    accent: '#3B82F6',
    accentSoft: '#EAF2FF',
    danger: '#E45B57',
    dangerSoft: '#FDEDEC',
    primary: '#1B5FD0',
    primarySoft: '#EAF1FF',
    success: '#16A34A',
    successSoft: '#E6F7EE',
    warning: '#D97706',
    warningSoft: '#FEF3E2',
    onPrimary: '#FFFFFF',
    onAccent: '#FFFFFF',
  },
  dark: {
    text: '#EAF0FA',
    background: '#070D1A',
    backgroundTop: '#0B1322',
    backgroundBottom: '#060B16',
    backgroundElement: '#121D31',
    backgroundSelected: '#1A2942',
    surface: '#0F1929',
    textSecondary: '#93A4BE',
    line: '#1E2C46',
    accent: '#7AAEFF',
    accentSoft: '#152846',
    danger: '#FF8A80',
    dangerSoft: '#3A2323',
    primary: '#4E8EF7',
    primarySoft: '#152846',
    success: '#4ADE80',
    successSoft: '#12301F',
    warning: '#FBBF24',
    warningSoft: '#3A2B12',
    onPrimary: '#FFFFFF',
    onAccent: '#0B1226',
  },
} as const;

/** Dégradés signature : carte de solde, cartes bancaires. */
export const Gradients = {
  hero: ['#1557B8', '#0B2A5B', '#071A3A'] as const,
  heroAccent: ['#62A6FF', '#1B5FD0'] as const,
  cards: [
    ['#1B5FD0', '#0B2A5B'],
    ['#0B2A5B', '#071A3A'],
    ['#3B82F6', '#1557A6'],
  ] as const,
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
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

/** Ombres douces et légères : cartes, boutons primaires, éléments flottants. */
export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#0B1220',
      shadowOpacity: 0.06,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
    },
    default: { elevation: 4 },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: '#0B1220',
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
    },
    default: { elevation: 10 },
  }),
  pressed: Platform.select({
    ios: { opacity: 0.85 },
    default: { opacity: 0.85 },
  }),
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1120;