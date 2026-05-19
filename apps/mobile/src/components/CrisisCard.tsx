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
import {useT} from '../utils/i18n';

interface Props {
  crisis: CrisisEvent;
  onPress: () => void;
  index?: number;
}

export const CrisisCard: React.FC<Props> = ({crisis, onPress, index = 0}) => {
  const t = useT();
  const severityColor = getSeverityColor(crisis.severity);
  const zone = getScoreZone(crisis.corroboration_score);
  const scorePct = crisis.corroboration_score;

  let displayTitle = crisis.title;
  if (crisis.title === 'G-10 Urban Flooding') displayTitle = t('mockFloodTitle');
  if (crisis.title === 'I-8 Markaz Gridlock') displayTitle = t('mockTrafficTitle');
  if (crisis.title === 'F-7 Heat Advisory') displayTitle = t('mockHeatTitle');

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
              {displayTitle}
            </Text>
            <Text style={typography.label}>
              {formatRelativeTime(crisis.ingest_timestamp)} · {crisis.sector}
            </Text>
          </View>
          <SeverityBadge severity={crisis.severity} size="sm" />
        </View>

        <View style={styles.scoreSection}>
          <Text style={typography.label}>{t('corroborationScore')}</Text>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderLeftWidth: 4,
    padding: spacing.s5,
    marginBottom: spacing.s4,
  },
  pressed: {backgroundColor: colors.elevated, transform: [{scale: 0.98}]},
  topRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 14},
  titleBlock: {flex: 1, gap: 4},
  scoreSection: {marginTop: 16},
  scoreRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8},
  scoreTrack: {
    flex: 1,
    height: 8,
    borderRadius: 8,
    backgroundColor: `${colors.void}99`,
    overflow: 'hidden',
  },
  scoreFill: {height: '100%', borderRadius: 8},
  scoreNum: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 52,
    textAlign: 'right',
  },
});
