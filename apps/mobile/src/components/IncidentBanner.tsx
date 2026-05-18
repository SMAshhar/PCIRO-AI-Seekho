import React, {useEffect} from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CrisisEvent} from '../types/models';
import {colors} from '../constants/theme';
import {getCrisisTypeLabel} from '../utils/crisisTypeLabels';

interface Props {
  crisis: CrisisEvent;
  onPress: () => void;
}

export const IncidentBanner: React.FC<Props> = ({crisis, onPress}) => {
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 1000}),
        withTiming(0.85, {duration: 1000}),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({opacity: opacity.value}));

  return (
    <Animated.View style={animStyle}>
      <Pressable style={styles.banner} onPress={onPress}>
        <Icon name="alert-decagram" size={16} color={colors.text} />
        <Text style={styles.text} numberOfLines={1}>
          CRITICAL EVENT · {crisis.sector}{' '}
          {getCrisisTypeLabel(crisis.crisis_type)} · Tap to review
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    height: 48,
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
});
