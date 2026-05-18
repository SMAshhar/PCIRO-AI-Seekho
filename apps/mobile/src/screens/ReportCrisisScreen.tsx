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
import {useForm, Controller} from 'react-hook-form';
import {launchImageLibrary} from 'react-native-image-picker';
import {reportApi} from '../api/reportApi';
import {useLocation} from '../hooks/useLocation';
import {useUserStore} from '../store/userStore';
import {CrisisType} from '../types/models';
import {ISLAMABAD_SECTORS} from '../constants/islamabadZones';
import {colors, spacing, typography} from '../constants/theme';
import {useT} from '../utils/i18n';

const CRISIS_TYPES: {type: CrisisType; label: string}[] = [
  {type: 'flood', label: 'Flood'},
  {type: 'fire', label: 'Fire'},
  {type: 'heatwave', label: 'Heatwave'},
  {type: 'road_blockage', label: 'Road'},
  {type: 'power_outage', label: 'Power'},
  {type: 'air_quality', label: 'Air'},
  {type: 'earthquake', label: 'Quake'},
  {type: 'unknown', label: 'Other'},
];

interface FormValues {
  text: string;
  crisisType: CrisisType;
}

export const ReportCrisisScreen = () => {
  const t = useT();
  const {location, loading: locLoading, setSector} = useLocation();
  const deviceId = useUserStore(s => s.deviceId);
  const hint = useUserStore(s => s.reportLanguageHint);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {control, handleSubmit, setValue, watch, reset, formState: {errors}} =
    useForm<FormValues>({
      defaultValues: {text: '', crisisType: 'flood'},
    });

  const crisisType = watch('crisisType');

  const placeholders: Record<string, string> = {
    en: 'Describe what is happening…',
    ur: 'بیان کریں کیا ہو رہا ہے…',
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
      Alert.alert('Report submitted', `ID: ${res.report_id}`);
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

        <Text style={styles.label}>Describe what&apos;s happening</Text>
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

        <Text style={styles.label}>Crisis Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CRISIS_TYPES.map(ct => (
            <Pressable
              key={ct.type}
              onPress={() => setValue('crisisType', ct.type)}
              style={[styles.chip, crisisType === ct.type && styles.chipOn]}>
              <Text style={typography.body}>{ct.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.label}>Location</Text>
        {locLoading ? (
          <ActivityIndicator color={colors.blue} />
        ) : (
          <Text style={typography.body}>
            📍 {location.sector}, Islamabad ({location.lat.toFixed(4)},{' '}
            {location.lon.toFixed(4)})
          </Text>
        )}
        <ScrollView horizontal style={{marginTop: 8}}>
          {ISLAMABAD_SECTORS.slice(0, 8).map(s => (
            <Pressable key={s} onPress={() => setSector(s)} style={styles.chip}>
              <Text style={typography.label}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[styles.label, {marginTop: 16}]}>Photo (optional)</Text>
        <Pressable
          style={styles.photoBtn}
          onPress={() =>
            launchImageLibrary({mediaType: 'photo', maxWidth: 1200}, r => {
              if (r.assets?.[0]?.uri) {
                setPhotoUri(r.assets[0].uri);
              }
            })
          }>
          <Text style={typography.body}>📷 Add Photo</Text>
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
  label: {...typography.label, marginBottom: 8, marginTop: 12},
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 12,
    fontSize: 14,
  },
  multiline: {minHeight: 120, textAlignVertical: 'top'},
  hint: {...typography.caption, marginTop: 6},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: {borderColor: colors.blue},
  photoBtn: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  preview: {width: '100%', height: 120, borderRadius: 8, marginTop: 8},
  submit: {
    marginTop: 24,
    backgroundColor: colors.danger,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitDisabled: {opacity: 0.7},
  submitText: {...typography.body, fontWeight: '600'},
  error: {color: colors.danger, fontSize: 12, marginTop: 4},
});
