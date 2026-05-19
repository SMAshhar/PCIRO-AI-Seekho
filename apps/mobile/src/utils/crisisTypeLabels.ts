import {CrisisType} from '../types/models';
import {t} from './i18n';

export const getCrisisTypeLabel = (type: CrisisType): string => {
  switch (type) {
    case 'flood':
      return t('flood');
    case 'fire':
      return t('fire');
    case 'heatwave':
      return t('heatwave');
    case 'road_blockage':
      return t('road');
    case 'power_outage':
      return t('power');
    case 'air_quality':
      return t('air');
    case 'flash_flood':
      return t('flashFlood');
    case 'earthquake':
      return t('quake');
    case 'traffic_gridlock':
      return t('trafficGridlock');
    case 'sewage_overflow':
      return t('sewageOverflow');
    case 'unknown':
    default:
      return t('other');
  }
};
