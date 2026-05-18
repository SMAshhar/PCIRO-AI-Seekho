import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import {colors, typography} from '../constants/theme';

interface Props {
  label: string;
  score: number;
  maxScore: number;
  index?: number;
}

export const ScoreBar: React.FC<Props> = ({
  label,
  score,
  maxScore,
  index = 0,
}) => {
  const progress = useSharedValue(0);
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  useEffect(() => {
    progress.value = withDelay(index * 80, withTiming(pct, {duration: 600}));
  }, [pct, index, progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={typography.body}>{label}</Text>
        <Text style={styles.fraction}>
          {score} / {maxScore}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            barStyle,
            {backgroundColor: score > 0 ? colors.blue : colors.noise},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {marginBottom: 12},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  fraction: {...typography.label, fontFamily: 'monospace'},
  track: {
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.void,
    overflow: 'hidden',
  },
  fill: {height: '100%', borderRadius: 4},
});
