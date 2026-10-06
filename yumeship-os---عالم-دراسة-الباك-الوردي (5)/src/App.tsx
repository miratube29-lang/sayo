import React, { useState, useEffect } from 'react';
import { 
  storage, 
  DEFAULT_BAC_SUBJECTS, 
  DEFAULT_MONTHS, 
  DEFAULT_SCHEDULE, 
  DEFAULT_USER_PROFILE, 
  DEFAULT_POMODORO_STATS, 
  DEFAULT_SETTINGS 
} from './utils/storage';
import { 
  UserProfile, 
  BacSubject, 
  MonthData, 
  ScheduleItem, 
  PomodoroStats, 
  AppSettings 
} from './types';
import { sound } from './utils/audio';
import { applySiteColor } from './utils/theme';

// Components
import { GameTitleScreen } from './components/GameTitleScreen';
import { LoginModal } from './components/LoginModal';
import { TopStatusBar } from './components/TopStatusBar';
import { DockBar, ActiveTab } from './components/DockBar';
import { HomeDashboardView } from './components/HomeDashboardView';
import { ProfileView } from './components/ProfileView';
import { BacSubjectsView } from './components/BacSubjectsView';
import { MonthlyGoalsView } from './components/MonthlyGoalsView';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { PomodoroWidget } from './components/PomodoroWidget';
import { StudyWorkspaceView } from './components/StudyWorkspaceView';
import { MusicPlayerModal, extractYouTubeId } from './components/MusicPlayerModal';
import { SettingsModal } from './components/SettingsModal';

type AppScreen = 'game_title' | 'desktop';

