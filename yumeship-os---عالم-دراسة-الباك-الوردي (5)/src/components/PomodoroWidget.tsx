import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  Clock, 
  Flame,
  Coffee,
  Brain,
  Edit3,
  TableProperties,
  ListChecks,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Save,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PomodoroStats } from '../types';
import { sound } from '../utils/audio';
import { storage } from '../utils/storage';

interface PomodoroWidgetProps {
  stats: PomodoroStats;
  onUpdateStats: (newStats: PomodoroStats) => void;
  isCompact?: boolean;
  userName?: string;
  onSelectTab?: (tab: 'workspace') => void;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

const MODE_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  stats,
  onUpdateStats,
  isCompact = false,
  userName = '',
  onSelectTab,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('الرياضيات');

  // Quick scratchpad / free space under timer
  const [quickNote, setQuickNote] = useState(() => {
    return localStorage.getItem('pomodoro_scratchpad_note') || '';
  });
  const [isSavedNote, setIsSavedNote] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          if (mode === 'focus') {
            const today = new Date().toISOString().split('T')[0];
            onUpdateStats({
              ...stats,
              totalSecondsStudied: stats.totalSecondsStudied + 1,
              todaySeconds: stats.todaySeconds + 1,
              lastStudyDate: today,
            });
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, stats, onUpdateStats]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    sound.playSuccess();

    if (mode === 'focus') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const today = new Date().toISOString().split('T')[0];
      const isNewDay = stats.lastStudyDate !== today;
      const newStreak = isNewDay ? stats.streakDays + 1 : stats.streakDays;

      onUpdateStats({
        ...stats,
        sessionsCompleted: stats.sessionsCompleted + 1,
        streakDays: newStreak,
        lastStudyDate: today,
      });

