import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {RootStackParamList} from '../navigation/types';
import {useCrisisDetail} from '../hooks/useCrisisDetail';
import {SimulationDiff} from '../components/SimulationDiff';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {darkMapStyle} from '../constants/mapStyle';
import {colors, spacing, typography} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Simulation'>;

export const SimulationScreen: React.FC<Props> = ({route, navigation}) => {
  const {crisisId} = route.params;
  const {crisis, loading} = useCrisisDetail(crisisId);
  const {width} = useWindowDimensions();
  const narrow = width < 380;
  const [tab, setTab] = useState<'before' | 'after'>('before');

  if (loading || !crisis) {
    return <LoadingSpinner />;
  }

  const region = {
    latitude: crisis.location.lat,
    longitude: crisis.location.lon,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const beforeRoute = [
    {latitude: crisis.location.lat + 0.01, longitude: crisis.location.lon},
    {latitude: crisis.location.lat, longitude: crisis.location.lon + 0.02},
  ];
  const afterRoute = [
    {latitude: crisis.location.lat - 0.01, longitude: crisis.location.lon - 0.01},
    {latitude: crisis.location.lat + 0.015, longitude: crisis.location.lon - 0.015},
  ];

  const MapPanel = ({mode}: {mode: 'before' | 'after'}) => (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      customMapStyle={darkMapStyle}
      region={region}
      scrollEnabled={false}
      zoomEnabled={false}>
      <Polyline
        coordinates={mode === 'before' ? beforeRoute : afterRoute}
        strokeColor={mode === 'before' ? colors.danger : colors.blue}
        strokeWidth={4}
      />
      {mode === 'after' && (
        <Marker
          coordinate={afterRoute[1]}
          pinColor="green"
          title="Rescue unit"
        />
      )}
    </MapView>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Response Simulation</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {narrow ? (
          <View>
            <View style={styles.tabs}>
              {(['before', 'after'] as const).map(t => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={[styles.tab, tab === t && styles.tabOn]}>
                  <Text style={typography.body}>{t.toUpperCase()}</Text>
                </Pressable>
              ))}
            </View>
            <MapPanel mode={tab} />
          </View>
        ) : (
          <View style={styles.mapRow}>
            <View style={styles.mapCol}>
              <Text style={styles.mapLabel}>BEFORE</Text>
              <MapPanel mode="before" />
            </View>
            <View style={styles.mapCol}>
              <Text style={styles.mapLabel}>AFTER</Text>
              <MapPanel mode="after" />
            </View>
          </View>
        )}

        {crisis.simulation_metrics && (
          <SimulationDiff metrics={crisis.simulation_metrics} />
        )}

        <Text style={styles.section}>Actions Executed</Text>
        {crisis.proposed_actions?.map((a, i) => (
          <Text key={i} style={styles.action}>
            ✓ {a}
          </Text>
        ))}
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
  title: {...typography.heading, flex: 1},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  mapRow: {flexDirection: 'row', gap: 8},
  mapCol: {flex: 1},
  mapLabel: {...typography.label, marginBottom: 6},
  map: {height: 160, borderRadius: 8},
  tabs: {flexDirection: 'row', gap: 8, marginBottom: 8},
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  tabOn: {borderWidth: 1, borderColor: colors.blue},
  section: {...typography.subheading, marginTop: 20, marginBottom: 8},
  action: {...typography.body, marginBottom: 6},
});
