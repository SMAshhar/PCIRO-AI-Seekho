import {Severity} from '../types/models';
import {severity as severityColors} from '../constants/theme';

export const getSeverityColor = (s: Severity): string => severityColors[s];
