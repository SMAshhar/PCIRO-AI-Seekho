import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootStackParamList} from '../navigation/types';
import {useCrisisDetail} from '../hooks/useCrisisDetail';
import {TraceLog} from '../components/TraceLog';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {colors, spacing, typography} from '../constants/theme';
import {AgentStep} from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'AgentTrace'>;

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

export const AgentTraceScreen: React.FC<Props> = ({route, navigation}) => {
  const {crisisId, traceId} = route.params;
  const {crisis, loading} = useCrisisDetail(crisisId);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (loading || !crisis) {
    return <LoadingSpinner />;
  }

  const exportTrace = () => {
    Alert.alert(
      'Trace export',
      `${(crisis.agent_trace ?? []).length} agent steps — connect clipboard API for full copy.`,
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Agent Trace</Text>
        <Pressable onPress={exportTrace}>
          <Text style={styles.export}>Export</Text>
        </Pressable>
      </View>
      <Text style={styles.traceId}>Trace ID: {traceId}</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {crisis.agent_trace?.map((step, i) => {
          const icon = statusIcon(step.status);
          return (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name={icon.name} size={22} color={icon.color} />
                <Text style={styles.agentName}>{step.agent_name}</Text>
              </View>
              {step.summary && (
                <Text style={typography.body}>{step.summary}</Text>
              )}
              {step.raw_output && (
                <Pressable onPress={() => setExpanded(e => ({...e, [i]: !e[i]}))}>
                  <Text style={styles.toggle}>
                    {expanded[i] ? '▲ Hide raw output' : '▼ Show raw output'}
                  </Text>
                </Pressable>
              )}
              {expanded[i] && step.raw_output && (
                <View style={{marginTop: 8}}>
                  <TraceLog content={step.raw_output} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s5,
    backgroundColor: colors.navy,
  },
  back: {color: colors.blue, marginRight: 12},
  title: {...typography.heading, flex: 1},
  export: {color: colors.blue, fontSize: 14},
  traceId: {...typography.label, fontFamily: 'monospace', paddingHorizontal: spacing.s5, marginTop: 8},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s4,
    marginBottom: spacing.s3,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8},
  agentName: {...typography.subheading},
  toggle: {color: colors.blue, marginTop: 8, fontSize: 13},
});
