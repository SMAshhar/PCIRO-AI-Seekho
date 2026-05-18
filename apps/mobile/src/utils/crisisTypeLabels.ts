import {CrisisType} from '../types/models';

const labelsEn: Record<CrisisType, string> = {
  flood: 'Flooding',
  fire: 'Fire',
  heatwave: 'Heatwave',
  road_blockage: 'Road Blockage',
  power_outage: 'Power Outage',
  air_quality: 'Air Quality',
  flash_flood: 'Flash Flood',
  earthquake: 'Earthquake',
  traffic_gridlock: 'Traffic Gridlock',
  sewage_overflow: 'Sewage Overflow',
  unknown: 'Unknown',
};

export const getCrisisTypeLabel = (
  type: CrisisType,
  _lang: 'en' | 'ur' = 'en',
): string => labelsEn[type] ?? type;
