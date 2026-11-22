/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveThemeMode, useThemeMode } from '@/contexte/ThemeContext';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeMode();
  const scheme = resolveThemeMode(mode, systemScheme);

  return Colors[scheme];
}