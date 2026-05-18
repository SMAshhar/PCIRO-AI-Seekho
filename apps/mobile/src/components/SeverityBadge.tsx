import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Severity} from '../types/models';
import {getSeverityColor} from '../utils/severityColors';
import {typography} from '../constants/theme';

interface Props {
  severity: Severity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<Props> = ({severity, size = 'md'}) => {
  const color = getSeverityColor(severity);
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: `${color}33`,
          paddingVertical: size === 'sm' ? 4 : 5,
          paddingHorizontal: size === 'sm' ? 6 : 10,
        },
      ]}>
      <Text style={[typography.badge, {color, fontSize: size === 'sm' ? 10 : 11}]}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {borderRadius: 6, alignSelf: 'flex-start'},
});
