import {TextStyle, ViewStyle} from 'react-native';

export const colors = {
  void: '#0F1923',
  surface: '#1C2B3A',
  navy: '#1A2B4A',
  elevated: '#243549',
  text: '#E8EFF5',
  muted: '#6B7A8D',
  border: 'rgba(232,239,245,0.08)',
  borderStrong: 'rgba(232,239,245,0.12)',
  danger: '#E63946',
  blue: '#0077B6',
  amber: '#F4A261',
  green: '#2A9D8F',
  noise: '#4A5568',
  burntOrange: '#FF6B35',
  deepCrimson: '#CC0000',
};

export const severity = {
  critical: colors.danger,
  high: colors.burntOrange,
  medium: colors.amber,
  low: colors.green,
};

export const spacing = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
};

export const radius = {
  card: 12,
  button: 8,
  badge: 6,
  bar: 4,
  sheet: 16,
};

const outfit = 'System';
const mono = 'monospace';

export const typography = {
  display: {
    fontFamily: outfit,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.48,
    color: colors.text,
  } as TextStyle,
  heading: {
    fontFamily: outfit,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  } as TextStyle,
  subheading: {
    fontFamily: outfit,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  body: {
    fontFamily: outfit,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.text,
  } as TextStyle,
  label: {
    fontFamily: outfit,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.48,
    color: colors.muted,
  } as TextStyle,
  caption: {
    fontFamily: outfit,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14,
    letterSpacing: 0.66,
    color: colors.muted,
  } as TextStyle,
  score: {
    fontFamily: mono,
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 28,
    color: colors.text,
  } as TextStyle,
  trace: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 21,
    color: colors.text,
  } as TextStyle,
  badge: {
    fontFamily: outfit,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
};

export const screen: ViewStyle = {
  flex: 1,
  backgroundColor: colors.void,
};

export const card: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.card,
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.s4,
};
