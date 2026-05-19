import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapView, {Polygon, PROVIDER_GOOGLE, UrlTile} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RootStackParamList} from '../navigation/types';
import {useCrisisDetail} from '../hooks/useCrisisDetail';
import {useUserStore} from '../store/userStore';
import {CorroborationMeter} from '../components/CorroborationMeter';
import {SeverityBadge} from '../components/SeverityBadge';
import {ScoreBar} from '../components/ScoreBar';
import {AgentTimeline} from '../components/AgentTimeline';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {darkMapStyle} from '../constants/mapStyle';
import {getSeverityColor} from '../utils/severityColors';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'CrisisDetail'>;

export const CrisisDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const t = useT();
  const {crisisId} = route.params;
  const {crisis, loading} = useCrisisDetail(crisisId);
  const role = useUserStore(s => s.role);
  const {width} = useWindowDimensions();

  if (loading || !crisis) {
    return <LoadingSpinner />;
  }

  const severityColor = getSeverityColor(crisis.severity);
  const coords = crisis.impact_assessment?.zone_geojson?.coordinates?.[0];
  const mapRegion = {
    latitude: crisis.location.lat,
    longitude: crisis.location.lon,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  };

  const showCommander =
    role === 'incident_commander' && crisis.status === 'awaiting_approval';

  let displayTitle = crisis.title;
  if (crisis.title === 'G-10 Urban Flooding') displayTitle = t('mockFloodTitle');
  if (crisis.title === 'I-8 Markaz Gridlock') displayTitle = t('mockTrafficTitle');
  if (crisis.title === 'F-7 Heat Advisory') displayTitle = t('mockHeatTitle');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {displayTitle}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <SeverityBadge severity={crisis.severity} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t('corroborationScore')}</Text>
          <CorroborationMeter score={crisis.corroboration_score} size={width * 0.45} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t('evidenceBreakdown')}</Text>
          <View style={styles.breakdownWrap}>
            {crisis.sources?.map((s, i) => (
              <ScoreBar
                key={s.source_name}
                label={s.source_name}
                score={s.score_contribution}
                maxScore={s.max_score}
                index={i}
              />
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t('impact')}</Text>
          <View style={styles.impactData}>
            <Text style={typography.body}>
              {crisis.impact_assessment?.affected_population?.toLocaleString() ?? '—'}{' '}
              {t('residents')} ·{' '}
              {crisis.impact_assessment?.affected_sectors?.length ?? 0} {t('zones')}
            </Text>
            <Text style={[typography.label, {marginTop: 4}]}>
              {crisis.impact_assessment?.affected_sectors?.join(', ')}
            </Text>
          </View>

          <View style={styles.mapWrapper}>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              customMapStyle={darkMapStyle}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}>
              <UrlTile
                urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
              />
              {coords && (
                <Polygon
                  coordinates={coords.map(([lon, lat]) => ({
                    latitude: lat,
                    longitude: lon,
                  }))}
                  fillColor={`${severityColor}4D`}
                  strokeColor={severityColor}
                  strokeWidth={2}
                />
              )}
            </MapView>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>{t('agentPipeline')}</Text>
          {crisis.agent_trace && (
            <View style={{marginTop: 8}}>
              <AgentTimeline agents={crisis.agent_trace} />
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('AgentTrace', {
                crisisId,
                traceId: crisis.trace_id ?? crisis.event_id,
              })
            }>
            <Icon name="console-network" size={20} color={colors.blue} />
            <Text style={styles.actionBtnText}>{t('viewFullTrace')} →</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Simulation', {crisisId})}>
            <Icon name="cube-scan" size={20} color={colors.blue} />
            <Text style={styles.actionBtnText}>{t('viewSimulation')} →</Text>
          </Pressable>

          {showCommander && (
            <Pressable
              style={styles.approveBtn}
              onPress={() =>
                navigation.navigate('IncidentCommander', {
                  crisisId,
                  eventId: crisis.event_id,
                })
              }>
              <Icon name="shield-check" size={20} color={colors.text} />
              <Text style={styles.approveText}>{t('reviewApprove')}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s5,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    ...typography.heading,
    flex: 1,
    fontSize: 18,
  },
  scroll: {
    padding: spacing.s5,
    paddingBottom: 40,
    gap: 16,
  },
  topSection: {
    marginBottom: -4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.s5,
    overflow: 'hidden',
  },
  sectionHeader: {
    ...typography.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  breakdownWrap: {
    gap: 4,
  },
  impactData: {
    marginBottom: 16,
  },
  mapWrapper: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  map: {
    height: 160,
    width: '100%',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  actionBtnText: {
    color: colors.blue,
    fontSize: 15,
    fontWeight: '600',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  approveText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});

