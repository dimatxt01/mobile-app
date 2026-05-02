import { StyleSheet } from 'react-native';

export const colors = {
  base: '#0A0A0B',
  elevated: '#111113',
  high: '#1A1A1D',
  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1A6',
  textTertiary: '#6B6B70',
  lineRegular: 'rgba(255,255,255,0.08)' as const,
  lineStrong: 'rgba(255,255,255,0.14)' as const,
  amber: '#FFB020',
  danger: '#FF453A',
  bgHigher: '#222226',
  textQuiet: '#48484C',
  accentMuted: 'rgba(255,176,32,0.16)' as const,
  accentDim: 'rgba(255,176,32,0.5)' as const,
  accentGlow: 'rgba(255,176,32,0.28)' as const,
  dangerMuted: 'rgba(255,69,58,0.12)' as const,
} as const;

export const fonts = {
  display: 'Inter_400Regular',
  displayMedium: 'Inter_500Medium',
  displayBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const spacing = {
  pagePad: 20,
  sectionGap: 24,
  hairline: StyleSheet.hairlineWidth,
} as const;
