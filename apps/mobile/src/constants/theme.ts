import {TextStyle, ViewStyle} from 'react-native';

export const colors = {
  // Backgrounds — 3-layer elevation system
  void:         '#0F1923',   // screen background
  navy:         '#0D1E36',   // header / navigation
  surface:      '#1C2B3A',   // cards, sheets
  elevated:     '#243549',   // pressed / hover states

  // Text
  text:         '#E8EFF5',   // primary text
  muted:        '#6B7A8D',   // secondary / label text

  // Borders
  border:       'rgba(232,239,245,0.08)',
  borderStrong: 'rgba(232,239,245,0.12)',

  // Severity — traffic-light logic
  danger:       '#E63946',   // critical
  burntOrange:  '#FF6B35',   // high
  amber:        '#F59E0B',   // medium
  green:        '#22C55E',   // low
  pakGreen:     '#01411C',   // resolved / safe — Pakistan identity accent

  // Score zones
  noise:        '#64748B',   // 0-30 — visible low-confidence gray
  deepCrimson:  '#FF1744',   // 90-100 — max-alarm

  // Accent / Interactive
  blue:         '#38BDF8',   // primary interactive

  // New utility tokens
  success:      '#22C55E',
  info:         '#38BDF8',
  overlay:      'rgba(0,0,0,0.6)',
  primaryGlow:  'rgba(56,189,248,0.15)',
  dangerGlow:   'rgba(230,57,70,0.20)',
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
