import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {CrisisEvent} from '../types/models';
import {colors, spacing, typography} from '../constants/theme';
import {getSeverityColor} from '../utils/severityColors';
import {formatRelativeTime} from '../utils/formatTime';
import {getCrisisTypeLabel} from '../utils/crisisTypeLabels';
import {getScoreZone} from '../utils/scoreZone';
import {CrisisTypeIcon} from './CrisisTypeIcon';
import {SeverityBadge} from './SeverityBadge';
import {AgentTimeline} from './AgentTimeline';

interface Props {
  crisis: CrisisEvent;
  onPress: () => void;
  index?: number;
}

export const CrisisCard: React.FC<Props> = ({crisis, onPress, index = 0}) => {
  const severityColor = getSeverityColor(crisis.severity);
  const zone = getScoreZone(crisis.corroboration_score);
  const scorePct = crisis.corroboration_score;

  return (
    <Animated.View entering={FadeInUp.delay(index * 50).duration(300)}>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [
          styles.card,
          {borderLeftColor: severityColor},
          pressed && styles.pressed,
        ]}>
        <View style={styles.topRow}>
          <CrisisTypeIcon type={crisis.crisis_type} />
          <View style={styles.titleBlock}>
            <Text style={typography.heading} numberOfLines={1}>
              {crisis.title}
            </Text>
            <Text style={typography.label}>
              {formatRelativeTime(crisis.ingest_timestamp)} · {crisis.sector}
            </Text>
          </View>
          <SeverityBadge severity={crisis.severity} size="sm" />
        </View>

        <View style={styles.scoreSection}>
          <Text style={typography.label}>Corroboration Score</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreTrack}>
              <View
                style={[
                  styles.scoreFill,
                  {width: `${scorePct}%`, backgroundColor: zone.color},
                ]}
              />
            </View>
            <Text style={styles.scoreNum}>
              {Math.round(crisis.corroboration_score)}/100
            </Text>
          </View>
        </View>

        {crisis.agent_trace && crisis.agent_trace.length > 0 && (
          <AgentTimeline agents={crisis.agent_trace.slice(0, 6)} compact />
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.s4,
    marginBottom: spacing.s3,
  },
  pressed: {backgroundColor: colors.elevated, transform: [{scale: 0.99}]},
  topRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12},
  titleBlock: {flex: 1},
  scoreSection: {marginTop: 12},
  scoreRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6},
  scoreTrack: {
    flex: 1,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.void,
    overflow: 'hidden',
  },
  scoreFill: {height: '100%', borderRadius: 4},
  scoreNum: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    minWidth: 48,
    textAlign: 'right',
  },
});
