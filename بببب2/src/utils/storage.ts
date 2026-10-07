import { 
  UserProfile, 
  BacSubject, 
  MonthData, 
  ScheduleItem, 
  PomodoroStats, 
  AppSettings,
  TodoItem,
  WorkspaceItem,
  SavedAccount
} from '../types';

export const DEFAULT_AVATAR = '/src/assets/images/anime_study_girl_portrait_1790685287066.jpg';
export const DEFAULT_BANNER = '/src/assets/images/anime_pastel_hero_banner_1790685276337.jpg';
export const CHIBI_MASCOT = '/src/assets/images/anime_chibi_mascot_dessert_1790685297162.jpg';
export const POLAROID_ART = '/src/assets/images/anime_aesthetic_polaroid_art_1790685307808.jpg';

export const DEFAULT_WORKSPACE_ITEMS: WorkspaceItem[] = [
  {
    id: 'ws-table-1',
    title: 'جدول مقارنة واستنتاج المفاهيم',
    type: 'table',
    category: 'مقارنات',
    tableData: {
      headers: ['المفهوم / النظرية', 'المادة والشعبة', 'الخصائص وأهم النقاط', 'ملاحظات وتطبيقات'],
      rows: [
        ['المتتاليات الحسابية', 'الرياضيات', 'Un = U0 + n*r / Un = Up + (n-p)*r', 'تذكر شرط الأساس r'],
        ['المتتاليات الهندسية', 'الرياضيات', 'Vn = V0 * q^n', 'تذكر دراسة التقارب'],
        ['الأكسدة والإرجاع', 'العلوم الفيزيائية', 'المؤكسد يكتسب إلكترونات والمرجع يفقدها', 'معادلة النصفية وتفاعل الأكسدة الإرجاعية'],
        ['ظاهرة الاستنساخ', 'علوم الطبيعة والحياة', 'تتم في النواة وتتطلب ARN بوليمراز وATP', 'نضج الـ ARNm وخروجه للترجمة'],
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-check-1',
    title: 'قائمة مراجعة المواد الأساسية',
    type: 'checklist',
    category: 'مراجعة',
    checklistData: [
      { id: 'chk-1', text: 'حل موضوعين نموذجيين في الرياضيات مع ضبط الوقت', isDone: false },
      { id: 'chk-2', text: 'مراجعة تواريخ وشخصيات الوحدة الأولى في التاريخ', isDone: false },
      { id: 'chk-3', text: 'كتابة مقال فلسفي حول الحرية والمسؤولية', isDone: false },
      { id: 'chk-4', text: 'حفظ آيات وأحاديث العلوم الإسلامية المقررة', isDone: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ws-note-1',
    title: 'مساحة حرة للملاحظات والأفكار',
    type: 'note',
    category: 'عام',
    content: 'مساحة حرة لكتابة كل ما تحتاجه للتحضير للبكالوريا: استنتاجات سريعة، أفكار مقالات، ملاحظات من الأساتذة، وتدوين القوانين المعقدة.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  loginMethod: 'guest',
  avatar: DEFAULT_AVATAR,
  banner: DEFAULT_BANNER,
  homeBanner: DEFAULT_BANNER,
  stream: '',
  motto: '',
};

// 9 required BAC subjects with lessons set to 'not_started' and no targetScore
export const DEFAULT_BAC_SUBJECTS: BacSubject[] = [
  {
    id: 'arabic',
    code: 'AR',
    name: 'اللغة العربية وآدابها',
    nameEn: 'Arabic Literature',
    coefficient: 3,
    units: [
      {
        id: 'ar-u1',
        title: 'المحور الأول: الشعر والمدائح النبوية والزهد والمنفى',
        lessons: [
          { id: 'ar-l1', name: 'شعر المديح النبوي والزهد (عصر الانحطاط)', status: 'not_started' },
          { id: 'ar-l2', name: 'شعر المنفى والحنين إلى الوطن (مدرسة الإحياء والبعث)', status: 'not_started' },
          { id: 'ar-l3', name: 'شعر المهجر والرابطة القلمية والنزعة الإنسانية', status: 'not_started' },
        ],
      },
      {
        id: 'ar-u2',
        title: 'المحور الثاني: النثر العلمي وشعر الالتزام والقضية الفلسطينية',
        lessons: [
          { id: 'ar-l4', name: 'النثر العلمي المتأدب لرواد الإصلاح', status: 'not_started' },
          { id: 'ar-l5', name: 'شعر الالتزام والقضية الفلسطينية والثورة الجزائرية', status: 'not_started' },
          { id: 'ar-l6', name: 'ظاهرة الرمز والأسطورة والحزن والألم في الشعر الحر', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'math',
    code: 'MATH',
    name: 'الرياضيات',
    nameEn: 'Mathematics',
    coefficient: 5,
    units: [
      {
        id: 'm-u1',
        title: 'المحور الأول: الدوال العددية والنهايات والاشتقاقية',
        lessons: [
          { id: 'm-l1', name: 'الدوال العددية وحساب النهايات وإزالة حالات عدم التعيين', status: 'not_started' },
          { id: 'm-l2', name: 'الدالة الأسية واللوغاريتمية النيبيرية ودراستها الشاملة', status: 'not_started' },
          { id: 'm-l3', name: 'الاستمرارية ونظرية القيم المتوسطة ونقاط الانعطاف', status: 'not_started' },
        ],
      },
      {
        id: 'm-u2',
        title: 'المحور الثاني: المتتاليات العددية والحساب التكاملي',
        lessons: [
          { id: 'm-l4', name: 'المتتاليات الحسابية والهندسية والبرهان بالتراجع', status: 'not_started' },
          { id: 'm-l5', name: 'الدوال الأصلية والحساب التكاملي وحساب المساحات', status: 'not_started' },
          { id: 'm-l6', name: 'الاحتمالات والمتغير العشوائي والتوزيعات', status: 'not_started' },
          { id: 'm-l7', name: 'الأعداد المركبة والتحويلات النقطية', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'physics',
    code: 'PHYS',
    name: 'العلوم الفيزيائية',
    nameEn: 'Physics & Chemistry',
    coefficient: 5,
    units: [
      {
        id: 'ph-u1',
        title: 'الكيمياء: المتابعة الزمنية والتحولات النووية والأحماض والأسس',
        lessons: [
          { id: 'ph-l1', name: 'الوحدة 1: المتابعة الزمنية لتحول كيميائي في وسط مائي', status: 'not_started' },
          { id: 'ph-l2', name: 'الوحدة 2: التحولات النووية (النشاط الإشعاعي وطاقة الربط)', status: 'not_started' },
          { id: 'ph-l3', name: 'الوحدة 4: تطور جملة كيميائية نحو حالة التوازن (الأحماض والأسس)', status: 'not_started' },
          { id: 'ph-l4', name: 'الوحدة 6: مراقبة تطور جملة كيميائية (الأسترة)', status: 'not_started' },
        ],
      },
      {
        id: 'ph-u2',
        title: 'الفيزياء: الظواهر الكهربائية والميكانيك',
        lessons: [
          { id: 'ph-l5', name: 'الوحدة 3: الظواهر الكهربائية (ثنائي القطب RC و RL)', status: 'not_started' },
          { id: 'ph-l6', name: 'الوحدة 5: تطور جملة ميكانيكية (الأقمار والمقذوفات والمستوي)', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'natural_sciences',
    code: 'SCI',
    name: 'علوم الطبيعة والحياة',
    nameEn: 'Natural Sciences',
    coefficient: 6,
    units: [
      {
        id: 'sc-u1',
        title: 'المجال الأول: التخصص الوظيفي للبروتينات',
        lessons: [
          { id: 'sc-l1', name: 'الوحدة 1: آليات تركيب البروتين (الاستنساخ والترجمة)', status: 'not_started' },
          { id: 'sc-l2', name: 'الوحدة 2: العلاقة بين بنية ووظيفة البروتين', status: 'not_started' },
          { id: 'sc-l3', name: 'الوحدة 3: النشاط الإنزيمي للبروتينات', status: 'not_started' },
          { id: 'sc-l4', name: 'الوحدة 4: دور البروتينات في الدفاع عن الذات (المناعة)', status: 'not_started' },
          { id: 'sc-l5', name: 'الوحدة 5: دور البروتينات في الاتصال العصبي', status: 'not_started' },
        ],
      },
      {
        id: 'sc-u2',
        title: 'المجال الثاني: التحولات الطاقوية',
        lessons: [
          { id: 'sc-l6', name: 'آليات تحويل الطاقة الضوئية إلى كامنة (التركيب الضوئي)', status: 'not_started' },
          { id: 'sc-l7', name: 'آليات تحويل الطاقة الكامنة في الجزيئات إلى ATP (التنفس والتخمر)', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'english',
    code: 'ENG',
    name: 'اللغة الإنجليزية',
    nameEn: 'English Language',
    coefficient: 2,
    units: [
      {
        id: 'en-u1',
        title: 'Core Units',
        lessons: [
          { id: 'en-l1', name: 'Unit 1: Ancient Civilizations (Rise and Fall)', status: 'not_started' },
          { id: 'en-l2', name: 'Unit 2: Ethics in Business (Anti-Corruption)', status: 'not_started' },
          { id: 'en-l3', name: 'Unit 3: Education in the World', status: 'not_started' },
          { id: 'en-l4', name: 'Unit 4: Safety First & Advertising', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'french',
    code: 'FR',
    name: 'اللغة الفرنسية',
    nameEn: 'French Language',
    coefficient: 2,
    units: [
      {
        id: 'fr-u1',
        title: 'Types de Textes',
        lessons: [
          { id: 'fr-l1', name: 'Le Texte Historique (Témoignages & Visée communicative)', status: 'not_started' },
          { id: 'fr-l2', name: 'Le Texte Argumentatif / Débat d’idées', status: 'not_started' },
          { id: 'fr-l3', name: 'Le Texte Exhortatif (L’Appel)', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'islamic',
    code: 'ISL',
    name: 'العلوم الإسلامية',
    nameEn: 'Islamic Education',
    coefficient: 2,
    units: [
      {
        id: 'is-u1',
        title: 'دروس العقيدة والشريعة والمعاملات',
        lessons: [
          { id: 'is-l1', name: 'العقيدة الإسلامية وأثرها على الفرد والمجتمع', status: 'not_started' },
          { id: 'is-l2', name: 'وسائل القرآن الكريم في تثبيت العقيدة الإسلامية', status: 'not_started' },
          { id: 'is-l3', name: 'الإسلام والرسالات السماوية', status: 'not_started' },
          { id: 'is-l4', name: 'مقاصد الشريعة الإسلامية', status: 'not_started' },
          { id: 'is-l5', name: 'منهج الإسلام في محاربة الانحراف والجريمة', status: 'not_started' },
          { id: 'is-l6', name: 'المساواة أمام أحكام الشريعة والشفاعة', status: 'not_started' },
          { id: 'is-l7', name: 'الصحة النفسية والجسمية في القرآن', status: 'not_started' },
          { id: 'is-l8', name: 'مصادر التشريع الإسلامي: الإجماع، القياس، المصلحة', status: 'not_started' },
          { id: 'is-l9', name: 'الربا والمعاملات المالية المعاصرة', status: 'not_started' },
          { id: 'is-l10', name: 'المعاملات المالية الجائزة: المرابحة والصرف', status: 'not_started' },
          { id: 'is-l11', name: 'الحرية الشخصية وارتباطها بحقوق الآخرين', status: 'not_started' },
          { id: 'is-l12', name: 'أحكام الأسرة: النسب والتبني والكفالة', status: 'not_started' },
          { id: 'is-l13', name: 'الميراث في الإسلام وأصحاب الفروض', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'history_geo',
    code: 'HG',
    name: 'التاريخ والجغرافيا',
    nameEn: 'History & Geography',
    coefficient: 2,
    units: [
      {
        id: 'hg-u1',
        title: 'التاريخ: الحرب الباردة والثورة التحريرية الجزائرية',
        lessons: [
          { id: 'hg-l1', name: 'بروز الصراع وتشكل العالم واستراتيجيات القطبين', status: 'not_started' },
          { id: 'hg-l2', name: 'الأزمات الدولية في ظل الحرب الباردة', status: 'not_started' },
          { id: 'hg-l3', name: 'التعايش السلمي وحركة عدم الانحياز', status: 'not_started' },
          { id: 'hg-l4', name: 'من الثنائية إلى الأحادية وتفكك الكتلة الشرقية', status: 'not_started' },
          { id: 'hg-l5', name: 'العمل المسلح واستراتيجية الثورة داخلياً وخارجياً', status: 'not_started' },
          { id: 'hg-l6', name: 'استعادة السيادة الوطنية وبناء الدولة الجزائرية', status: 'not_started' },
        ],
      },
      {
        id: 'hg-u2',
        title: 'الجغرافيا: الاقتصاد العالمي والقوى الكبرى',
        lessons: [
          { id: 'hg-l7', name: 'إشكالية التقدم والتخلف ومؤشرات التنمية', status: 'not_started' },
          { id: 'hg-l8', name: 'المبادلات والتنقلات العالمية (البترول والقمح والأموال)', status: 'not_started' },
          { id: 'hg-l9', name: 'القوى الاقتصادية الكبرى (أمريكا، أوروبا، شرق آسيا)', status: 'not_started' },
          { id: 'hg-l10', name: 'الاقتصاد الجزائري والرهانات التنموية', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
  {
    id: 'philosophy',
    code: 'PHIL',
    name: 'الفلسفة',
    nameEn: 'Philosophy',
    coefficient: 2,
    units: [
      {
        id: 'ph-u1',
        title: 'الإشكاليات الفلسفية والمقالات الأساسية',
        lessons: [
          { id: 'ph-l1', name: 'المشكلة والإشكالية والفرق بين السؤال العلمي والفلسفي', status: 'not_started' },
          { id: 'ph-l2', name: 'فلسفة الرياضيات وأصل المفاهيم الرياضية', status: 'not_started' },
          { id: 'ph-l3', name: 'فلسفة علوم المادة الجامدة والحية', status: 'not_started' },
          { id: 'ph-l4', name: 'فلسفة العلوم الإنسانية: التاريخ وعلم النفس', status: 'not_started' },
          { id: 'ph-l5', name: 'الشعور واللاشعور والحرية والمسؤولية', status: 'not_started' },
        ],
      },
    ],
    notes: '',
  },
];

const MONTH_NAMES = [
  { ar: 'سبتمبر', en: 'September', season: 'خريف', quote: 'بداية مشوار البكالوريا بخطى واثقة وعزيمة لا تلين' },
  { ar: 'أكتوبر', en: 'October', season: 'خريف', quote: 'الاستمرارية سر التفوق، كل تمرين هو خطوة نحو الهدف' },
  { ar: 'نوفمبر', en: 'November', season: 'خريف', quote: 'تنظيم الدروس بانتظام يخفف الضغط ويصنع الفارق' },
  { ar: 'ديسمبر', en: 'December', season: 'شتاء', quote: 'تقييم الفصل الأول ومعالجة الثغرات بدقة' },
  { ar: 'جانفي', en: 'January', season: 'شتاء', quote: 'انطلاقة قوية في الفصل الثاني بطاقة متجددة' },
  { ar: 'فيفري', en: 'February', season: 'شتاء', quote: 'مضاعفة حل المسائل والمواضيع النموذجية' },
  { ar: 'مارس', en: 'March', season: 'ربيع', quote: 'اختبارات الفصل الثاني وقطف ثمار المجهود اليومي' },
  { ar: 'أفريل', en: 'April', season: 'ربيع', quote: 'مرحلة المراجعة الشاملة وحل البكالوريات السابقة' },
  { ar: 'ماي', en: 'May', season: 'ربيع', quote: 'البكالوريا التجريبية والضبط النهائي للمعارف' },
  { ar: 'جوان', en: 'June', season: 'صيف', quote: 'أيام الامتحان وكتابة قصة النجاح بأعلى معدل' },
  { ar: 'جويلية', en: 'July', season: 'صيف', quote: 'إعلان النتائج وفرحة التفوق المستحق' },
  { ar: 'أوت', en: 'August', season: 'صيف', quote: 'الاستعداد للمرحلة الجامعية والتخصص المنشود' },
];

export const DEFAULT_MONTHS: MonthData[] = MONTH_NAMES.map((m, idx) => ({
  index: idx,
  nameAr: m.ar,
  nameEn: m.en,
  season: m.season,
  quote: m.quote,
  generalGoals: [],
  subjectGoals: {
    arabic: [],
    math: [],
    physics: [],
    natural_sciences: [],
    english: [],
    french: [],
    islamic: [],
    history_geo: [],
    philosophy: [],
  },
  achievements: [],
}));

export const DEFAULT_SCHEDULE: ScheduleItem[] = [];

export const DEFAULT_TODOS: TodoItem[] = [
  { id: 'todo-1', text: 'حل مسألة شاملة في الدوال العددية واللوغاريتم', isCompleted: false, category: 'الرياضيات', createdAt: new Date().toISOString() },
  { id: 'todo-2', text: 'مراجعة المتابعة الزمنية لتحول كيميائي وقوانين السرعة', isCompleted: false, category: 'العلوم الفيزيائية', createdAt: new Date().toISOString() },
  { id: 'todo-3', text: 'تلخيص وحدة آليات تركيب البروتين (الاستنساخ والترجمة)', isCompleted: true, category: 'علوم الطبيعة والحياة', createdAt: new Date().toISOString() },
  { id: 'todo-4', text: 'حفظ تواريخ وشخصيات الحرب الباردة', isCompleted: false, category: 'التاريخ والجغرافيا', createdAt: new Date().toISOString() },
  { id: 'todo-5', text: 'كتابة مقال فلسفي حول المشكلة والإشكالية', isCompleted: false, category: 'الفلسفة', createdAt: new Date().toISOString() },
];

// Zero out all stats as requested
export const DEFAULT_POMODORO_STATS: PomodoroStats = {
  totalSecondsStudied: 0,
  sessionsCompleted: 0,
  streakDays: 0,
  lastStudyDate: new Date().toISOString().split('T')[0],
  todaySeconds: 0,
};

export const DEFAULT_SETTINGS: AppSettings = {
  youtubeUrl: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  isBgmPlaying: false,
  bgmVolume: 50,
  bgmPreset: 'youtube',
  soundFxEnabled: true,
  theme: 'strawberry_pink',
  darkMode: false,
  customBgColor: '#FFF0F5',
  customBgImage: '',
  siteColor: '#F472B6',
};

// Storage keys - version 5 with multi-account isolation and custom workspace
const GLOBAL_PREFIX = 'sayo_bac_v5_';
const OLD_PREFIX = 'sayo_bac_v4_';
const SAVED_ACCOUNTS_KEY = GLOBAL_PREFIX + 'saved_accounts';
const ACTIVE_ACCOUNT_KEY = GLOBAL_PREFIX + 'active_account_email';

function getAccountPrefix(): string {
  const activeEmail = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  if (!activeEmail || activeEmail === 'guest') {
    return GLOBAL_PREFIX;
  }
  const safeId = activeEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${GLOBAL_PREFIX}acc_${safeId}_`;
}

export const storage = {
  // Multi-account Management
  getActiveAccountEmail(): string | null {
    return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  },
  setActiveAccountEmail(email: string | null): void {
    if (email) {
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, email);
      localStorage.setItem(GLOBAL_PREFIX + 'auth_logged', 'true');
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
      localStorage.setItem(GLOBAL_PREFIX + 'auth_logged', 'false');
    }
  },
  getSavedAccounts(): SavedAccount[] {
    const raw = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
  saveSavedAccounts(accounts: SavedAccount[]): void {
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(accounts));
  },
  addSavedAccount(acc: SavedAccount): void {
    const accounts = this.getSavedAccounts();
    const existingIndex = accounts.findIndex((a) => a.email.toLowerCase() === acc.email.toLowerCase());
    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...acc, lastLogin: new Date().toISOString() };
    } else {
      accounts.push({ ...acc, lastLogin: new Date().toISOString() });
    }
    this.saveSavedAccounts(accounts);
  },
  removeSavedAccount(email: string): void {
    const accounts = this.getSavedAccounts().filter((a) => a.email.toLowerCase() !== email.toLowerCase());
    this.saveSavedAccounts(accounts);
    if (this.getActiveAccountEmail()?.toLowerCase() === email.toLowerCase()) {
      this.setActiveAccountEmail(null);
    }
  },

  // Account-scoped User Profile
  getUserProfile(): UserProfile {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'profile') || (prefix === GLOBAL_PREFIX ? localStorage.getItem(OLD_PREFIX + 'profile') : null);
    if (!raw) {
      const activeEmail = this.getActiveAccountEmail();
      if (activeEmail && activeEmail !== 'guest') {
        const matchingAccount = this.getSavedAccounts().find((a) => a.email.toLowerCase() === activeEmail.toLowerCase());
        return {
          ...DEFAULT_USER_PROFILE,
          email: activeEmail,
          name: matchingAccount?.name || activeEmail.split('@')[0],
          avatar: matchingAccount?.avatar || DEFAULT_AVATAR,
          loginMethod: 'google',
        };
      }
      return DEFAULT_USER_PROFILE;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name ?? DEFAULT_USER_PROFILE.name,
        email: parsed.email ?? (this.getActiveAccountEmail() || DEFAULT_USER_PROFILE.email),
        loginMethod: parsed.loginMethod ?? DEFAULT_USER_PROFILE.loginMethod,
        avatar: parsed.avatar || DEFAULT_USER_PROFILE.avatar,
        banner: parsed.banner || DEFAULT_USER_PROFILE.banner,
        homeBanner: parsed.homeBanner || DEFAULT_USER_PROFILE.homeBanner,
        stream: parsed.stream || DEFAULT_USER_PROFILE.stream,
        motto: parsed.motto || DEFAULT_USER_PROFILE.motto,
      };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },
  saveUserProfile(profile: UserProfile): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'profile', JSON.stringify(profile));
    if (profile.email) {
      this.addSavedAccount({
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.avatar || DEFAULT_AVATAR,
        lastLogin: new Date().toISOString(),
      });
    }
  },

  // Account-scoped To-Do Items
  getTodos(): TodoItem[] {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'todos');
    if (!raw) return DEFAULT_TODOS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TODOS;
    }
  },
  saveTodos(todos: TodoItem[]): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'todos', JSON.stringify(todos));
  },

  // Account-scoped Workspace Items (Free space, tables, checklists, notes)
  getWorkspaceItems(): WorkspaceItem[] {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'workspace_items');
    if (!raw) return DEFAULT_WORKSPACE_ITEMS;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_WORKSPACE_ITEMS;
    }
  },
  saveWorkspaceItems(items: WorkspaceItem[]): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'workspace_items', JSON.stringify(items));
  },

  // Account-scoped BAC Subjects & Curriculum
  getSubjects(): BacSubject[] {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'subjects');
    if (!raw) return DEFAULT_BAC_SUBJECTS;
    try {
      const parsed = JSON.parse(raw);
      return parsed.map((s: BacSubject) => {
        const { targetScore: _ts, ...rest } = s as unknown as { targetScore?: number } & BacSubject;
        return rest;
      });
    } catch {
      return DEFAULT_BAC_SUBJECTS;
    }
  },
  saveSubjects(subjects: BacSubject[]): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'subjects', JSON.stringify(subjects));
  },

  // Account-scoped Months & Monthly Goals
  getMonths(): MonthData[] {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'months');
    if (!raw) return DEFAULT_MONTHS;
    try {
      const parsed: MonthData[] = JSON.parse(raw);
      return parsed.map((m, idx) => ({
        ...DEFAULT_MONTHS[idx],
        ...m,
        generalGoals: m.generalGoals || (m as unknown as { goals?: [] }).goals || [],
        subjectGoals: m.subjectGoals || {
          arabic: [],
          math: [],
          physics: [],
          natural_sciences: [],
          english: [],
          french: [],
          islamic: [],
          history_geo: [],
          philosophy: [],
        },
        achievements: m.achievements || [],
      }));
    } catch {
      return DEFAULT_MONTHS;
    }
  },
  saveMonths(months: MonthData[]): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'months', JSON.stringify(months));
  },

  // Account-scoped Schedule
  getSchedule(): ScheduleItem[] {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'schedule');
    if (!raw) return DEFAULT_SCHEDULE;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SCHEDULE;
    }
  },
  saveSchedule(schedule: ScheduleItem[]): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'schedule', JSON.stringify(schedule));
  },

  // Account-scoped Pomodoro Stats
  getPomodoroStats(): PomodoroStats {
    const prefix = getAccountPrefix();
    const raw = localStorage.getItem(prefix + 'pomodoro');
    if (!raw) return DEFAULT_POMODORO_STATS;
    try {
      const stats = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      if (stats.lastStudyDate !== today) {
        stats.todaySeconds = 0;
        stats.lastStudyDate = today;
      }
      return stats;
    } catch {
      return DEFAULT_POMODORO_STATS;
    }
  },
  savePomodoroStats(stats: PomodoroStats): void {
    const prefix = getAccountPrefix();
    localStorage.setItem(prefix + 'pomodoro', JSON.stringify(stats));
  },

  // Settings
  getSettings(): AppSettings {
    const raw = localStorage.getItem(GLOBAL_PREFIX + 'settings');
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: AppSettings): void {
    localStorage.setItem(GLOBAL_PREFIX + 'settings', JSON.stringify(settings));
  },

  isLoggedIn(): boolean {
    const hasActive = !!this.getActiveAccountEmail();
    return hasActive || localStorage.getItem(GLOBAL_PREFIX + 'auth_logged') === 'true' || localStorage.getItem(OLD_PREFIX + 'auth_logged') === 'true';
  },
  setLoggedIn(status: boolean): void {
    localStorage.setItem(GLOBAL_PREFIX + 'auth_logged', status ? 'true' : 'false');
    if (!status) {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
  }
};
