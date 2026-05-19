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
      return {name: 'check-circle', color: colors.success};
    case 'active':
      return {name: 'circle-slice-8', color: colors.blue};
    case 'failed':
      return {name: 'close-circle', color: colors.danger};
    default:
      return {name: 'circle-outline', color: colors.muted};
  }
};

export const AgentTimeline: React.FC<Props> = ({agents, compact = false}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {agents.map((agent, i) => {
          const icon = statusIcon(agent.status);
          return (
            <React.Fragment key={`${agent.agent_name}-${i}`}>
              <View style={styles.compactNode}>
                <Icon name={icon.name} size={14} color={icon.color} />
              </View>
              {i < agents.length - 1 && (
                <View
                  style={[
                    styles.compactLine,
                    {
                      backgroundColor:
                        agents[i].status === 'done' ? colors.success : colors.borderStrong,
                    },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {agents.map((agent, i) => {
          const icon = statusIcon(agent.status);
          return (
            <View key={`${agent.agent_name}-${i}`} style={styles.step}>
              {i > 0 && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        agents[i - 1].status === 'done' ? colors.success : colors.borderStrong,
                    },
                  ]}
                />
              )}
              <Icon name={icon.name} size={24} color={icon.color} />
              <Text style={styles.label} numberOfLines={2}>
                {agent.agent_name.split(' ')[0]}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8},
  step: {alignItems: 'center', width: 56, position: 'relative'},
  line: {
    position: 'absolute',
    left: -28,
    top: 12,
    width: 56,
    height: 1.5,
  },
  label: {...typography.caption, marginTop: 4, textAlign: 'center'},
  
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 2,
  },
  compactNode: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 14,
    height: 14,
  },
  compactLine: {
    flex: 1,
    height: 1.5,
  },
});

