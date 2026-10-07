import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  Settings, 
  Music, 
  Maximize2, 
  Gamepad2,
  Timer,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';
import { sound } from '../utils/audio';

interface TopStatusBarProps {
  userProfile: UserProfile;
  settings: AppSettings;
  streakDays: number;
  totalStudyHours: number;
  isSyncing?: boolean;
  isCloudConnected?: boolean;
  onManualSync?: () => void;
  onOpenSettings: () => void;
  onOpenMusic: () => void;
  onReturnToGame: () => void;
  onOpenProfile: () => void;
  onOpenLogin?: () => void;
  onDirectGoogleLogin?: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  userProfile,
  settings,
  streakDays,
  totalStudyHours,
  isSyncing,
  isCloudConnected,
  onManualSync,
  onOpenSettings,
  onOpenMusic,
  onReturnToGame,
  onOpenProfile,
  onOpenLogin,
  onDirectGoogleLogin,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleFullscreen = () => {
    sound.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const displayName = userProfile.name.trim();

  return (
    <header className="w-full bg-white/90 dark:bg-black/95 backdrop-blur-md border-b border-pink-200 dark:border-zinc-800 px-4 sm:px-6 py-2 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs transition-colors">
      {/* Zone 1: Profile & Title / Switch to Game Menu */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-pink-50 dark:hover:bg-zinc-850 transition-colors group text-left"
          title="Profile"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-pink-400 dark:border-pink-500 shadow-xs group-hover:scale-105 transition-transform">
            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-pink-700 dark:text-pink-300 block leading-tight">
              {displayName || 'Student Profile'}
            </span>
            {userProfile.stream && (
              <span className="text-[10px] text-pink-400 dark:text-zinc-400 font-medium">
                {userProfile.stream}
              </span>
            )}
          </div>
        </button>

        {/* Back to Game Menu */}
        <button
          onClick={() => {
            sound.playClick();
            onReturnToGame();
          }}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-xs font-bold transition-all active:scale-95 font-['Comfortaa',sans-serif]"
          title="Return to Menu"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>MENU</span>
        </button>
      </div>

      {/* Zone 2: Digital Clock & Status */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Clock & Date */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 text-pink-700 dark:text-pink-300">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-xs font-bold font-mono tracking-wider">
            {timeStr || '12:00 PM'}
          </span>
          <span className="hidden lg:inline text-[10px] text-pink-400 dark:text-zinc-400 font-mono">· {dateStr}</span>
        </div>

        {/* Study Streak Badge */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
          <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>{streakDays}d STREAK</span>
        </div>

        {/* Total Hours Badge */}
        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-zinc-900 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono">
          <Timer className="w-3.5 h-3.5 text-purple-400" />
          <span>{totalStudyHours.toFixed(1)}h</span>
        </div>
      </div>

      {/* Zone 3: Quick Action Icons */}
      <div className="flex items-center gap-1.5">
        {/* Music Quick Control */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMusic();
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
            settings.isBgmPlaying 
              ? 'bg-rose-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 ring-1 ring-rose-300 dark:ring-rose-800' 
              : 'bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-600 dark:text-pink-300'
          }`}
          title="BGM Player"
        >
          <Music className={`w-3.5 h-3.5 ${settings.isBgmPlaying ? 'animate-bounce' : ''}`} />
        </button>

        {/* Cloud Sync Button */}
        {onManualSync && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isCloudConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-600 dark:text-pink-300'
            }`}
            title={
              isSyncing 
                ? 'جارٍ المزامنة السحابية...' 
                : isCloudConnected 
                ? 'متصل بالسحابة (مزامنة بين الأجهزة - اضغط للمزامنة)' 
                : 'مزامنة سحابية (سجل الدخول للمزامنة عبر الأجهزة)'
            }
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
            ) : (
              <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-500 fill-emerald-100 dark:fill-emerald-950' : ''}`} />
            )}
          </button>
        )}

        {/* Google Account button */}
        {(onDirectGoogleLogin || onOpenLogin) && (
          <button
            onClick={() => {
              sound.playClick();
              if (onDirectGoogleLogin) {
                onDirectGoogleLogin();
              } else if (onOpenLogin) {
                onOpenLogin();
              }
            }}
            className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 flex items-center justify-center text-pink-600 dark:text-pink-300 transition-colors"
            title="Google Account (تسجيل الدخول بحساب غوغل)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </button>
        )}

        {/* Settings button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 flex items-center justify-center text-pink-600 dark:text-pink-300 transition-colors"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen button */}
        <button
          onClick={handleFullscreen}
          className="hidden sm:flex w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 items-center justify-center text-pink-600 dark:text-pink-300 transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
