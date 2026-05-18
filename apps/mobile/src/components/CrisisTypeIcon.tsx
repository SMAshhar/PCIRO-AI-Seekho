import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CrisisType} from '../types/models';
import {colors} from '../constants/theme';

const iconMap: Record<CrisisType, string> = {
  flood: 'water',
  fire: 'fire',
  heatwave: 'thermometer-high',
  road_blockage: 'road-variant',
  power_outage: 'lightning-bolt-off',
  air_quality: 'air-filter',
  flash_flood: 'weather-pouring',
  earthquake: 'earth',
  traffic_gridlock: 'traffic-cone',
  sewage_overflow: 'pipe-leak',
  unknown: 'alert-circle-outline',
};

interface Props {
  type: CrisisType;
  size?: number;
  color?: string;
}

export const CrisisTypeIcon: React.FC<Props> = ({
  type,
  size = 20,
  color = colors.blue,
}) => (
  <Icon name={iconMap[type] ?? 'alert'} size={size} color={color} />
);
