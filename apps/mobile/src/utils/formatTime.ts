import {formatDistanceToNow, parseISO} from 'date-fns';

export const formatRelativeTime = (iso: string): string => {
  try {
    return formatDistanceToNow(parseISO(iso), {addSuffix: true});
  } catch {
    return 'recently';
  }
};
