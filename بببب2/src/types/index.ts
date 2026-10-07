export interface UserProfile {
  name: string;
  email?: string;
  loginMethod?: 'guest' | 'google' | 'custom';
  avatar: string;
  banner: string;
  homeBanner?: string;
  stream: string;
  motto: string; // Bio / Shiar
}

export interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  createdAt: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  type: 'note' | 'table' | 'checklist';
  content?: string; // Rich free text / markdown
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  checklistData?: {
    id: string;
    text: string;
    isDone: boolean;
  }[];
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedAccount {
  email: string;
  name: string;
  avatar: string;
  lastLogin: string;
}

export interface LessonItem {
  id: string;
  name: string;
  status: 'not_started' | 'studying' | 'summarized' | 'mastered';
}

export interface UnitItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface BacSubject {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  coefficient: number;
  units: UnitItem[];
  notes: string;
}

export interface MonthlyGoal {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt?: string;
}

export interface MonthlyAchievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  sticker: string;
}

export interface MonthData {
  index: number; // 0 to 11 (Sep to Aug)
  nameAr: string;
  nameEn: string;
  season: string;
  quote: string;
  generalGoals: MonthlyGoal[];
  subjectGoals: { [subjectId: string]: MonthlyGoal[] };
  achievements: MonthlyAchievement[];
}

export interface ScheduleItem {
  id: string;
  dayIndex: number; // 0: Sunday, 1: Monday, ... 6: Saturday
  time: string;
  subject: string;
  task: string;
  isCompleted: boolean;
  colorTag: string;
}

export interface PomodoroStats {
  totalSecondsStudied: number;
  sessionsCompleted: number;
  streakDays: number;
  lastStudyDate: string;
  todaySeconds: number;
}

export interface AppSettings {
  youtubeUrl: string;
  isBgmPlaying: boolean;
  bgmVolume: number;
  bgmPreset: 'youtube' | 'anime_lofi' | 'sakura_rain' | 'cozy_music_box';
  soundFxEnabled: boolean;
  theme: 'strawberry_pink' | 'sweet_cotton' | 'lavender_sky' | 'miku_mint' | 'pitch_black';
  darkMode: boolean; // Dark Mode (completely black #000000)
  customBgColor?: string;
  customBgImage?: string;
  siteColor?: string; // Custom website main color
}
