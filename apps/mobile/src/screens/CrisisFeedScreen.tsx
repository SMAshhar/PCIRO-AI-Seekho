import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useCrisisStore} from '../store/crisisStore';
import {crisisApi} from '../api/crisisApi';
import {CrisisCard} from '../components/CrisisCard';
import {IncidentBanner} from '../components/IncidentBanner';
import {useT} from '../utils/i18n';
import {colors, spacing, typography} from '../constants/theme';
import {Severity} from '../types/models';

type Filter = 'all' | Severity | 'resolved';

const FILTERS: {key: Filter; label: string}[] = [
  {key: 'all', label: 'All'},
  {key: 'critical', label: 'Critical'},
  {key: 'high', label: 'High'},
  {key: 'medium', label: 'Medium'},
  {key: 'low', label: 'Low'},
  {key: 'resolved', label: 'Resolved'},
];

export const CrisisFeedScreen = () => {
  const t = useT();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const crises = useCrisisStore(s => s.activeCrises);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const critical = useMemo(
    () => crises.find(c => c.severity === 'critical' && c.status !== 'resolved'),
    [crises],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return crises;
    }
    if (filter === 'resolved') {
      return crises.filter(c => c.status === 'resolved');
    }
    return crises.filter(c => c.severity === filter);
  }, [crises, filter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await crisisApi.getActiveCrises();
    useCrisisStore.getState().setCrises(data);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {critical && (
        <IncidentBanner
          crisis={critical}
          onPress={() =>
            navigation.navigate('CrisisDetail', {crisisId: critical.event_id})
          }
        />
      )}
      <View style={styles.header}>
        <Text style={styles.title}>{t('feedTitle')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.chip, filter === f.key && styles.chipActive]}>
            <Text
              style={[
                typography.label,
                filter === f.key && {color: colors.blue},
              ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={item => item.event_id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{t('noCrises')}</Text>
        }
        renderItem={({item, index}) => (
          <CrisisCard
            crisis={item}
            index={index}
            onPress={() =>
              navigation.navigate('CrisisDetail', {crisisId: item.event_id})
            }
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.s5,
    paddingVertical: spacing.s4,
  },
  title: {...typography.display, fontSize: 22},
  chips: {maxHeight: 48, marginVertical: spacing.s3},
  chipsContent: {paddingHorizontal: spacing.s5, gap: 8},
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: {borderColor: colors.blue},
  list: {paddingHorizontal: spacing.s5, paddingBottom: spacing.s8},
  empty: {...typography.body, color: colors.muted, textAlign: 'center', marginTop: 48},
});
