import {colors} from '../constants/theme';

export interface ScoreZone {
  color: string;
  label: string;
}

export const getScoreZone = (score: number): ScoreZone => {
  if (score <= 30) {
    return {color: colors.noise, label: 'NOISE'};
  }
  if (score <= 54) {
    return {color: colors.amber, label: 'WATCHING'};
  }
  if (score <= 74) {
    return {color: colors.burntOrange, label: 'MONITORING'};
  }
  if (score <= 89) {
    return {color: colors.danger, label: 'ALERT'};
  }
  return {color: colors.deepCrimson, label: 'CRITICAL'};
};

export const interpolateScoreColor = (score: number): string => {
  const s = Math.max(0, Math.min(100, score));
  if (s <= 30) {
    return colors.noise;
  }
  if (s <= 54) {
    return colors.amber;
  }
  if (s <= 74) {
    return colors.burntOrange;
  }
  if (s <= 89) {
    return colors.danger;
  }
  return colors.deepCrimson;
};
