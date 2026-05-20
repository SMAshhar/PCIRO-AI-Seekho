import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useCrisisDetail} from '../hooks/useCrisisDetail';
import {useUserStore} from '../store/userStore';
import {commanderApi} from '../api/commanderApi';
import {useNotificationStore} from '../store/notificationStore';
import {SeverityBadge} from '../components/SeverityBadge';
import {CorroborationMeter} from '../components/CorroborationMeter';
import {LoadingSpinner} from '../components/LoadingSpinner';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'IncidentCommander'>;

export const IncidentCommanderScreen: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const {crisisId, eventId} = route.params;
  const {crisis, loading} = useCrisisDetail(crisisId);
  const role = useUserStore(s => s.role);
  const t = useT();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  if (role !== 'incident_commander') {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.denied}>{t('accessDenied')}</Text>
      </SafeAreaView>
    );
  }

  if (loading || !crisis) {
    return <LoadingSpinner />;
  }

  const confirm = (title: string, onOk: () => void) => {
    Alert.alert(title, 'This action cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Confirm', style: 'destructive', onPress: onOk},
    ]);
  };

  const approve = () => {
    confirm('Approve response?', async () => {
      setBusy(true);
      try {
        await commanderApi.approve(eventId, note);
        useNotificationStore.getState().decrementPending();
        navigation.navigate('Main');
      } finally {
        setBusy(false);
      }
    });
  };

  const reject = () => {
    confirm('Reject response plan?', async () => {
      setBusy(true);
      try {
        await commanderApi.reject(eventId, note, 'Rejected by commander');
        useNotificationStore.getState().decrementPending();
        navigation.navigate('Main');
      } finally {
        setBusy(false);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.alertBar}>
        <Text style={styles.alertText}>⚠ INCIDENT COMMANDER REVIEW</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SeverityBadge severity={crisis.severity} />
        <Text style={styles.title}>{crisis.summary || crisis.title}</Text>
        <CorroborationMeter score={crisis.corroboration_score} size={140} />
        {crisis.confidence != null && (
          <Text style={typography.label}>
            Confidence: {Math.round(crisis.confidence * 100)}%
          </Text>
        )}

        <Text style={styles.section}>Evidence Summary</Text>
        {crisis.sources?.map(s => (
          <Text key={s.source_name} style={typography.body}>
            • {s.source_name}: {s.score_contribution}/{s.max_score}{' '}
            {s.is_corroborating ? '✓' : '○'}
          </Text>
        ))}

        <Text style={styles.section}>Proposed Actions</Text>
        {crisis.proposed_actions?.map((a, i) => (
          <Text key={i} style={typography.body}>
            • {a}
          </Text>
        ))}

        <Text style={styles.section}>Impact</Text>
        <Text style={typography.body}>
          {crisis.impact_assessment?.affected_population?.toLocaleString()} residents,{' '}
          {crisis.impact_assessment?.affected_sectors?.length} zones
        </Text>

        <Text style={[styles.section, {marginTop: 16}]}>Add note (optional)</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="Audit log note…"
          placeholderTextColor={colors.muted}
          multiline
        />

        <Pressable
          style={[styles.approve, busy && styles.disabled]}
          disabled={busy}
          onPress={approve}>
          <Text style={styles.approveText}>{t('approve')}</Text>
        </Pressable>
        <Pressable
          style={[styles.reject, busy && styles.disabled]}
          disabled={busy}
          onPress={reject}>
          <Text style={styles.rejectText}>{t('reject')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  alertBar: {backgroundColor: colors.danger, padding: 14},
  alertText: {color: colors.text, fontWeight: '700', fontSize: 13, textAlign: 'center'},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  title: {...typography.display, fontSize: 22, marginTop: 12},
  section: {...typography.subheading, marginTop: 20, marginBottom: 8},
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  approve: {
    marginTop: 24,
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: {color: colors.text, fontWeight: '600', fontSize: 14},
  reject: {
    marginTop: 12,
    backgroundColor: 'rgba(230,57,70,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.4)',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {color: colors.danger, fontWeight: '600', fontSize: 14},
  disabled: {opacity: 0.6},
  denied: {...typography.heading, textAlign: 'center', marginTop: 80},
});
