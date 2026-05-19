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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {checkBackendHealth} from '../api/client';
import {useUserStore, UserRole} from '../store/userStore';
import {useSocketStore} from '../store/socketStore';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';


export const SettingsScreen = () => {
  const t = useT();
  const role = useUserStore(s => s.role);
  const language = useUserStore(s => s.language);
  const notifyAll = useUserStore(s => s.notifyAllSeverities);
  const pushOn = useUserStore(s => s.pushAlertsEnabled);
  const connected = useSocketStore(s => s.connected);
  
  const setRole = useUserStore(s => s.setRole);
  const setLanguage = useUserStore(s => s.setLanguage);
  const toggleNotifyAll = useUserStore(s => s.toggleNotifyAllSeverities);
  const togglePush = useUserStore(s => s.togglePushAlerts);
  
  const [healthy, setHealthy] = useState<boolean | null>(null);

  const ROLES = [
    {value: 'citizen' as UserRole, label: t('roleCitizen')},
    {value: 'operator' as UserRole, label: t('roleOperator')},
    {value: 'incident_commander' as UserRole, label: t('roleIncidentCommander')},
  ];

  useEffect(() => {
    checkBackendHealth().then(setHealthy);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settingsTitle') || 'Settings'}</Text>

        <Text style={styles.section}>{t('profile')}</Text>
        <View style={styles.card}>
          {ROLES.map((r, index) => (
            <Pressable
              key={r.value}
              style={[styles.itemRow, index !== ROLES.length - 1 && styles.borderBottom]}
              onPress={() => setRole(r.value)}>
              <Text style={typography.body}>{r.label}</Text>
              <View style={[styles.radio, role === r.value && styles.radioOn]}>
                {role === r.value && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>{t('notifications')}</Text>
        <View style={styles.card}>
          <View style={[styles.itemRow, styles.borderBottom]}>
            <Text style={typography.body}>{t('pushAlerts')}</Text>
            <Switch
              value={pushOn}
              onValueChange={togglePush}
              trackColor={{true: colors.blue, false: colors.elevated}}
              thumbColor={colors.text}
            />
          </View>
          <View style={styles.itemRow}>
            <Text style={typography.body}>{t('allSeverities')}</Text>
            <Switch
              value={notifyAll}
              onValueChange={toggleNotifyAll}
              trackColor={{true: colors.blue, false: colors.elevated}}
              thumbColor={colors.text}
            />
          </View>
        </View>

        <Text style={styles.section}>{t('language')}</Text>
        <View style={styles.card}>
          {(['en', 'ur'] as const).map((lang, index) => (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[styles.itemRow, index === 0 && styles.borderBottom]}>
              <Text style={typography.body}>{lang === 'en' ? 'English' : 'اردو'}</Text>
              {language === lang && <Icon name="check" size={20} color={colors.blue} />}
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>{t('about')}</Text>
        <View style={styles.card}>
          <View style={[styles.itemRow, styles.borderBottom]}>
            <Text style={typography.body}>{t('version')}</Text>
            <Text style={typography.label}>1.0.0</Text>
          </View>
          <View style={[styles.itemRow, styles.borderBottom]}>
            <Text style={typography.body}>{t('backend')}</Text>
            <View style={styles.statusBox}>
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
              <Text style={typography.label}>
                {healthy ? t('online') : healthy === false ? t('offline') : t('checking')}
              </Text>
            </View>
          </View>
          <View style={styles.itemRow}>
            <Text style={typography.body}>{t('websocket')}</Text>
            <View style={styles.statusBox}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: connected ? colors.green : colors.danger }
                ]}
              />
              <Text style={typography.label}>
                {connected ? t('connected') : t('disconnected')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  title: {...typography.display, marginBottom: spacing.s6},
  section: {...typography.subheading, marginTop: 32, marginBottom: 12, color: colors.muted},
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderStrong,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {
    borderColor: colors.blue,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {width: 8, height: 8, borderRadius: 4},
});

