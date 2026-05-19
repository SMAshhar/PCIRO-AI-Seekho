import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Severity} from '../types/models';
import {getSeverityColor} from '../utils/severityColors';
import {colors, typography} from '../constants/theme';
import {t} from '../utils/i18n';

interface Props {
  severity: Severity | 'resolved';
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({severity, size = 'md'}) => {
  const color = severity === 'resolved' ? colors.pakGreen : getSeverityColor(severity as Severity);
  const opacityHex = severity === 'low' ? '22' : '33';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}${opacityHex}`,
          paddingVertical: size === 'sm' ? 4 : 6,
          paddingHorizontal: size === 'sm' ? 8 : 12,
        },
      ]}>
      <Text style={[typography.badge, {color, fontSize: size === 'sm' ? 10 : 11}]}>
        {severity === 'critical' ? t('sevCritical').toUpperCase() :
         severity === 'high' ? t('sevHigh').toUpperCase() :
         severity === 'medium' ? t('sevMedium').toUpperCase() :
         severity === 'low' ? t('sevLow').toUpperCase() :
         severity === 'resolved' ? t('sevResolved').toUpperCase() : severity.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {borderRadius: 8, alignSelf: 'flex-start'},
});
