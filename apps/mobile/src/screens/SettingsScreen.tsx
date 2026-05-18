import React, {useEffect, useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {checkBackendHealth} from '../api/client';
import {useUserStore, UserRole} from '../store/userStore';
import {useSocketStore} from '../store/socketStore';
import {ISLAMABAD_SECTORS} from '../constants/islamabadZones';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';

const ROLES: {value: UserRole; label: string}[] = [
  {value: 'citizen', label: 'Citizen'},
  {value: 'operator', label: 'Operator'},
  {value: 'incident_commander', label: 'Incident Commander'},
];

export const SettingsScreen = () => {
  const t = useT();
  const role = useUserStore(s => s.role);
  const language = useUserStore(s => s.language);
  const sectors = useUserStore(s => s.subscribedSectors);
  const notifyAll = useUserStore(s => s.notifyAllSeverities);
  const pushOn = useUserStore(s => s.pushAlertsEnabled);
  const connected = useSocketStore(s => s.connected);
  const setRole = useUserStore(s => s.setRole);
  const setLanguage = useUserStore(s => s.setLanguage);
  const setSubscribedSectors = useUserStore(s => s.setSubscribedSectors);
  const toggleNotifyAll = useUserStore(s => s.toggleNotifyAllSeverities);
  const togglePush = useUserStore(s => s.togglePushAlerts);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setHealthy);
  }, []);

  const toggleSector = (s: string) => {
    if (sectors.includes(s)) {
      setSubscribedSectors(sectors.filter(x => x !== s));
    } else {
      setSubscribedSectors([...sectors, s]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('settingsTitle')}</Text>

        <Text style={styles.section}>Profile</Text>
        {ROLES.map(r => (
          <Pressable
            key={r.value}
            style={styles.row}
            onPress={() => setRole(r.value)}>
            <View style={[styles.radio, role === r.value && styles.radioOn]} />
            <Text style={typography.body}>{r.label}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Notifications</Text>
        <View style={styles.row}>
          <Text style={typography.body}>Push alerts in my area</Text>
          <Switch
            value={pushOn}
            onValueChange={togglePush}
            trackColor={{true: colors.blue}}
          />
        </View>
        <View style={styles.row}>
          <Text style={typography.body}>All severities (not critical-only)</Text>
          <Switch
            value={notifyAll}
            onValueChange={toggleNotifyAll}
            trackColor={{true: colors.blue}}
          />
        </View>

        <Text style={styles.section}>Subscribed sectors</Text>
        <View style={styles.sectorWrap}>
          {ISLAMABAD_SECTORS.slice(0, 12).map(s => (
            <Pressable
              key={s}
              onPress={() => toggleSector(s)}
              style={[styles.chip, sectors.includes(s) && styles.chipOn]}>
              <Text style={typography.label}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Language</Text>
        <View style={styles.row}>
          {(['en', 'ur'] as const).map(lang => (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[styles.langBtn, language === lang && styles.chipOn]}>
              <Text style={typography.body}>{lang === 'en' ? 'English' : 'اردو'}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>About</Text>
        <Text style={typography.label}>Version 1.0.0</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor:
                  healthy === null
                    ? colors.amber
                    : healthy
                      ? colors.green
                      : colors.danger,
              },
            ]}
          />
          <Text style={typography.body}>
            Backend {healthy ? 'online' : healthy === false ? 'offline (mock mode)' : 'checking…'}
          </Text>
        </View>
        <Text style={typography.label}>
          WebSocket {connected ? 'connected' : 'disconnected'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  title: {...typography.display, marginBottom: spacing.s6},
  section: {...typography.subheading, marginTop: 24, marginBottom: 12},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.muted,
    marginRight: 10,
  },
  radioOn: {borderColor: colors.blue, backgroundColor: colors.blue},
  sectorWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {borderColor: colors.blue},
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8},
  dot: {width: 10, height: 10, borderRadius: 5},
});
