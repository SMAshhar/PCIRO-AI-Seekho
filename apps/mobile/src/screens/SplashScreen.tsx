import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {crisisApi} from '../api/crisisApi';
import {useCrisisStore} from '../store/crisisStore';
import {useNotificationStore} from '../store/notificationStore';
import {usePushNotifications} from '../hooks/usePushNotifications';
import {config} from '../constants/config';
import {colors, spacing, typography} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({navigation}) => {
  usePushNotifications();
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, {duration: 1200}), -1, true);
  }, [pulse]);

  const ring1 = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{scale: 1 + pulse.value * 0.1}],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.7,
    transform: [{scale: 1.3 + pulse.value * 0.1}],
  }));
  const ring3 = useAnimatedStyle(() => ({
    opacity: pulse.value * 0.4,
    transform: [{scale: 1.6 + pulse.value * 0.1}],
  }));

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const timeout = new Promise(r => setTimeout(r, config.SPLASH_MAX_MS));
      const load = crisisApi.getActiveCrises().then(crises => {
        useCrisisStore.getState().setCrises(crises);
        const pending = crises.filter(
          c => c.status === 'awaiting_approval',
        ).length;
        if (pending > 0) {
          useNotificationStore.setState({pendingApprovals: pending});
        }
      });
      await Promise.race([load, timeout]);
      if (!cancelled) {
        navigation.replace('Main');
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.radar}>
        <Animated.View style={[styles.ring, ring1]} />
        <Animated.View style={[styles.ring, styles.ring2, ring2]} />
        <Animated.View style={[styles.ring, styles.ring3, ring3]} />
      </View>
      <Text style={styles.logo}>CIRO</Text>
      <Text style={styles.tagline}>
        From street complaint to coordinated response in under 60 seconds
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.s5,
  },
  logo: {...typography.display, fontSize: 36, marginTop: spacing.s8},
  tagline: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.s3,
  },
  radar: {width: 120, height: 120, justifyContent: 'center', alignItems: 'center'},
  ring: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.blue,
  },
  ring2: {width: 100, height: 100, borderRadius: 50},
  ring3: {width: 120, height: 120, borderRadius: 60},
});
