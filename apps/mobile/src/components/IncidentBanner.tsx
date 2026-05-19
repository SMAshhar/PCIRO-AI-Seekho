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
import {useT} from '../utils/i18n';

interface Props {
  crisis: CrisisEvent;
  onPress: () => void;
}

export const IncidentBanner: React.FC<Props> = ({crisis, onPress}) => {
  const t = useT();
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
        <Icon name="alert-decagram" size={20} color={colors.text} />
        <Text style={styles.text} numberOfLines={2}>
          {t('criticalEvent')} · {crisis.sector} ·{' '}
          {getCrisisTypeLabel(crisis.crisis_type)} · {t('tapToReview')}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    minHeight: 56,
    backgroundColor: colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    elevation: 8,
    shadowColor: colors.dangerGlow,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
