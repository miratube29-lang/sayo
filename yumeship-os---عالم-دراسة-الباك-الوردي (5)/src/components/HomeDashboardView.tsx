import React from 'react';
import { 
  Play, 
  Clock, 
  Award, 
  BookOpen, 
  CalendarCheck, 
  CalendarRange, 
  Timer, 
  User, 
  ChevronRight, 
  Flame, 
  FolderUp,
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import { UserProfile, BacSubject, PomodoroStats, AppSettings } from '../types';
import { sound } from '../utils/audio';
import { readFileAsDataUrl } from '../utils/helpers';
import { TodoListWidget } from './TodoListWidget';
import { MiniMusicWidget } from './MiniMusicWidget';
import { ActiveTab } from './DockBar';
import { DEFAULT_BANNER } from '../utils/storage';

interface HomeDashboardViewProps {
  userProfile: UserProfile;
  subjects: BacSubject[];
  pomodoroStats: PomodoroStats;
  settings: AppSettings;
  onUpdatePomodoroStats: (stats: PomodoroStats) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMusic: () => void;
  onToggleMusic: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  userProfile,
  subjects,
  pomodoroStats,
  settings,
  onUpdatePomodoroStats: _onUpdatePomodoroStats,
  onUpdateProfile,
  onSelectTab,
  onOpenMusic,
  onToggleMusic,
}) => {
  const displayName = userProfile.name.trim();

  // Calculate next BAC countdown
  const calculateBacCountdown = () => {
    const now = new Date();
    let targetYear = now.getFullYear();
    const targetDate = new Date(`${targetYear}-06-08T08:00:00`);
    if (now > targetDate) {
      targetYear += 1;
    }
    const nextBac = new Date(`${targetYear}-06-08T08:00:00`);
    const diff = nextBac.getTime() - now.getTime();
    if (diff <= 0) return { days: 0 };
    return { days: Math.floor(diff / (1000 * 60 * 60 * 24)) };
  };

  const { days: daysLeft } = calculateBacCountdown();
  const totalStudyHours = (pomodoroStats.totalSecondsStudied / 3600).toFixed(1);

  // Overall subjects progress
  const totalLessons = subjects.reduce(
    (acc, s) => acc + s.units.reduce((uAcc, u) => uAcc + u.lessons.length, 0),
    0
  );
  const masteredLessons = subjects.reduce(
    (acc, s) =>
      acc +
      s.units.reduce(
        (uAcc, u) => uAcc + u.lessons.filter((l) => l.status === 'mastered').length,
        0
      ),
    0
  );
  const overallCurriculumPercent = totalLessons > 0 ? Math.round((masteredLessons / totalLessons) * 100) : 0;

  // Handle custom banner upload
  const handleHomeBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onUpdateProfile({
          ...userProfile,
          homeBanner: dataUrl,
        });
      } catch (err) {
        console.error('Failed to update home banner', err);
      }
    }
  };

  const handleResetBanner = () => {
    sound.playClick();
    onUpdateProfile({
      ...userProfile,
      homeBanner: DEFAULT_BANNER,
    });
  };

  const activeHomeImage = userProfile.homeBanner || DEFAULT_BANNER;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Hero Banner - Compact & Well-proportioned */}
      <div className="relative rounded-2xl overflow-hidden border border-pink-200 dark:border-zinc-800 shadow-sm bg-gradient-to-r from-pink-100/90 via-pink-50/80 to-rose-100/90 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 transition-colors">
        <div className="z-10 max-w-lg space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-pink-200 dark:border-zinc-700 text-pink-700 dark:text-pink-300 text-[10px] font-bold font-['Comfortaa',sans-serif]">
            <span>{displayName ? `${displayName.toUpperCase()} PLANNER` : 'STUDENT PLANNER'} · BAC EDITION</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] leading-tight">
            HELLO, {displayName ? displayName.toUpperCase() : 'STUDENT'}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('pomodoro');
              }}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 font-['Comfortaa',sans-serif]"
            >
              <span>FOCUS TIMER</span>
              <Play className="w-3.5 h-3.5 fill-white" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('subjects');
              }}
              className="px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-pink-50 dark:hover:bg-zinc-800 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-zinc-800 font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-1.5 font-['Comfortaa',sans-serif]"
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-500" />
              <span>SUBJECTS</span>
            </button>
          </div>
        </div>

        {/* Artwork Image with Upload */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <div className="relative group w-44 sm:w-52 h-36 sm:h-40 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-700 shadow-sm">
            <img 
              src={activeHomeImage} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
            <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[11px] font-bold cursor-pointer font-['Comfortaa',sans-serif] p-2 text-center">
              <FolderUp className="w-4 h-4 mb-0.5 text-pink-200" />
              <span>CHANGE IMAGE</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHomeBannerFile}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-white/95 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-[10px] font-bold shadow-xs border border-pink-200 dark:border-zinc-700 flex items-center gap-1 transition-all font-['Comfortaa',sans-serif]">
              <FolderUp className="w-3 h-3 text-pink-500" />
              <span>CHANGE IMAGE</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHomeBannerFile}
                className="hidden"
              />
            </label>

            {userProfile.homeBanner && userProfile.homeBanner !== DEFAULT_BANNER && (
              <button
                onClick={handleResetBanner}
                className="p-1 rounded-lg bg-white/95 dark:bg-zinc-800 hover:bg-white dark:hover:bg-zinc-700 text-pink-500 shadow-xs border border-pink-200 dark:border-zinc-700 text-[10px]"
                title="Reset to default image"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Overview Bento Cards - Compact & Clean */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-3.5 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-500 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-pink-400 dark:text-pink-300 font-bold block font-['Comfortaa',sans-serif]">COUNTDOWN</span>
            <span className="text-base font-black text-pink-700 dark:text-pink-400 font-mono">
              {daysLeft > 0 ? `${daysLeft} DAYS` : 'BAC WEEK'}
            </span>
          </div>
        </div>

        <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-3.5 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-zinc-800 flex items-center justify-center text-purple-500 shrink-0">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-purple-400 dark:text-purple-300 font-bold block font-['Comfortaa',sans-serif]">STUDY TIME</span>
            <span className="text-base font-black text-purple-700 dark:text-purple-400 font-mono">
              {totalStudyHours}h
            </span>
          </div>
        </div>

        <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-3.5 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-zinc-800 flex items-center justify-center text-rose-500 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-rose-400 dark:text-rose-300 font-bold block font-['Comfortaa',sans-serif]">STREAK</span>
            <span className="text-base font-black text-rose-700 dark:text-rose-400 font-mono">
              {pomodoroStats.streakDays} DAYS
            </span>
          </div>
        </div>

        <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-3.5 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-500 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block font-['Comfortaa',sans-serif]">PROGRESS</span>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {overallCurriculumPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Widgets & Quick Launchers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: To-Do List Widget (Replaces Pomodoro on home view) & Mini Music */}
        <div className="lg:col-span-5 space-y-3">
          <TodoListWidget />

          <MiniMusicWidget
            settings={settings}
            onTogglePlay={onToggleMusic}
            onOpenModal={onOpenMusic}
          />
        </div>

        {/* Right Side: Subjects Quick Progress & Shortcuts */}
        <div className="lg:col-span-7 space-y-3">
          {/* Subjects Progress Overview Card */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between pb-1.5 border-b border-pink-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <BookOpen className="w-4 h-4 text-pink-500" />
                BAC SUBJECTS
              </h3>
              <button
                onClick={() => {
                  sound.playClick();
                  onSelectTab('subjects');
                }}
                className="text-xs text-pink-500 hover:text-pink-700 dark:text-pink-400 font-bold flex items-center gap-0.5 font-['Comfortaa',sans-serif]"
              >
                <span>VIEW ALL</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {subjects.slice(0, 5).map((sub) => {
                const subLessons = sub.units.reduce((acc, u) => acc + u.lessons.length, 0);
                const subMastered = sub.units.reduce(
                  (acc, u) => acc + u.lessons.filter((l) => l.status === 'mastered').length,
                  0
                );
                const percent = subLessons > 0 ? Math.round((subMastered / subLessons) * 100) : 0;

                return (
                  <div 
                    key={sub.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectTab('subjects');
                    }}
                    className="p-2 rounded-xl bg-pink-50/50 dark:bg-zinc-900/60 hover:bg-pink-100/60 dark:hover:bg-zinc-800/80 transition-colors border border-pink-100 dark:border-zinc-800 cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 flex items-center justify-center font-bold text-[10px] text-pink-600 dark:text-pink-400">
                        {sub.code}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                          {sub.name}
                        </span>
                        <span className="text-[9px] text-pink-400 dark:text-zinc-500 font-mono">
                          COEFF {sub.coefficient}
                        </span>
                      </div>
                    </div>

                    <div className="w-28 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-pink-100 dark:bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-pink-400 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-pink-600 dark:text-pink-400 w-7 text-right">
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('months');
              }}
              className="p-3 rounded-2xl bg-white/85 dark:bg-black/90 hover:bg-pink-50/80 dark:hover:bg-zinc-900 border border-pink-200 dark:border-zinc-800 transition-all text-left shadow-xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 mb-1 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-pink-800 dark:text-pink-300 font-['Comfortaa',sans-serif]">MONTHS</h4>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('schedule');
              }}
              className="p-3 rounded-2xl bg-white/85 dark:bg-black/90 hover:bg-pink-50/80 dark:hover:bg-zinc-900 border border-pink-200 dark:border-zinc-800 transition-all text-left shadow-xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-purple-100 dark:bg-zinc-800 flex items-center justify-center text-purple-600 mb-1 group-hover:scale-105 transition-transform">
                <CalendarRange className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 font-['Comfortaa',sans-serif]">SCHEDULE</h4>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('workspace');
              }}
              className="p-3 rounded-2xl bg-white/85 dark:bg-black/90 hover:bg-pink-50/80 dark:hover:bg-zinc-900 border border-pink-200 dark:border-zinc-800 transition-all text-left shadow-xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-zinc-800 flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 font-['Comfortaa',sans-serif]">WORKSPACE</h4>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('profile');
              }}
              className="p-3 rounded-2xl bg-white/85 dark:bg-black/90 hover:bg-pink-50/80 dark:hover:bg-zinc-900 border border-pink-200 dark:border-zinc-800 transition-all text-left shadow-xs group"
            >
              <div className="w-7 h-7 rounded-xl bg-rose-100 dark:bg-zinc-800 flex items-center justify-center text-rose-600 mb-1 group-hover:scale-105 transition-transform">
                <User className="w-3.5 h-3.5" />
              </div>
              <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 font-['Comfortaa',sans-serif]">PROFILE</h4>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
