import React from 'react';
import { Settings, Play, LogIn, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import { DEFAULT_BANNER, storage } from '../utils/storage';

interface GameTitleScreenProps {
  userProfile: UserProfile;
  onPlay: () => void;
  onOpenSettings: () => void;
  onOpenLogin: () => void;
  onDirectGoogleLogin?: () => void;
  onOpenDownload?: () => void;
}

export const GameTitleScreen: React.FC<GameTitleScreenProps> = ({
  userProfile,
  onPlay,
  onOpenSettings,
  onOpenLogin,
  onDirectGoogleLogin,
  onOpenDownload,
}) => {
  const displayName = userProfile.name.trim();
  const plannerTitle = displayName ? `${displayName.toUpperCase()} PLANNER` : 'STUDENT PLANNER';
  const isLoggedIn = storage.isLoggedIn();

  const handleGoogleDirect = () => {
    sound.playClick();
    if (onDirectGoogleLogin) {
      onDirectGoogleLogin();
    } else {
      onOpenLogin();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-transparent relative overflow-hidden select-none">
      {/* Background Soft Glow Elements */}
      <div className="absolute top-12 left-16 w-32 h-32 rounded-full bg-pink-200/40 dark:bg-pink-900/20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-16 right-20 w-40 h-40 rounded-full bg-rose-200/35 dark:bg-rose-900/20 blur-3xl pointer-events-none" />

      {/* Main Container Card - Supports both Light & Dark mode */}
      <div className="w-full max-w-3xl bg-white/85 dark:bg-black/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-kawaii border-2 border-pink-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 transition-colors">
        {/* Left Side: Visual Art & Title */}
        <div className="w-full md:w-1/2 flex flex-col items-center text-center">
          <div className="relative group w-full max-w-xs rounded-2xl overflow-hidden border-2 border-pink-300 dark:border-zinc-700 shadow-sm">
            <img 
              src={userProfile.homeBanner || DEFAULT_BANNER} 
              alt="Study Desk" 
              className="w-full h-48 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/60 dark:from-black/80 via-transparent to-transparent flex flex-col justify-end p-3.5 text-white text-left">
              <span className="text-[10px] font-bold text-pink-200 dark:text-pink-300 uppercase tracking-wider flex items-center gap-1 font-['Comfortaa',sans-serif]">
                <Sparkles className="w-3 h-3 text-pink-300" />
                STUDENT PASS
              </span>
              <h3 className="text-base font-bold drop-shadow-xs font-['Fredoka',sans-serif]">
                {displayName || 'Student'}
              </h3>
              {userProfile.stream && (
                <p className="text-xs text-pink-100 opacity-90 font-medium">
                  {userProfile.stream}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3.5">
            <h1 className="text-2xl sm:text-3xl font-black text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif] tracking-wide">
              {plannerTitle}
            </h1>
            <p className="text-[11px] text-pink-400 dark:text-pink-300 mt-0.5 font-bold uppercase tracking-widest font-['Comfortaa',sans-serif]">
              BAC STUDY SPACE
            </p>
          </div>
        </div>

        {/* Right Side: Game Menu Buttons (PLAY, SETTINGS, SIGN IN in English) */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-3">
          {/* PLAY BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              onPlay();
            }}
            className="w-full max-w-xs py-3 px-6 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-bold text-lg sm:text-xl shadow-sm transition-all flex items-center justify-between group font-['Comfortaa',sans-serif] border border-white/80 dark:border-zinc-700"
          >
            <span className="tracking-wider">PLAY</span>
            <Play className="w-5 h-5 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* SETTINGS BUTTON */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="w-full max-w-xs py-3 px-6 rounded-full bg-pink-500 hover:bg-pink-600 active:scale-95 text-white font-bold text-lg sm:text-xl shadow-sm transition-all flex items-center justify-between group font-['Comfortaa',sans-serif] border border-white/80 dark:border-zinc-700"
          >
            <span className="tracking-wider">SETTINGS</span>
            <Settings className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* SIGN IN BUTTON (In English) */}
          <button
            onClick={handleGoogleDirect}
            className="w-full max-w-xs py-3 px-6 rounded-full bg-pink-200 dark:bg-zinc-800 hover:bg-pink-300 dark:hover:bg-zinc-700 active:scale-95 text-pink-800 dark:text-pink-200 font-bold text-base sm:text-lg shadow-sm transition-all flex items-center justify-between group font-['Comfortaa',sans-serif] border border-white/80 dark:border-zinc-700"
          >
            <span className="tracking-wider">SIGN IN</span>
            {isLoggedIn ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            ) : (
              <LogIn className="w-5 h-5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
            )}
          </button>

          {/* DIRECT GOOGLE SIGN IN (تسجيل دخول بغوغل مباشر) */}
          <button
            onClick={handleGoogleDirect}
            className="w-full max-w-xs py-2.5 px-4 rounded-full bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs sm:text-sm font-bold shadow-xs border border-pink-200 dark:border-zinc-700 active:scale-95 transition-all flex items-center justify-center gap-2 font-['Comfortaa',sans-serif]"
          >
            {/* Google G Logo SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggedIn ? 'GOOGLE ACCOUNT ACTIVE' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          {/* DOWNLOAD INDEX.HTML (تحميل كود المشروع كملف مستقل) */}
          {onOpenDownload && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenDownload();
              }}
              className="w-full max-w-xs py-2.5 px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-between group active:scale-95 font-['Comfortaa',sans-serif]"
            >
              <span className="flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-100" />
                <span>DOWNLOAD INDEX.HTML</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white font-mono">
                ملف كامل
              </span>
            </button>
          )}

          {/* Clean Subtitle */}
          <div className="mt-1 text-center">
            <span className="text-[11px] text-pink-400 dark:text-zinc-400 tracking-wider font-['Comfortaa',sans-serif]">
              STUDY PLANNER · BAC EDITION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
