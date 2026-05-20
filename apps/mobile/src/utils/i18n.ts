import {useUserStore} from '../store/userStore';

const strings = {
  en: {
    feedTitle: 'PCIRO',
    reportTitle: 'Report a Crisis',
    settingsTitle: 'Settings',
    submitReport: 'Submit Report',
    noCrises: 'No active crises in your area',
    offlineBanner: 'Offline — showing cached data',
    accessDenied: 'Access Denied',
    approve: 'APPROVE RESPONSE',
    reject: 'REJECT',
    
    // Roles
    roleCitizen: 'Citizen',
    roleOperator: 'Operator',
    roleIncidentCommander: 'Incident Commander',
    
    // Settings Screen
    profile: 'Profile',
    notifications: 'Notifications',
    pushAlerts: 'Push alerts in my area',
    allSeverities: 'All severities (not critical-only)',
    language: 'Language',
    about: 'About',
    version: 'Version',
    backend: 'Backend',
    online: 'Online',
    offline: 'Offline (mock mode)',
    checking: 'Checking…',
    websocket: 'WebSocket',
    connected: 'Connected',
    disconnected: 'Disconnected',
    
    // Report Screen
    describeHappening: 'Describe what\'s happening',
    crisisType: 'Crisis Type',
    location: 'Location',
    photoOptional: 'Photo (optional)',
    addPhoto: 'Add Photo',
    flood: 'Flood',
    fire: 'Fire',
    heatwave: 'Heatwave',
    road: 'Road',
    power: 'Power',
    air: 'Air',
    quake: 'Quake',
    other: 'Other',
    
    // Feed Screen
    liveOverview: 'Live Crisis Overview',
    allTypes: 'All',
    sevCritical: 'Critical',
    sevHigh: 'High',
    sevMedium: 'Medium',
    sevLow: 'Low',
    sevResolved: 'Resolved',
    corroborationScore: 'Corroboration Score',
    criticalEvent: 'CRITICAL EVENT',
    tapToReview: 'Tap to review',
    flashFlood: 'Flash Flood',
    trafficGridlock: 'Traffic Gridlock',
    sewageOverflow: 'Sewage Overflow',
    mockFloodTitle: 'G-10 Urban Flooding',
    mockTrafficTitle: 'I-8 Markaz Gridlock',
    mockHeatTitle: 'F-7 Heat Advisory',
    
    // Detail Screen
    evidenceBreakdown: 'Evidence Breakdown',
    impact: 'Impact',
    agentPipeline: 'Agent Pipeline',
    viewFullTrace: 'View Full Trace',
    viewSimulation: 'View Simulation',
    reviewApprove: 'Review & Approve',
    residents: 'residents',
    zones: 'zones',
  },
  ur: {
    feedTitle: 'پی سی آئی آر او',
    reportTitle: 'بحران رپورٹ کریں',
    settingsTitle: 'ترتیبات',
    submitReport: 'رپورٹ جمع کریں',
    noCrises: 'آپ کے علاقے میں کوئی فعال بحران نہیں',
    offlineBanner: 'آف لائن — محفوظ ڈیٹا دکھایا جا رہا ہے',
    accessDenied: 'رسائی مسترد',
    approve: 'منظور کریں',
    reject: 'مسترد کریں',
    
    // Roles
    roleCitizen: 'شہری',
    roleOperator: 'آپریٹر',
    roleIncidentCommander: 'انسیڈنٹ کمانڈر',
    
    // Settings Screen
    profile: 'پروفائل',
    notifications: 'اطلاعات',
    pushAlerts: 'میرے علاقے میں پش الرٹس',
    allSeverities: 'تمام شدتیں (صرف سنگین نہیں)',
    language: 'زبان',
    about: 'ہمارے بارے میں',
    version: 'ورژن',
    backend: 'بیک اینڈ',
    online: 'آن لائن',
    offline: 'آف لائن (فرضی موڈ)',
    checking: 'چیک کر رہا ہے…',
    websocket: 'ویب ساکٹ',
    connected: 'منسلک ہے',
    disconnected: 'منقطع ہے',
    
    // Report Screen
    describeHappening: 'بیان کریں کیا ہو رہا ہے',
    crisisType: 'بحران کی قسم',
    location: 'مقام',
    photoOptional: 'تصویر (اختیاری)',
    addPhoto: 'تصویر شامل کریں',
    flood: 'سیلاب',
    fire: 'آگ',
    heatwave: 'ہیٹ ویو',
    road: 'سڑک بلاک',
    power: 'بجلی کی بندش',
    air: 'خراب ہوا',
    quake: 'زلزلہ',
    other: 'دیگر',
    
    // Feed Screen
    liveOverview: 'لائیو بحران کا جائزہ',
    allTypes: 'تمام',
    sevCritical: 'سنگین',
    sevHigh: 'زیادہ',
    sevMedium: 'درمیانہ',
    sevLow: 'کم',
    sevResolved: 'حل شدہ',
    corroborationScore: 'تصدیقی سکور',
    criticalEvent: 'سنگین واقعہ',
    tapToReview: 'جائزہ لینے کے لیے دبائیں',
    flashFlood: 'سیلابی ریلا',
    trafficGridlock: 'ٹریفک جام',
    sewageOverflow: 'گٹر ابلنا',
    mockFloodTitle: 'سیکٹر جی-10 میں سیلابی صورتحال',
    mockTrafficTitle: 'آئی-8 مرکز میں ٹریفک جام',
    mockHeatTitle: 'ایف-7 شدید گرمی کا الرٹ',
    
    // Detail Screen
    evidenceBreakdown: 'شواہد کی تفصیل',
    impact: 'اثرات',
    agentPipeline: 'ایجنٹ پائپ لائن',
    viewFullTrace: 'مکمل ٹریس دیکھیں',
    viewSimulation: 'سیمولیشن دیکھیں',
    reviewApprove: 'جائزہ لیں اور منظور کریں',
    residents: 'رہائشی',
    zones: 'علاقے',
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
