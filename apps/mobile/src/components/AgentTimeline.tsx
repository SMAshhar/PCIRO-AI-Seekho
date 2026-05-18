import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AgentStep} from '../types/models';
import {colors, typography} from '../constants/theme';

interface Props {
  agents: AgentStep[];
  compact?: boolean;
}

const statusIcon = (status: AgentStep['status']) => {
  switch (status) {
    case 'done':
      return {name: 'check-circle', color: colors.green};
    case 'active':
      return {name: 'loading', color: colors.blue};
    case 'failed':
      return {name: 'close-circle', color: colors.danger};
    default:
      return {name: 'circle-outline', color: colors.muted};
  }
};

export const AgentTimeline: React.FC<Props> = ({agents, compact = false}) => {
  const content = agents.map((agent, i) => {
    const icon = statusIcon(agent.status);
    return (
      <View key={`${agent.agent_name}-${i}`} style={styles.step}>
        {i > 0 && (
          <View
            style={[
              styles.line,
              {
                backgroundColor:
                  agents[i - 1].status === 'done' ? colors.blue : colors.border,
              },
            ]}
          />
        )}
        <Icon name={icon.name} size={compact ? 14 : 24} color={icon.color} />
        {!compact && (
          <Text style={styles.label} numberOfLines={2}>
            {agent.agent_name.split(' ')[0]}
          </Text>
        )}
      </View>
    );
  });

  if (compact) {
    return <View style={styles.compactRow}>{content}</View>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>{content}</View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8},
  compactRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8},
  step: {alignItems: 'center', width: 56, position: 'relative'},
  line: {
    position: 'absolute',
    left: -28,
    top: 12,
    width: 56,
    height: 1,
  },
  label: {...typography.caption, marginTop: 4, textAlign: 'center'},
});
