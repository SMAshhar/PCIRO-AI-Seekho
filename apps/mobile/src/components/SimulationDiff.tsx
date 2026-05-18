import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SimulationMetric} from '../types/models';
import {colors, typography} from '../constants/theme';

interface Props {
  metrics: SimulationMetric[];
}

export const SimulationDiff: React.FC<Props> = ({metrics}) => (
  <View style={styles.table}>
    <View style={styles.headerRow}>
      <Text style={[typography.label, styles.colMetric]}>Metric</Text>
      <Text style={[typography.label, styles.col]}>Before</Text>
      <Text style={[typography.label, styles.col]}>After</Text>
    </View>
    {metrics.map(m => (
      <View key={m.label} style={styles.row}>
        <Text style={[typography.body, styles.colMetric]}>{m.label}</Text>
        <Text style={[typography.body, styles.col, styles.mono]}>{m.before}</Text>
        <View style={[styles.col, styles.afterCell]}>
          <Text
            style={[
              typography.body,
              styles.mono,
              m.improved && {color: colors.green},
            ]}>
            {m.after}
          </Text>
          {m.improved && (
            <Icon name="arrow-down" size={14} color={colors.green} />
          )}
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  table: {marginTop: 8},
  headerRow: {flexDirection: 'row', marginBottom: 8},
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  colMetric: {flex: 2},
  col: {flex: 1, textAlign: 'right'},
  mono: {fontFamily: 'monospace', fontSize: 13},
  afterCell: {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4},
});
