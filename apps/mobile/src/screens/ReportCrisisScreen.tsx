import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Controller, useForm} from 'react-hook-form';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {reportApi} from '../api/reportApi';
import {waitForCrisisAfterReport} from '../api/pollCrisis';
import {useCrisisStore} from '../store/crisisStore';
import {useLocation} from '../hooks/useLocation';
import {useUserStore} from '../store/userStore';
import {CrisisType} from '../types/models';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';
import {config} from '../constants/config';


interface FormValues {
  text: string;
  crisisType: CrisisType;
}

export const ReportCrisisScreen = () => {
  const t = useT();
  const {location, loading: locLoading, error: locError, refresh: refreshLoc} = useLocation();
  const deviceId = useUserStore(s => s.deviceId);
  const hint = useUserStore(s => s.reportLanguageHint);
  
  const CRISIS_TYPES = [
    {type: 'flood' as CrisisType, label: t('flood')},
    {type: 'fire' as CrisisType, label: t('fire')},
    {type: 'heatwave' as CrisisType, label: t('heatwave')},
    {type: 'road_blockage' as CrisisType, label: t('road')},
    {type: 'power_outage' as CrisisType, label: t('power')},
    {type: 'air_quality' as CrisisType, label: t('air')},
    {type: 'earthquake' as CrisisType, label: t('quake')},
    {type: 'unknown' as CrisisType, label: t('other')},
  ];
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {control, handleSubmit, setValue, watch, reset, formState: {errors}} =
    useForm<FormValues>({
      defaultValues: {text: '', crisisType: 'flood'},
    });

  const crisisType = watch('crisisType');

  const placeholders: Record<string, string> = {
    en: t('describeHappening') + '...',
    ur: t('describeHappening') + '...',
    roman_ur: 'G-10 mein kya ho raha hai, likhein…',
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let photo_url: string | undefined;
      if (photoUri) {
        const up = await reportApi.uploadPhoto(photoUri);
        photo_url = up.photo_url;
      }
      const res = await reportApi.submitReport({
        text: values.text,
        crisis_type: values.crisisType,
        location: {
          lat: location.lat,
          lon: location.lon,
          sector: location.sector,
        },
        photo_url,
        device_id: deviceId,
      });
      if (!config.USE_MOCK_DATA) {
        const crisis = await waitForCrisisAfterReport(res.event_id);
        if (crisis) {
          useCrisisStore.getState().addOrUpdateCrisis(crisis);
        }
      }
      Alert.alert(
        'Report submitted',
        `Event: ${res.event_id}${res.status === 'processing' ? ' (processing)' : ''}`,
      );
      reset();
      setPhotoUri(null);
    } catch {
      Alert.alert('Error', 'Could not submit report. Check connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('reportTitle')}</Text>

        <Text style={styles.label}>{t('describeHappening')}</Text>
        <Controller
          control={control}
          name="text"
          rules={{required: 'Required', minLength: {value: 10, message: 'Min 10 chars'}}}
          render={({field: {onChange, value}}) => (
            <TextInput
              style={[styles.input, styles.multiline]}
              multiline
              value={value}
              onChangeText={onChange}
              placeholder={placeholders[hint]}
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              spellCheck={false}
              textContentType="none"
            />
          )}
        />
        {errors.text && <Text style={styles.error}>{errors.text.message}</Text>}

        <Text style={styles.hint}>EN · UR · Roman UR supported</Text>

        <Text style={[styles.label, {marginTop: 24}]}>{t('crisisType')}</Text>
        <View style={styles.chipGrid}>
          {CRISIS_TYPES.map(ct => (
            <Pressable
              key={ct.type}
              onPress={() => setValue('crisisType', ct.type)}
              style={[styles.typeChip, crisisType === ct.type && styles.typeChipOn]}>
              <Text style={[
                typography.body, 
                crisisType === ct.type ? {color: '#fff', fontWeight: '600'} : {color: colors.text}
              ]}>
                {ct.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.labelRow, {marginTop: 24}]}>
          <Text style={styles.label}>{t('location')}</Text>
          {locError && <Text style={styles.errorText}>{locError}</Text>}
        </View>
        <View style={styles.locationCard}>
          <View style={styles.locationLeft}>
            <View style={styles.iconBox}>
              <Icon name="map-marker-radius" size={22} color={colors.danger} />
            </View>
            <View>
              <Text style={typography.subheading}>{location.sector}</Text>
              <Text style={styles.coordText}>
                {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
              </Text>
            </View>
          </View>
          <Pressable onPress={refreshLoc} style={styles.refreshBtn}>
            {locLoading ? (
              <ActivityIndicator color={colors.blue} />
            ) : (
              <Icon name="crosshairs-gps" size={24} color={colors.blue} />
            )}
          </Pressable>
        </View>

        <Text style={[styles.label, {marginTop: 24}]}>{t('photoOptional')}</Text>
        <Pressable
          style={styles.photoBtn}
          onPress={() =>
            launchImageLibrary({mediaType: 'photo', maxWidth: 1200}, r => {
              if (r.assets?.[0]?.uri) {
                setPhotoUri(r.assets[0].uri);
              }
            })
          }>
          <Icon name="camera-plus-outline" size={24} color={colors.text} />
          <Text style={[typography.body, {marginLeft: 8}]}>{t('addPhoto')}</Text>
        </Pressable>
        {photoUri && (
          <Image source={{uri: photoUri}} style={styles.preview} />
        )}

        <Pressable
          style={[styles.submit, submitting && styles.submitDisabled]}
          disabled={submitting}
          onPress={handleSubmit(onSubmit)}>
          {submitting ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.submitText}>{t('submitReport')}</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.void},
  scroll: {padding: spacing.s5, paddingBottom: 40},
  title: {...typography.display, marginBottom: spacing.s6},
  label: {...typography.label, marginBottom: 8},
  labelRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    color: colors.text,
    padding: 16,
    fontSize: 15,
  },
  multiline: {minHeight: 120, textAlignVertical: 'top'},
  hint: {...typography.caption, marginTop: 8},
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  typeChipOn: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  chipOn: {
    borderColor: colors.blue,
    backgroundColor: colors.primaryGlow,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dangerGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coordText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  preview: {width: '100%', height: 160, borderRadius: 12, marginTop: 12},
  submit: {
    marginTop: 32,
    backgroundColor: colors.danger,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitDisabled: {opacity: 0.7},
  submitText: {...typography.body, fontWeight: '600', fontSize: 16},
  error: {color: colors.danger, fontSize: 12, marginTop: 6},
  errorText: {color: colors.danger, fontSize: 12},
});
