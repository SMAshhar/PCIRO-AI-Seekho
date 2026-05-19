import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {colors} from '../constants/theme';

export const LoadingSpinner: React.FC = () => (
  <View style={styles.wrap}>
    <ActivityIndicator size="large" color={colors.blue} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32},
});
