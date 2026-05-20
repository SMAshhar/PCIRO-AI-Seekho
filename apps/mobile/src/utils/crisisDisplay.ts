import {CrisisEvent} from '../types/models';
import {getCrisisTypeLabel} from './crisisTypeLabels';

const extractOriginalText = (crisis: CrisisEvent): string => {
  const nlp = crisis.agent_trace?.find(s => s.agent_name === 'Roman Urdu NLP');
  if (!nlp?.raw_output) {
    return '';
  }
  try {
    const parsed = JSON.parse(nlp.raw_output) as {original_text?: string};
    return parsed.original_text?.trim() ?? '';
  } catch {
    return '';
  }
};

/** True when API used legacy `title = "{sector} {crisis type}"` instead of report text. */
const isLegacyLocationTitle = (crisis: CrisisEvent, title: string): boolean => {
  const sector = crisis.sector?.trim();
  if (!sector) {
    return false;
  }
  const typeLabel = getCrisisTypeLabel(crisis.crisis_type);
  const legacy = `${sector} ${typeLabel}`;
  return title === legacy || title === `${sector} ${crisis.crisis_type.replace(/_/g, ' ')}`;
};

/** Citizen report text for feed/detail headlines (not location or AI summary). */
export const getReportDescription = (crisis: CrisisEvent): string => {
  const fromField = crisis.report_description?.trim();
  if (fromField) {
    return fromField;
  }

  const fromNlp = extractOriginalText(crisis);
  if (fromNlp) {
    return fromNlp;
  }

  const title = crisis.title?.trim();
  if (title && !isLegacyLocationTitle(crisis, title)) {
    return title;
  }

  return '';
};
