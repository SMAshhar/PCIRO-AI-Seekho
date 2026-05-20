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
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useCrisisStore} from '../store/crisisStore';
import {crisisApi} from '../api/crisisApi';
import {CrisisCard} from '../components/CrisisCard';
import {IncidentBanner} from '../components/IncidentBanner';
import {useT} from '../utils/i18n';
import {colors, spacing, typography} from '../constants/theme';
import {config} from '../constants/config';
import {Severity} from '../types/models';

type Filter = 'all' | Severity | 'resolved';



export const CrisisFeedScreen = () => {
  const t = useT();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const crises = useCrisisStore(s => s.activeCrises);
  const [filter, setFilter] = useState<Filter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const FILTERS: {key: Filter; label: string}[] = useMemo(
    () => [
      {key: 'all', label: t('allTypes')},
      {key: 'critical', label: t('sevCritical')},
      {key: 'high', label: t('sevHigh')},
      {key: 'medium', label: t('sevMedium')},
      {key: 'low', label: t('sevLow')},
      {key: 'resolved', label: t('sevResolved')},
    ],
    [t],
  );

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
    try {
      const data = await crisisApi.getActiveCrises();
      useCrisisStore.getState().setCrises(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!config.USE_MOCK_DATA) {
        crisisApi.getActiveCrises().then(data => {
          useCrisisStore.getState().setCrises(data);
        });
      }
    }, []),
  );

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
        <Text style={styles.title}>{t('feedTitle') || 'PCIRO'}</Text>
        <Text style={styles.subtitle}>{t('liveOverview')}</Text>
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
    paddingVertical: spacing.s5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {...typography.display, fontSize: 24, letterSpacing: 0.5},
  subtitle: {
    ...typography.label,
    color: colors.muted,
    marginTop: 4,
  },
  chips: {maxHeight: 54, marginVertical: spacing.s4},
  chipsContent: {paddingHorizontal: spacing.s5, gap: 10, alignItems: 'center'},
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.blue,
  },
  list: {paddingTop: spacing.s2, paddingHorizontal: spacing.s5, paddingBottom: spacing.s8},
  empty: {...typography.body, color: colors.muted, textAlign: 'center', marginTop: 48},
});
