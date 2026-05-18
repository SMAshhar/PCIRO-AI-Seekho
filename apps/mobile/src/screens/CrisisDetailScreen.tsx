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
import MapView, {Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
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

type Props = NativeStackScreenProps<RootStackParamList, 'CrisisDetail'>;

export const CrisisDetailScreen: React.FC<Props> = ({route, navigation}) => {
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {crisis.title}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SeverityBadge severity={crisis.severity} />
        <Text style={[styles.section, {marginTop: 16}]}>Corroboration Score</Text>
        <CorroborationMeter score={crisis.corroboration_score} size={width * 0.45} />

        <Text style={styles.section}>Evidence Breakdown</Text>
        {crisis.sources?.map((s, i) => (
          <ScoreBar
            key={s.source_name}
            label={s.source_name}
            score={s.score_contribution}
            maxScore={s.max_score}
            index={i}
          />
        ))}

        <Text style={styles.section}>Impact</Text>
        <Text style={typography.body}>
          {crisis.impact_assessment?.affected_population?.toLocaleString() ?? '—'}{' '}
          residents ·{' '}
          {crisis.impact_assessment?.affected_sectors?.length ?? 0} zones
        </Text>
        <Text style={typography.label}>
          {crisis.impact_assessment?.affected_sectors?.join(', ')}
        </Text>

        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={darkMapStyle}
          region={mapRegion}
          scrollEnabled={false}
          zoomEnabled={false}>
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

        <Text style={styles.section}>Agent Pipeline</Text>
        {crisis.agent_trace && (
          <AgentTimeline agents={crisis.agent_trace} />
        )}

        <Pressable
          style={styles.link}
          onPress={() =>
            navigation.navigate('AgentTrace', {
              crisisId,
              traceId: crisis.trace_id ?? crisis.event_id,
            })
          }>
          <Text style={styles.linkText}>View Full Trace →</Text>
        </Pressable>
        <Pressable
          style={styles.link}
          onPress={() => navigation.navigate('Simulation', {crisisId})}>
          <Text style={styles.linkText}>View Simulation →</Text>
        </Pressable>

        {showCommander && (
          <View style={styles.commanderRow}>
            <Pressable
              style={styles.approveBtn}
              onPress={() =>
                navigation.navigate('IncidentCommander', {
                  crisisId,
                  eventId: crisis.event_id,
                })
              }>
              <Text style={styles.approveText}>Review & Approve</Text>
            </Pressable>
          </View>
        )}
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
    gap: 12,
  },
  back: {color: colors.blue, fontSize: 16},
  headerTitle: {...typography.heading, flex: 1},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  section: {...typography.subheading, marginTop: 20, marginBottom: 8},
  map: {height: 200, borderRadius: 12, marginTop: 12},
  link: {marginTop: 12, paddingVertical: 8},
  linkText: {color: colors.blue, fontSize: 15, fontWeight: '500'},
  commanderRow: {marginTop: 24},
  approveBtn: {
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {color: colors.text, fontWeight: '600', fontSize: 14},
});