export default function App() {
  // App navigation state
  const [screen, setScreen] = useState<AppScreen>('game_title');
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  
  // Persistent data states
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getUserProfile());
  const [subjects, setSubjects] = useState<BacSubject[]>(() => storage.getSubjects());
  const [months, setMonths] = useState<MonthData[]>(() => storage.getMonths());
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => storage.getSchedule());
  const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats>(() => storage.getPomodoroStats());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync theme with document element for instant global CSS variables update
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Sync Dark Mode state on document root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-dark');
    }
  }, [settings.darkMode]);

  // Apply custom site theme color (transforms all pink accents, buttons, and highlights)
  useEffect(() => {
    applySiteColor(settings.siteColor || '#F472B6');
  }, [settings.siteColor]);

  // Open Google Login / Account Chooser modal
  const handleOpenGoogleLogin = () => {
    sound.playClick();
    setIsLoginModalOpen(true);
  };

  // Reload all account-specific data when an account is switched, added, or logged out
  const handleAccountSwitched = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setSubjects(storage.getSubjects());
    setMonths(storage.getMonths());
    setSchedule(storage.getSchedule());
    setPomodoroStats(storage.getPomodoroStats());
  };

  // Update handlers with immediate persistence
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    storage.saveUserProfile(newProfile);
  };

  const handleUpdateSubjects = (newSubjects: BacSubject[]) => {
    setSubjects(newSubjects);
    storage.saveSubjects(newSubjects);
  };

  const handleUpdateMonths = (newMonths: MonthData[]) => {
    setMonths(newMonths);
    storage.saveMonths(newMonths);
  };

  const handleUpdateSchedule = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    storage.saveSchedule(newSchedule);
  };

  const handleUpdatePomodoroStats = (newStats: PomodoroStats) => {
    setPomodoroStats(newStats);
    storage.savePomodoroStats(newStats);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Full reset (Zero out all data)
  const handleResetData = () => {
    sound.playClick();
    setUserProfile(DEFAULT_USER_PROFILE);
    setSubjects(DEFAULT_BAC_SUBJECTS);
    setMonths(DEFAULT_MONTHS);
    setSchedule(DEFAULT_SCHEDULE);
    setPomodoroStats(DEFAULT_POMODORO_STATS);
    setSettings(DEFAULT_SETTINGS);

    storage.saveUserProfile(DEFAULT_USER_PROFILE);
    storage.saveSubjects(DEFAULT_BAC_SUBJECTS);
    storage.saveMonths(DEFAULT_MONTHS);
    storage.saveSchedule(DEFAULT_SCHEDULE);
    storage.savePomodoroStats(DEFAULT_POMODORO_STATS);
    storage.saveSettings(DEFAULT_SETTINGS);
  };

  // Background YouTube Audio Engine
  const youtubeVideoId = extractYouTubeId(settings.youtubeUrl) || 'jfKfPfyJRdk';

  const toggleMusicPlaying = () => {
    const nextState = !settings.isBgmPlaying;
    handleUpdateSettings({
      ...settings,
      isBgmPlaying: nextState,
    });
  };

  // Full customizable page background (color picker or uploaded image from computer)
  const customBackgroundStyle: React.CSSProperties = {
    backgroundColor: settings.customBgColor || (settings.darkMode ? '#000000' : '#FFF0F5'),
    backgroundImage: settings.customBgImage ? `url(${settings.customBgImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <div 
      data-theme={settings.theme}
      data-dark={settings.darkMode ? 'true' : undefined}
      style={customBackgroundStyle}
      className={`min-h-screen ${settings.darkMode ? 'bg-black text-slate-100 dark' : 'text-slate-800'} flex flex-col font-['Alexandria',sans-serif] relative overflow-x-hidden transition-colors duration-300`}
    >
      {/* Background YouTube Audio Stream (Persistent across all tabs & views) */}
      {settings.isBgmPlaying && settings.bgmPreset === 'youtube' && youtubeVideoId && (
        <div className="fixed -bottom-96 -left-96 w-10 h-10 pointer-events-none opacity-0 overflow-hidden">
          <iframe
            title="Background Audio Engine"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&loop=1&playlist=${youtubeVideoId}&controls=0`}
            allow="autoplay"
          />
        </div>
      )}

      {/* Screen 1: Game Title Screen */}
      {screen === 'game_title' && (
        <GameTitleScreen
          userProfile={userProfile}
          onPlay={() => {
            sound.playClick();
            setScreen('desktop');
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onDirectGoogleLogin={handleOpenGoogleLogin}
        />
      )}

      {/* Screen 2: Desktop & Dashboard Hub */}
      {screen === 'desktop' && (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Aesthetic Status Bar */}
          <TopStatusBar
            userProfile={userProfile}
            settings={settings}
            streakDays={pomodoroStats.streakDays}
            totalStudyHours={pomodoroStats.totalSecondsStudied / 3600}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenMusic={() => setIsMusicModalOpen(true)}
            onReturnToGame={() => setScreen('game_title')}
            onOpenProfile={() => setActiveTab('profile')}
          />

          <div className="flex-1 flex w-full relative">
            {/* Sleek, Compact Sidebar Navigation on the LEFT */}
            <DockBar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              onOpenMusic={() => setIsMusicModalOpen(true)}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
            />

            {/* Main Content Area based on Active Tab - Balanced scaling so no zoom out needed */}
            <main className="flex-1 min-w-0 pl-16 sm:pl-20 pr-3 sm:pr-6 py-4 max-w-6xl mx-auto w-full">
              {activeTab === 'home' && (
                <HomeDashboardView
                  userProfile={userProfile}
                  subjects={subjects}
                  pomodoroStats={pomodoroStats}
                  settings={settings}
                  onUpdatePomodoroStats={handleUpdatePomodoroStats}
                  onUpdateProfile={handleUpdateProfile}
                  onSelectTab={setActiveTab}
                  onOpenMusic={() => setIsMusicModalOpen(true)}
                  onToggleMusic={toggleMusicPlaying}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

              {activeTab === 'subjects' && (
                <BacSubjectsView
                  subjects={subjects}
                  months={months}
                  onUpdateSubjects={handleUpdateSubjects}
                  onUpdateMonths={handleUpdateMonths}
                />
              )}

              {activeTab === 'months' && (
                <MonthlyGoalsView
                  months={months}
                  subjects={subjects}
                  onUpdateMonths={handleUpdateMonths}
                />
              )}

              {activeTab === 'schedule' && (
                <WeeklyScheduleView
                  schedule={schedule}
                  onUpdateSchedule={handleUpdateSchedule}
                />
              )}

              {activeTab === 'pomodoro' && (
                <PomodoroWidget
                  stats={pomodoroStats}
                  onUpdateStats={handleUpdatePomodoroStats}
                  isCompact={false}
                  userName={userProfile.name}
                  onSelectTab={setActiveTab}
                />
              )}

              {activeTab === 'workspace' && (
                <StudyWorkspaceView />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleUpdateProfile}
        onLoginComplete={() => {
          storage.setLoggedIn(true);
          setIsLoginModalOpen(false);
          sound.playSuccess();
        }}
        onAccountSwitched={handleAccountSwitched}
      />

      <MusicPlayerModal
        isOpen={isMusicModalOpen}
        onClose={() => setIsMusicModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetData={handleResetData}
      />
    </div>
  );
}
