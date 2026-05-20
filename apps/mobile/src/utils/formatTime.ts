import {formatDistanceToNow, parseISO} from 'date-fns';
import {enUS} from 'date-fns/locale';

export const formatRelativeTime = (iso: string): string => {
  try {
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: enUS,
    });
  } catch {
    return 'recently';
  }
};
