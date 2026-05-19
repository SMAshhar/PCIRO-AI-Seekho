import React from 'react';
import {NavigationContainer, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {SplashScreen} from '../screens/SplashScreen';
import {MainTabNavigator} from './MainTabNavigator';
import {CrisisDetailScreen} from '../screens/CrisisDetailScreen';
import {AgentTraceScreen} from '../screens/AgentTraceScreen';
import {SimulationScreen} from '../screens/SimulationScreen';
import {IncidentCommanderScreen} from '../screens/IncidentCommanderScreen';
import {colors} from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.void,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.blue,
  },
};

export const AppNavigator = () => (
  <NavigationContainer theme={navTheme}>
    <Stack.Navigator screenOptions={{headerShown: false, animation: 'slide_from_right'}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="CrisisDetail" component={CrisisDetailScreen} />
      <Stack.Screen name="AgentTrace" component={AgentTraceScreen} />
      <Stack.Screen name="Simulation" component={SimulationScreen} />
      <Stack.Screen
        name="IncidentCommander"
        component={IncidentCommanderScreen}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
