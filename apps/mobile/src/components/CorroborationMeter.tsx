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
  const stroke = 12;
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
    <View style={styles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
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
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            rotation={160}
            origin={`${cx}, ${cy}`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[typography.score, {fontSize: 42, lineHeight: 46, fontWeight: '600'}]}>
            {Math.round(score)}
          </Text>
          <Text style={[typography.badge, {color: colors.muted, marginTop: 6, letterSpacing: 1.5}]}>
            {zone.label.toUpperCase()}
          </Text>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s2,
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
