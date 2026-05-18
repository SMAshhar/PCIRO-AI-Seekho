import {useUserStore} from '../store/userStore';

const strings = {
  en: {
    feedTitle: 'CIRO',
    reportTitle: 'Report a Crisis',
    settingsTitle: 'Settings',
    submitReport: 'Submit Report',
    noCrises: 'No active crises in your area',
    offlineBanner: 'Offline — showing cached data',
    accessDenied: 'Access Denied',
    approve: 'APPROVE RESPONSE',
    reject: 'REJECT',
  },
  ur: {
    feedTitle: 'سی آئی آر او',
    reportTitle: 'بحران رپورٹ کریں',
    settingsTitle: 'ترتیبات',
    submitReport: 'رپورٹ جمع کریں',
    noCrises: 'آپ کے علاقے میں کوئی فعال بحران نہیں',
    offlineBanner: 'آف لائن — محفوظ ڈیٹا دکھایا جا رہا ہے',
    accessDenied: 'رسائی مسترد',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
  },
} as const;

export type I18nKey = keyof typeof strings.en;

export const t = (key: I18nKey): string => {
  const lang = useUserStore.getState().language;
  return strings[lang][key];
};

export const useT = () => {
  const lang = useUserStore(s => s.language);
  return (key: I18nKey) => strings[lang][key];
};
