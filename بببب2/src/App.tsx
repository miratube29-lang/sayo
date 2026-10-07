import React, { useState, useEffect } from 'react';
import { 
  storage, 
  DEFAULT_BAC_SUBJECTS, 
  DEFAULT_MONTHS, 
  DEFAULT_SCHEDULE, 
  DEFAULT_USER_PROFILE, 
  DEFAULT_POMODORO_STATS, 
  DEFAULT_SETTINGS,
  DEFAULT_AVATAR
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
import { googleSignIn, onAuthUserChange } from './utils/firebaseAuth';
import { 
  loadUserDataFromCloud, 
  saveUserDataToCloud, 
  queueCloudSave, 
  subscribeToCloudUserData 
} from './utils/cloudSync';

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
  const [currentFirebaseUid, setCurrentFirebaseUid] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

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

  // Reload all account-specific data when an account is switched, added, or logged out
  const handleAccountSwitched = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setSubjects(storage.getSubjects());
    setMonths(storage.getMonths());
    setSchedule(storage.getSchedule());
    setPomodoroStats(storage.getPomodoroStats());
  };

  // Direct Google Sign In with real Google popup account chooser (accounts.google.com/v3/signin/accountchooser)
  const handleDirectGoogleLogin = async () => {
    try {
      sound.playClick();
      setIsSyncing(true);
      const res = await googleSignIn();
      const gUser = res.user;
      if (!gUser.email) return;

      const email = gUser.email.toLowerCase();
      const name = gUser.displayName || email.split('@')[0];
      const avatar = gUser.photoURL || DEFAULT_AVATAR;

      setCurrentFirebaseUid(gUser.uid);
      storage.setActiveAccountEmail(email);
      storage.addSavedAccount({
        email,
        name,
        avatar,
        lastLogin: new Date().toISOString(),
      });

      // 1. Fetch remote cloud records (from tablet / other devices)
      const cloudData = await loadUserDataFromCloud(gUser.uid);
      if (cloudData) {
        if (cloudData.subjects && cloudData.subjects.length > 0) setSubjects(cloudData.subjects);
        if (cloudData.months && cloudData.months.length > 0) setMonths(cloudData.months);
        if (cloudData.schedule && cloudData.schedule.length > 0) setSchedule(cloudData.schedule);
        if (cloudData.pomodoroStats) setPomodoroStats(cloudData.pomodoroStats);
        if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
      } else {
        // First cloud sign-in: push initial local data to cloud
        await saveUserDataToCloud(gUser.uid);
      }

      const loadedProfile = storage.getUserProfile();
      const updated: UserProfile = {
        ...loadedProfile,
        name,
        email,
        avatar,
        loginMethod: 'google',
      };

      storage.saveUserProfile(updated);
      storage.setLoggedIn(true);
      handleAccountSwitched(updated);
      sound.playSuccess();
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.warn('Google sign in notice:', err?.message || err);
      }
      // If error or dismissed, allow user to pick account from modal
      setIsLoginModalOpen(true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Google Login / Account Chooser modal
  const handleOpenGoogleLogin = () => {
    sound.playClick();
    setIsLoginModalOpen(true);
  };

  // Listen to Firebase Auth state on mount for persistent multi-device cloud sync
  useEffect(() => {
    let unsubscribeSync: (() => void) | null = null;

    const unsubscribeAuth = onAuthUserChange(async (gUser) => {
      if (gUser && gUser.email) {
        const uid = gUser.uid;
        setCurrentFirebaseUid(uid);
        const email = gUser.email.toLowerCase();
        const activeEmail = storage.getActiveAccountEmail();

        if (!activeEmail || activeEmail !== email) {
          storage.setActiveAccountEmail(email);
          const name = gUser.displayName || email.split('@')[0];
          const avatar = gUser.photoURL || DEFAULT_AVATAR;

          storage.addSavedAccount({
            email,
            name,
            avatar,
            lastLogin: new Date().toISOString(),
          });
        }

        // Fetch cloud data for this user (sync tablet <-> PC)
        setIsSyncing(true);
        try {
          const cloudData = await loadUserDataFromCloud(uid);
          if (cloudData) {
            if (cloudData.subjects && cloudData.subjects.length > 0) setSubjects(cloudData.subjects);
            if (cloudData.months && cloudData.months.length > 0) setMonths(cloudData.months);
            if (cloudData.schedule && cloudData.schedule.length > 0) setSchedule(cloudData.schedule);
            if (cloudData.pomodoroStats) setPomodoroStats(cloudData.pomodoroStats);
            if (cloudData.userProfile) setUserProfile(cloudData.userProfile);
          } else {
            await saveUserDataToCloud(uid);
          }
        } catch (e) {
          console.error('Error fetching cloud data on auth change:', e);
        } finally {
          setIsSyncing(false);
        }

        // Real-time live listener for instant cross-device updates (e.g. tablet <-> PC)
        if (unsubscribeSync) unsubscribeSync();
        unsubscribeSync = subscribeToCloudUserData(uid, (remote) => {
          if (remote.subjects && remote.subjects.length > 0) {
            setSubjects(remote.subjects);
            storage.saveSubjects(remote.subjects);
          }
          if (remote.months && remote.months.length > 0) {
            setMonths(remote.months);
            storage.saveMonths(remote.months);
          }
          if (remote.schedule && remote.schedule.length > 0) {
            setSchedule(remote.schedule);
            storage.saveSchedule(remote.schedule);
          }
          if (remote.pomodoroStats) {
            setPomodoroStats(remote.pomodoroStats);
            storage.savePomodoroStats(remote.pomodoroStats);
          }
          if (remote.userProfile) {
            setUserProfile(remote.userProfile);
            storage.saveUserProfile(remote.userProfile);
          }
          if (remote.settings) {
            setSettings(remote.settings);
            storage.saveSettings(remote.settings);
          }
        });
      } else {
        setCurrentFirebaseUid(null);
        if (unsubscribeSync) {
          unsubscribeSync();
          unsubscribeSync = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSync) unsubscribeSync();
    };
  }, []);

  // Manual cloud synchronization action
  const handleManualSync = async () => {
    if (!currentFirebaseUid) {
      sound.playClick();
      setIsLoginModalOpen(true);
      return;
    }

    sound.playClick();
    setIsSyncing(true);
    try {
      const saved = await saveUserDataToCloud(currentFirebaseUid);
      const latest = await loadUserDataFromCloud(currentFirebaseUid);
      if (latest) {
        if (latest.subjects) setSubjects(latest.subjects);
        if (latest.months) setMonths(latest.months);
        if (latest.schedule) setSchedule(latest.schedule);
        if (latest.pomodoroStats) setPomodoroStats(latest.pomodoroStats);
        if (latest.userProfile) setUserProfile(latest.userProfile);
      }
      sound.playSuccess();
      setSyncToast(saved ? 'تمت مزامنة وحفظ جميع بياناتك في السحابة بنجاح! جاهزة الآن للتابلت.' : 'تم تحديث البيانات.');
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncToast('حدث خطأ أثناء المزامنة، يرجى المحاولة ثانية.');
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Update handlers with immediate persistence and automatic cloud backup
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    storage.saveUserProfile(newProfile);
    queueCloudSave(currentFirebaseUid || undefined, { userProfile: newProfile });
  };

  const handleUpdateSubjects = (newSubjects: BacSubject[]) => {
    setSubjects(newSubjects);
    storage.saveSubjects(newSubjects);
    queueCloudSave(currentFirebaseUid || undefined, { subjects: newSubjects });
  };

  const handleUpdateMonths = (newMonths: MonthData[]) => {
    setMonths(newMonths);
    storage.saveMonths(newMonths);
    queueCloudSave(currentFirebaseUid || undefined, { months: newMonths });
  };

  const handleUpdateSchedule = (newSchedule: ScheduleItem[]) => {
    setSchedule(newSchedule);
    storage.saveSchedule(newSchedule);
    queueCloudSave(currentFirebaseUid || undefined, { schedule: newSchedule });
  };

  const handleUpdatePomodoroStats = (newStats: PomodoroStats) => {
    setPomodoroStats(newStats);
    storage.savePomodoroStats(newStats);
    queueCloudSave(currentFirebaseUid || undefined, { pomodoroStats: newStats });
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    queueCloudSave(currentFirebaseUid || undefined, { settings: newSettings });
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
          onDirectGoogleLogin={handleDirectGoogleLogin}
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
            isSyncing={isSyncing}
            isCloudConnected={Boolean(currentFirebaseUid)}
            onManualSync={handleManualSync}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenMusic={() => setIsMusicModalOpen(true)}
            onReturnToGame={() => setScreen('game_title')}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onDirectGoogleLogin={handleDirectGoogleLogin}
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

      {/* Cloud Sync Toast Notification Banner */}
      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 dark:bg-emerald-700 text-white shadow-2xl border border-emerald-400/50 animate-fadeIn text-xs sm:text-sm font-bold font-['Alexandria',sans-serif]">
          <span className="text-base">☁️</span>
          <span>{syncToast}</span>
        </div>
      )}
    </div>
  );
}
