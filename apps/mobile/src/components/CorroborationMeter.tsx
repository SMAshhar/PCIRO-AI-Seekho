import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {colors, spacing, typography} from '../constants/theme';
import {getScoreZone, interpolateScoreColor} from '../utils/scoreZone';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  score: number;
  size?: number;
  animated?: boolean;
}

export const CorroborationMeter: React.FC<Props> = ({
  score,
  size = 160,
  animated = true,
}) => {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const arcLength = 220;
  const circumference = 2 * Math.PI * r;
  const maxSweep = (arcLength / 360) * circumference;

  const progress = useSharedValue(animated ? 0 : score);
  const zone = getScoreZone(score);
  const arcColor = interpolateScoreColor(score);

  useEffect(() => {
    if (animated) {
      progress.value = withTiming(score, {
        duration: 1200,
        easing: Easing.bezier(0.32, 0.72, 0, 1),
      });
    } else {
      progress.value = score;
    }
  }, [score, animated, progress]);

  const animatedProps = useAnimatedProps(() => {
    const dash = (progress.value / 100) * maxSweep;
    return {
      strokeDashoffset: circumference - dash,
    };
  });

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={colors.border}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${maxSweep} ${circumference}`}
            rotation={160}
            origin={`${cx}, ${cy}`}
          />
          <AnimatedCircle
            cx={cx}
            cy={cy}
            r={r}
            stroke={arcColor}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${maxSweep} ${circumference}`}
            animatedProps={animatedProps}
            rotation={160}
            origin={`${cx}, ${cy}`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={typography.score}>{Math.round(score)}</Text>
          <Text style={[typography.badge, {color: colors.muted, marginTop: 4}]}>
            {zone.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'center',
  },
  inner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.s4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