      setMode('short_break');
      setTimeLeft(MODE_DURATIONS.short_break);
    } else {
      setMode('focus');
      setTimeLeft(MODE_DURATIONS.focus);
    }
  };

  const handleToggleTimer = () => {
    sound.playClick();
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    sound.playClick();
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const handleSwitchMode = (newMode: TimerMode) => {
    sound.playClick();
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleSaveScratchpad = () => {
    sound.playClick();
    localStorage.setItem('pomodoro_scratchpad_note', quickNote);
    setIsSavedNote(true);
    setTimeout(() => setIsSavedNote(false), 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const todayHours = (stats.todaySeconds / 3600).toFixed(1);
  const totalHours = (stats.totalSecondsStudied / 3600).toFixed(1);

  if (isCompact) {
    return (
      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-3 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center justify-between gap-3 select-none transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-pink-500 dark:text-pink-400 font-bold uppercase block font-['Comfortaa',sans-serif]">
              {mode === 'focus' ? 'FOCUS' : 'BREAK'}
            </span>
            <span className="text-base font-bold font-mono text-slate-800 dark:text-zinc-100">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToggleTimer}
            className="w-8 h-8 rounded-xl bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
          >
            {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
          </button>
          <button
            onClick={handleResetTimer}
            className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-600 dark:text-pink-300 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Title Header */}
      <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2 font-['Comfortaa',sans-serif]">
              <span>POMODORO STUDY TIMER (المؤقت)</span>
            </h2>
            <span className="text-xs text-pink-400 dark:text-zinc-400 font-mono">
              {userName ? `جلسة تركيز لـ ${userName}` : 'جلسة تركيز وتحصيل علمي'}
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-1 bg-pink-50/80 dark:bg-zinc-900 p-1 rounded-xl border border-pink-100 dark:border-zinc-800">
          <button
            onClick={() => handleSwitchMode('focus')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif] ${
              mode === 'focus'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-pink-700 dark:text-zinc-400 hover:text-pink-900 dark:hover:text-zinc-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>FOCUS (25m)</span>
          </button>

          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif] ${
              mode === 'short_break'
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-purple-700 dark:text-zinc-400 hover:text-purple-900 dark:hover:text-zinc-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>BREAK (5m)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Section: Timer Display Console */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-3xl border-2 border-pink-200 dark:border-zinc-800 shadow-kawaii relative overflow-hidden transition-colors">
          <div className="relative z-10 flex flex-col items-center">
            {/* Visual Subject Label */}
            <span className="px-3.5 py-1 rounded-full bg-pink-100/90 dark:bg-zinc-800 text-pink-700 dark:text-pink-300 font-bold text-xs mb-3 border border-pink-200 dark:border-zinc-700 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>مادة المذاكرة: {selectedSubject}</span>
            </span>

            {/* Huge Retro LCD Timer Display */}
            <div className="py-4 px-6 sm:px-10 rounded-3xl bg-pink-50/70 dark:bg-zinc-950 border-2 border-pink-300 dark:border-zinc-800 shadow-inner flex items-center justify-center mb-6">
              <span className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-pink-600 dark:text-pink-400 drop-shadow-xs select-none">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Play, Pause, Reset Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleTimer}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 active:scale-95 text-white flex items-center justify-center shadow-md transition-all group"
                title={isRunning ? 'Pause' : 'Start'}
              >
                {isRunning ? (
                  <Pause className="w-7 h-7 fill-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white ml-1 group-hover:scale-110 transition-transform" />
                )}
              </button>

              <button
                onClick={handleResetTimer}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 active:scale-95 text-pink-600 dark:text-pink-300 flex items-center justify-center transition-colors shadow-xs"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Preset shortcuts */}
            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => {
                  setTimeLeft(50 * 60);
                  setIsRunning(false);
                }}
                className="px-3 py-0.5 rounded-full bg-[#7D6B88] text-[9px] text-white font-bold tracking-wider hover:bg-[#6A5A74] active:scale-95 transition-all font-mono"
              >
                DEEP 50M
              </button>
              <button
                onClick={() => {
                  setTimeLeft(5 * 60);
                  setIsRunning(false);
                }}
                className="px-3 py-0.5 rounded-full bg-[#7D6B88] text-[9px] text-white font-bold tracking-wider hover:bg-[#6A5A74] active:scale-95 transition-all font-mono"
              >
                BREAK 5M
              </button>
              <button
                onClick={() => handleSwitchMode('focus')}
                className="px-3 py-0.5 rounded-full bg-[#7D6B88] text-[9px] text-white font-bold tracking-wider hover:bg-[#6A5A74] active:scale-95 transition-all font-mono"
              >
                FOCUS 25M
              </button>
            </div>
          </div>
        </div>

        {/* Right Section: Subject Selector & Saved Stats */}
        <div className="lg:col-span-5 space-y-3">
          {/* Current Subject Selector (Arabic) */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-2.5 transition-colors">
            <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
              CURRENT SUBJECT (المادة الحالية):
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['الرياضيات', 'العلوم الفيزيائية', 'علوم الطبيعة والحياة', 'اللغة العربية', 'العلوم الإسلامية', 'التاريخ والجغرافيا', 'الفلسفة', 'الإنجليزية'].map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSubject(sub);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedSubject === sub
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-pink-50 dark:bg-zinc-900 hover:bg-pink-100 dark:hover:bg-zinc-800 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-zinc-800'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Time Records Persistence Card */}
          <div className="bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 border border-pink-200 dark:border-zinc-800 shadow-xs space-y-2.5 transition-colors">
            <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <Award className="w-3.5 h-3.5 text-pink-500" />
              RECORDED STUDY TIME (ساعات الدراسة المحفوظة)
            </h3>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
              <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50 dark:bg-zinc-900">
                <span className="font-['Comfortaa',sans-serif]">TODAY:</span>
                <span className="font-bold text-pink-700 dark:text-pink-300 font-mono">{todayHours}h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50 dark:bg-zinc-900">
                <span className="font-['Comfortaa',sans-serif]">TOTAL RECORDED:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300 font-mono">{totalHours}h</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 dark:bg-zinc-900">
                <span className="font-['Comfortaa',sans-serif] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  STREAK:
                </span>
                <span className="font-bold text-rose-700 dark:text-rose-400 font-mono">{stats.streakDays} DAYS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FREE SPACE SECTION UNDER THE TIMER (خانة مكان حر تحت المؤقت)  */}
      {/* "خانة بها مكان حر تضيف او تكتب ماتريد ويمكنك انشاء جداول او قوائم او كتابة" */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-pink-200 dark:border-zinc-800 shadow-kawaii space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-pink-700 dark:text-pink-300 font-['Comfortaa',sans-serif]">
                  المساحة الحرة والملاحظات (FREE SPACE)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-pink-100 dark:bg-zinc-800 text-[10px] font-bold text-pink-600 dark:text-pink-400">
                  تحت المؤقت
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                مكان حر لكتابة الأفكار والقوانين، وإنشاء جداول وقوائم مراجعة أثناء المذاكرة
              </p>
            </div>
          </div>

          {/* Quick Actions to Workspace */}
          {onSelectTab && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectTab('workspace');
                }}
                className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 font-['Comfortaa',sans-serif]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>فتح الجداول والقوائم (Workspace)</span>
                <ArrowRight className="w-3.5 h-3.5 rotate-180 sm:rotate-0" />
              </button>
            </div>
          )}
        </div>

        {/* Free Writing Scratchpad */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>مساحة كتابة حرة وسريعة أثناء جلسة المذاكرة:</span>
            </label>
            <button
              type="button"
              onClick={handleSaveScratchpad}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 font-['Comfortaa',sans-serif] ${
                isSavedNote 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-pink-100 dark:bg-zinc-800 text-pink-700 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-zinc-700'
              }`}
            >
              {isSavedNote ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSavedNote ? 'تم الحفظ!' : 'حفظ الملاحظة'}</span>
            </button>
          </div>

          <textarea
            value={quickNote}
            onChange={(e) => {
              setQuickNote(e.target.value);
              localStorage.setItem('pomodoro_scratchpad_note', e.target.value);
            }}
            rows={4}
            placeholder="اكتب هنا ملاحظاتك، استنتاجات الجلسة، قوانين الرياضيات أو الفيزياء، أو أسئلة تريد الرجوع إليها..."
            className="w-full p-3.5 rounded-2xl border border-pink-200 dark:border-zinc-700 bg-pink-50/40 dark:bg-zinc-900/80 text-xs sm:text-sm text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-pink-400 resize-none font-sans leading-relaxed"
          />
        </div>

        {/* Workspace Quick Short-links for Tables & Checklists */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div 
            onClick={() => onSelectTab && onSelectTab('workspace')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-zinc-900 dark:to-zinc-950 border border-pink-200 dark:border-zinc-800 cursor-pointer hover:border-pink-400 transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <TableProperties className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">
                إنشاء وتعديل جداول دراسية
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                جداول مقارنات، قوانين المواد، وتلخيصات في خانات مخصصة
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div 
            onClick={() => onSelectTab && onSelectTab('workspace')}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-zinc-900 dark:to-zinc-950 border border-pink-200 dark:border-zinc-800 cursor-pointer hover:border-pink-400 transition-all flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ListChecks className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">
                قوائم مراجعة وفحص (Checklists)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                قوائم مهام مخصصة لكل مادة مع مربعات إنجاز تفاعلية
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
