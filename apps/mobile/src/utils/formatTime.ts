import {formatDistanceToNow, parseISO} from 'date-fns';
import {enUS, ur} from 'date-fns/locale';
import {useUserStore} from '../store/userStore';

export const formatRelativeTime = (iso: string): string => {
  try {
    const lang = useUserStore.getState().language;
    return formatDistanceToNow(parseISO(iso), {
      addSuffix: true,
      locale: lang === 'ur' ? ur : enUS,
    });
  } catch {
    return 'recently';
  }
};
