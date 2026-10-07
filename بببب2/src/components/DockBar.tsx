import React from 'react';
import { 
  Home, 
  User, 
  BookOpen, 
  CalendarCheck, 
  CalendarRange, 
  Timer, 
  Settings, 
  Music,
  FileSpreadsheet
} from 'lucide-react';
import { sound } from '../utils/audio';

export type ActiveTab = 'home' | 'profile' | 'subjects' | 'months' | 'schedule' | 'pomodoro' | 'workspace';

interface DockBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenMusic: () => void;
  onOpenSettings: () => void;
}

export const DockBar: React.FC<DockBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenMusic,
  onOpenSettings,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
    { id: 'subjects' as ActiveTab, label: 'Subjects', icon: BookOpen },
    { id: 'months' as ActiveTab, label: 'Months', icon: CalendarCheck },
    { id: 'schedule' as ActiveTab, label: 'Schedule', icon: CalendarRange },
    { id: 'pomodoro' as ActiveTab, label: 'Timer', icon: Timer },
    { id: 'workspace' as ActiveTab, label: 'Workspace', icon: FileSpreadsheet },
  ];

  return (
    <aside className="fixed left-2 sm:left-3 top-1/2 -translate-y-1/2 z-40 select-none">
      <nav 
        className="bg-white/95 dark:bg-black/95 backdrop-blur-md border border-pink-200/90 dark:border-zinc-800 rounded-2xl p-1.5 shadow-md flex flex-col items-center gap-1 transition-all"
        aria-label="Sidebar Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(item.id);
              }}
              className={`relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 group ${
                isActive
                  ? 'bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-zinc-800'
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[8px] sm:text-[8.5px] font-semibold tracking-tight font-['Comfortaa',sans-serif]">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3.5 bg-pink-500 rounded-full" />
              )}
            </button>
          );
        })}

        <div className="w-5 h-px bg-pink-200 dark:bg-zinc-800 my-0.5" />

        {/* Music Quick Trigger */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenMusic();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-all flex flex-col items-center justify-center gap-0.5 group"
          title="Background Music"
        >
          <Music className="w-4 h-4 text-pink-500 dark:text-pink-400" />
          <span className="text-[8.5px] font-semibold tracking-tight font-['Comfortaa',sans-serif]">
            BGM
          </span>
        </button>

        {/* Settings Quick Trigger */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-zinc-800 transition-all flex flex-col items-center justify-center gap-0.5 group"
          title="Settings & Wallpaper"
        >
          <Settings className="w-4 h-4 text-slate-600 dark:text-zinc-400 group-hover:rotate-45 transition-transform" />
          <span className="text-[8.5px] font-semibold tracking-tight font-['Comfortaa',sans-serif]">
            Config
          </span>
        </button>
      </nav>
    </aside>
  );
};
