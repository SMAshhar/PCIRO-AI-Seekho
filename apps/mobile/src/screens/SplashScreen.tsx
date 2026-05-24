import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {crisisApi} from '../api/crisisApi';
import {devicesApi} from '../api/devicesApi';
import {useCrisisStore} from '../store/crisisStore';
import {useNotificationStore} from '../store/notificationStore';
import {usePushNotifications} from '../hooks/usePushNotifications';
import {config} from '../constants/config';
import {colors, spacing} from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const RADAR = 180;
// Pre-calculated ring geometry so StyleSheet stays static
const R0 = 56,  R0_OFFSET = (RADAR - R0)  / 2;
const R1 = 104, R1_OFFSET = (RADAR - R1) / 2;
const R2 = 152, R2_OFFSET = (RADAR - R2) / 2;

export const SplashScreen: React.FC<Props> = ({navigation}) => {
  usePushNotifications();

  // ── Shared values ────────────────────────────────────────────────────────────
  const pulse        = useSharedValue(0); // drives ring opacity
  const sweep        = useSharedValue(0); // drives sweep rotation
  const dotScale     = useSharedValue(1);
  const logoOpacity  = useSharedValue(0);
  const logoY        = useSharedValue(22);
  const tagOpacity   = useSharedValue(0);
  const statusOpacity = useSharedValue(0);

  // ── Animations ───────────────────────────────────────────────────────────────
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, {duration: 2000, easing: Easing.inOut(Easing.ease)}),
      -1,
      true,
    );
    sweep.value = withRepeat(
      withTiming(360, {duration: 3000, easing: Easing.linear}),
      -1,
      false,
    );
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.6, {duration: 700}),
        withTiming(1.0, {duration: 700}),
      ),
      -1,
      false,
    );
    logoOpacity.value  = withDelay(400,  withTiming(1, {duration: 600}));
    logoY.value        = withDelay(400,  withSpring(0, {damping: 14, stiffness: 90}));
    tagOpacity.value   = withDelay(800,  withTiming(1, {duration: 500}));
    statusOpacity.value = withDelay(1100, withTiming(1, {duration: 500}));
  }, [pulse, sweep, dotScale, logoOpacity, logoY, tagOpacity, statusOpacity]);

  // ── Data load (logic unchanged) ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const timeout = new Promise(r => setTimeout(r, config.SPLASH_MAX_MS));
      const load = (async () => {
        if (!config.USE_MOCK_DATA) {
          try {
            await devicesApi.register();
          } catch {
            // offline / server down — continue with cached feed
          }
        }
        const crises = await crisisApi.getActiveCrises();
        useCrisisStore.getState().setCrises(crises);
        const pending = crises.filter(
          c => c.status === 'awaiting_approval',
        ).length;
        if (pending > 0) {
          useNotificationStore.setState({pendingApprovals: pending});
        }
      })();
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

  // ── Animated styles ──────────────────────────────────────────────────────────
  // Rings share one pulse value; each uses a different interpolation range
  const ring0Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.2, 0.9]),
  }));
  const ring1Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.1, 0.6]),
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.05, 0.32]),
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${sweep.value}deg`}],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{scale: dotScale.value}],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{translateY: logoY.value}],
  }));

  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
  }));

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }));

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Top identity chip */}
      <Text style={styles.topLabel}>PCIRO · ISLAMABAD METRO · 2026</Text>

      {/* ── Center block ── */}
      <View style={styles.centerGroup}>
        {/* Radar */}
        <View style={styles.radarWrapper}>
          {/* Concentric rings */}
          <Animated.View style={[styles.ring, styles.ring0, ring0Style]} />
          <Animated.View style={[styles.ring, styles.ring1, ring1Style]} />
          <Animated.View style={[styles.ring, styles.ring2, ring2Style]} />

          {/* Sweep — container rotates; line inside goes from center → top */}
          <Animated.View style={[styles.sweepContainer, sweepStyle]}>
            {/* Wide soft glow behind the line (visible on both platforms) */}
            <View style={styles.sweepGlow} />
            {/* Sharp core line */}
            <View style={styles.sweepLine} />
          </Animated.View>

          {/* Center dot */}
          <Animated.View style={[styles.centerDot, dotStyle]} />
        </View>

        {/* Logo — no spaces in string; letterSpacing handles the look */}
        <Animated.Text style={[styles.logo, logoStyle]}>PCIRO</Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tag, tagStyle]}>
          Crisis Intelligence {'&'} Response Orchestrator
        </Animated.Text>

        {/* Status row */}
        <Animated.View style={[styles.statusSection, statusStyle]}>
          <View style={styles.statusRow}>
            <View style={styles.divider} />
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM ONLINE · ISB</Text>
            <View style={styles.divider} />
          </View>
        </Animated.View>
      </View>

      {/* Bottom build label */}
      <Text style={styles.buildLabel}>AI SEEKHO 2026 · HACKATHON BUILD</Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.void,
    alignItems: 'center',
    // space-between: topLabel at top, centerGroup in middle, buildLabel at bottom
    justifyContent: 'space-between',
    paddingVertical: spacing.s10,
    paddingHorizontal: spacing.s5,
  },

  topLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 2,
    color: colors.noise,
    textAlign: 'center',
  },

  // Stretches to full container width so status row dividers expand correctly
  centerGroup: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },

  // ── Radar ──
  radarWrapper: {
    width: RADAR,
    height: RADAR,
    alignSelf: 'center',
  },

  ring: {
    position: 'absolute',
    borderColor: colors.blue,
  },
  ring0: {
    width: R0,
    height: R0,
    borderRadius: R0 / 2,
    top: R0_OFFSET,
    left: R0_OFFSET,
    borderWidth: 2,
  },
  ring1: {
    width: R1,
    height: R1,
    borderRadius: R1 / 2,
    top: R1_OFFSET,
    left: R1_OFFSET,
    borderWidth: 1,
  },
  ring2: {
    width: R2,
    height: R2,
    borderRadius: R2 / 2,
    top: R2_OFFSET,
    left: R2_OFFSET,
    borderWidth: 1,
  },

  // sweepContainer is the same size as radarWrapper; rotation pivot = its center
  sweepContainer: {
    position: 'absolute',
    width: RADAR,
    height: RADAR,
    top: 0,
    left: 0,
  },
  // Line runs from the top edge to the center (pivot), sweeps as container rotates
  sweepLine: {
    position: 'absolute',
    width: 2,
    height: RADAR / 2,
    top: 0,
    left: RADAR / 2 - 1,
    backgroundColor: colors.blue,
  },
  // Wider, transparent copy behind the line — creates a soft glow without shadow API
  sweepGlow: {
    position: 'absolute',
    width: 14,
    height: RADAR / 2,
    top: 0,
    left: RADAR / 2 - 7,
    backgroundColor: colors.blue,
    opacity: 0.12,
  },

  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
    top: RADAR / 2 - 4,
    left: RADAR / 2 - 4,
  },

  // ── Text ──
  logo: {
    fontFamily: 'monospace',
    fontSize: 54,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 12,
    // Compensate for trailing letterSpacing so text appears visually centered
    paddingLeft: 12,
    marginTop: spacing.s8,
    textAlign: 'center',
  },

  tag: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: spacing.s3,
    lineHeight: 18,
  },

  // ── Status ──
  statusSection: {
    marginTop: spacing.s8,
    alignSelf: 'stretch',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  statusText: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '600',
    color: colors.muted,
    letterSpacing: 1.5,
  },

  buildLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1.5,
    color: colors.noise,
    textAlign: 'center',
  },
});
