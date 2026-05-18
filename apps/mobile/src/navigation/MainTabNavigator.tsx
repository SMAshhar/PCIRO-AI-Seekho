import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {StyleSheet, Text, View} from 'react-native';
import {MainTabParamList} from './types';
import {CrisisFeedScreen} from '../screens/CrisisFeedScreen';
import {ReportCrisisScreen} from '../screens/ReportCrisisScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {colors} from '../constants/theme';
import {useNotificationStore} from '../store/notificationStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const pending = useNotificationStore(s => s.pendingApprovals);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.blue,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
      }}>
      <Tab.Screen
        name="Feed"
        component={CrisisFeedScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <View>
              <Icon name="alert-circle-outline" size={size} color={color} />
              {pending > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pending}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportCrisisScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="plus-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navy,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  tabLabel: {fontSize: 11, fontWeight: '500'},
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {color: colors.text, fontSize: 10, fontWeight: '600'},
});
