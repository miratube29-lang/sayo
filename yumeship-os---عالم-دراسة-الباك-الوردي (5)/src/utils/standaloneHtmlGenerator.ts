import { UserProfile, BacSubject, MonthData, ScheduleItem, PomodoroStats, AppSettings } from '../types';

interface ExportDataParams {
  userProfile: UserProfile;
  subjects: BacSubject[];
  months: MonthData[];
  schedule: ScheduleItem[];
  pomodoroStats: PomodoroStats;
  settings: AppSettings;
}

export function generateStandaloneHtml(data: ExportDataParams): string {
  const jsonState = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Yumeship OS - عالم دراسة الباك الوردي</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=Comfortaa:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Alexandria', 'sans-serif'],
            comfortaa: ['Comfortaa', 'sans-serif'],
          },
          colors: {
            brand: 'var(--brand-color, #F472B6)',
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --brand-color: ${data.settings?.siteColor || '#F472B6'};
      --brand-light: #FDF2F8;
      --brand-border: #FBCFE8;
    }
    body {
      font-family: 'Alexandria', sans-serif;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      background-color: ${data.settings?.customBgColor || '#FFF0F5'};
      color: #1e293b;
    }
    /* Custom Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(253, 242, 248, 0.6);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--brand-color);
      border-radius: 9999px;
    }
    .custom-scroll::-webkit-scrollbar-thumb:hover {
      filter: brightness(0.9);
    }
    .brand-btn {
      background-color: var(--brand-color);
      color: white;
      transition: all 0.2s ease;
    }
    .brand-btn:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
    .brand-btn:active {
      transform: scale(0.98);
    }
    .brand-border {
      border-color: var(--brand-border);
    }
    .brand-bg-light {
      background-color: var(--brand-light);
    }
    .brand-text {
      color: var(--brand-color);
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(251, 207, 232, 0.8);
      box-shadow: 0 10px 25px -5px rgba(244, 114, 182, 0.1), 0 8px 10px -6px rgba(244, 114, 182, 0.05);
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-float {
      animation: float 4s ease-in-out infinite;
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s ease-in-out infinite;
    }
  </style>
</head>
<body class="min-h-screen text-slate-800 flex flex-col relative overflow-x-hidden">

  <!-- Audio Engine (Offline Web Audio synthesized sounds) -->
  <script>
    const WebAudio = {
      ctx: null,
      getCtx() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        return this.ctx;
      },
      playClick() {
        try {
          const ctx = this.getCtx();
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch(e){}
      },
      playBell() {
        try {
          const ctx = this.getCtx();
          if (!ctx) return;
          const now = ctx.currentTime;
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0.12, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.9);
          });
        } catch(e){}
      },
      rainNoiseNode: null,
      rainGainNode: null,
      toggleRain(enable, volume = 0.1) {
        try {
          const ctx = this.getCtx();
          if (!ctx) return;
          if (!enable) {
            if (this.rainNoiseNode) {
              this.rainNoiseNode.stop();
              this.rainNoiseNode.disconnect();
              this.rainNoiseNode = null;
            }
            return;
          }
          if (this.rainNoiseNode) return;
          const bufferSize = ctx.sampleRate * 2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          let lastOut = 0.0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1000;
          const gain = ctx.createGain();
          gain.gain.value = volume;
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
          this.rainNoiseNode = noise;
          this.rainGainNode = gain;
        } catch(e){}
      }
    };
  </script>

  <!-- Main Root Container -->
  <div id="app" class="flex-1 flex flex-col min-h-screen"></div>

  <!-- Application Logic & Embedded State -->
  <script>
    const INITIAL_STATE = ${jsonState};
    const STORAGE_KEY = 'yumeship_bac_app_data';

    // Load or initialize state
    function loadSavedState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return { ...INITIAL_STATE, ...parsed };
        }
      } catch(e){}
      return INITIAL_STATE;
    }

    let state = loadSavedState();

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch(e){}
    }

    // Set site theme color CSS variable
    function updateThemeColor() {
      const color = state.settings?.siteColor || '#F472B6';
      document.documentElement.style.setProperty('--brand-color', color);
      document.documentElement.style.setProperty('--brand-border', color + '40');
      document.documentElement.style.setProperty('--brand-light', color + '15');
      if (state.settings?.customBgColor) {
        document.body.style.backgroundColor = state.settings.customBgColor;
      }
    }
    updateThemeColor();

    let currentScreen = 'game_title'; // 'game_title' | 'desktop'
    let currentTab = 'home'; // 'home' | 'profile' | 'subjects' | 'months' | 'schedule' | 'pomodoro'
    let isMusicModalOpen = false;
    let isSettingsModalOpen = false;
    let isExportModalOpen = false;

    // Pomodoro Timer Internal State
    let pomoMode = 'work'; // 'work' | 'short' | 'long'
    let pomoSecondsLeft = 25 * 60;
    let isPomoRunning = false;
    let pomoInterval = null;

    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function calculateBacDays() {
      const now = new Date();
      let targetYear = now.getFullYear();
      const targetDate = new Date(targetYear + '-06-08T08:00:00');
      if (now > targetDate) targetYear += 1;
      const nextBac = new Date(targetYear + '-06-08T08:00:00');
      const diff = nextBac.getTime() - now.getTime();
      return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    // Render helper
    function render() {
      const app = document.getElementById('app');
      if (!app) return;

      if (currentScreen === 'game_title') {
        app.innerHTML = renderGameTitleScreen();
      } else {
        app.innerHTML = renderDesktopHub();
      }
      attachEvents();
    }

    function renderGameTitleScreen() {
      const name = state.userProfile.name ? state.userProfile.name.trim() : 'تلميذ البكالوريا';
      const stream = state.userProfile.stream || 'شعبة علوم تجريبية';
      const motto = state.userProfile.motto || 'طريقي نحو التفوق ونيل شهادة البكالوريا بمعدل ممتاز';

      return \`
        <div class="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <!-- Background Glows -->
          <div class="absolute top-10 right-10 w-48 h-48 rounded-full bg-pink-200/50 blur-3xl pointer-events-none animate-pulse-slow"></div>
          <div class="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-rose-200/40 blur-3xl pointer-events-none animate-pulse-slow"></div>

          <!-- Main Glass Card -->
          <div class="w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-10 border-2 brand-border flex flex-col md:flex-row items-center gap-8 relative z-10 shadow-2xl">
            <!-- Left Banner / Passport -->
            <div class="w-full md:w-1/2 flex flex-col items-center text-center">
              <div class="relative w-full max-w-xs rounded-2xl overflow-hidden border-2 brand-border shadow-md bg-gradient-to-br from-pink-400 via-rose-300 to-purple-300 p-1">
                <div class="bg-white/80 backdrop-blur-md rounded-xl p-5 text-center flex flex-col items-center">
                  <div class="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-3 bg-pink-50 flex items-center justify-center">
                    <img src="\${state.userProfile.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=BacStudent'}" alt="Avatar" class="w-full h-full object-cover">
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold brand-btn tracking-wider mb-1 font-comfortaa">
                    بطاقة التلميذ الممتاز
                  </span>
                  <h3 class="text-xl font-black text-slate-800 font-sans">\${name}</h3>
                  <p class="text-xs text-slate-500 font-semibold mt-0.5">\${stream}</p>
                  <p class="text-[11px] text-pink-600 italic mt-2 bg-pink-50/80 px-2.5 py-1.5 rounded-lg border border-pink-100 max-w-full">
                    "\${motto}"
                  </p>
                </div>
              </div>

              <div class="mt-4">
                <h1 class="text-2xl sm:text-3xl font-extrabold brand-text tracking-wide font-sans">
                  نظام دراسة البكالوريا الوردي
                </h1>
                <p class="text-xs text-pink-500 font-bold uppercase tracking-widest mt-1 font-comfortaa">
                  BAC EXCELLENCE PLANNER · INDEX EDITION
                </p>
              </div>
            </div>

            <!-- Right Buttons Menu -->
            <div class="w-full md:w-1/2 flex flex-col items-center gap-3.5">
              <button id="btn-play-game" class="w-full max-w-xs py-3.5 px-6 rounded-2xl brand-btn text-white font-bold text-lg shadow-md flex items-center justify-between group cursor-pointer">
                <span>ابدأ الدراسة (PLAY)</span>
                <span class="text-xl">▶</span>
              </button>

              <button id="btn-open-profile-menu" class="w-full max-w-xs py-3 px-6 rounded-2xl bg-white border-2 brand-border brand-text font-bold text-base hover:bg-pink-50/70 shadow-sm flex items-center justify-between cursor-pointer">
                <span>الملف الشخصي للطالب</span>
                <span class="text-lg">👤</span>
              </button>

              <button id="btn-open-settings-menu" class="w-full max-w-xs py-3 px-6 rounded-2xl bg-white border-2 brand-border brand-text font-bold text-base hover:bg-pink-50/70 shadow-sm flex items-center justify-between cursor-pointer">
                <span>الإعدادات وتخصيص الألوان</span>
                <span class="text-lg">⚙️</span>
              </button>

              <button id="btn-download-app-menu" class="w-full max-w-xs py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-base hover:from-emerald-600 hover:to-teal-700 shadow-md flex items-center justify-between cursor-pointer">
                <span>تحميل التطبيق كملف INDEX</span>
                <span class="text-lg">📥</span>
              </button>

              <div class="mt-2 text-center text-xs text-slate-400 font-mono">
                نسخة كاملة مستقلة تعمل 100% بدون إنترنت
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    function renderDesktopHub() {
      const streak = state.pomodoroStats?.streakDays || 0;
      const totalHours = ((state.pomodoroStats?.totalSecondsStudied || 0) / 3600).toFixed(1);
      const name = state.userProfile.name ? state.userProfile.name.trim() : 'تلميذ الباك';
      const daysLeft = calculateBacDays();

      return \`
        <!-- Top Status Bar -->
        <header class="w-full glass-card border-b brand-border px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <!-- Right: Profile & Game Menu -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 cursor-pointer" id="top-profile-badge">
              <div class="w-9 h-9 rounded-full overflow-hidden border-2 brand-border shadow-xs bg-pink-100 flex items-center justify-center">
                <img src="\${state.userProfile.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=BacStudent'}" class="w-full h-full object-cover">
              </div>
              <div class="hidden sm:block text-right">
                <span class="text-xs font-bold brand-text block leading-tight">\${name}</span>
                <span class="text-[10px] text-slate-400 font-medium">\${state.userProfile.stream || 'بكالوريا'}</span>
              </div>
            </div>

            <button id="btn-back-to-game" class="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 brand-text text-xs font-bold flex items-center gap-1 transition-all cursor-pointer">
              <span>🎮 القائمة</span>
            </button>
          </div>

          <!-- Center: Badges -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border brand-border brand-text text-xs font-bold">
              <span class="text-sm">⏳</span>
              <span>باقي \${daysLeft} يوم للباك</span>
            </div>

            <div class="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold font-mono">
              <span>🔥 \${streak} أيام حماس</span>
            </div>

            <div class="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold font-mono">
              <span>⏱️ \${totalHours} ساعة دراسة</span>
            </div>
          </div>

          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button id="btn-top-download" class="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer" title="تحميل التطبيق كملف كامل">
              <span>📥 تحميل INDEX</span>
            </button>

            <button id="btn-top-music" class="w-8 h-8 rounded-xl bg-pink-100 hover:bg-pink-200 brand-text flex items-center justify-center cursor-pointer text-sm" title="مشغل الأصوات والاسترخاء">
              🎵
            </button>

            <button id="btn-top-settings" class="w-8 h-8 rounded-xl bg-pink-100 hover:bg-pink-200 brand-text flex items-center justify-center cursor-pointer text-sm" title="الإعدادات والألوان">
              ⚙️
            </button>
          </div>
        </header>

        <!-- Main Body: Sidebar Dock + Active View Content -->
        <div class="flex-1 flex w-full relative">
          <!-- Sleek Right Sidebar Navigation (RTL layout) -->
          <aside class="w-16 sm:w-20 glass-card border-l brand-border flex flex-col items-center py-4 gap-2 shrink-0 z-20">
            \${renderDockButton('home', '🏠', 'الرئيسية')}
            \${renderDockButton('subjects', '📚', 'المواد')}
            \${renderDockButton('pomodoro', '⏱️', 'بومودورو')}
            \${renderDockButton('months', '🎯', 'الأشهر')}
            \${renderDockButton('schedule', '📅', 'الجدول')}
            \${renderDockButton('profile', '👤', 'حسابي')}

            <div class="mt-auto flex flex-col gap-2 pt-2 border-t brand-border w-full items-center">
              <button id="dock-btn-settings" class="w-10 h-10 rounded-2xl bg-white hover:bg-pink-100 brand-text border brand-border flex items-center justify-center text-base cursor-pointer shadow-xs" title="الإعدادات">
                ⚙️
              </button>
            </div>
          </aside>

          <!-- Main View Canvas -->
          <main class="flex-1 min-w-0 p-4 sm:p-6 max-w-6xl mx-auto w-full overflow-y-auto">
            \${renderCurrentTabContent()}
          </main>
        </div>

        \${renderModals()}
      \`;
    }

    function renderDockButton(tabKey, icon, label) {
      const isActive = currentTab === tabKey;
      return \`
        <button onclick="switchTab('\${tabKey}')" class="w-12 h-12 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer \${
          isActive
            ? 'brand-btn shadow-md scale-105'
            : 'bg-white hover:bg-pink-50 brand-text border brand-border'
        }" title="\${label}">
          <span class="text-base leading-none">\${icon}</span>
          <span class="text-[9px] font-bold truncate max-w-[44px]">\${label}</span>
        </button>
      \`;
    }

    function renderCurrentTabContent() {
      switch(currentTab) {
        case 'home': return renderHomeView();
        case 'subjects': return renderSubjectsView();
        case 'pomodoro': return renderPomodoroView();
        case 'months': return renderMonthsView();
        case 'schedule': return renderScheduleView();
        case 'profile': return renderProfileView();
        default: return renderHomeView();
      }
    }

    // TAB 1: Home Dashboard View
    function renderHomeView() {
      const daysLeft = calculateBacDays();
      const totalHours = ((state.pomodoroStats?.totalSecondsStudied || 0) / 3600).toFixed(1);
      const streak = state.pomodoroStats?.streakDays || 0;
      
      // Calculate subjects progress
      const subjects = state.subjects || [];
      let totalLessons = 0;
      let completedLessons = 0;
      subjects.forEach(s => {
        (s.units || []).forEach(u => {
          (u.lessons || []).forEach(l => {
            totalLessons++;
            if (l.status === 'mastered') completedLessons++;
          });
        });
      });
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return \`
        <div class="space-y-6 animate-fadeIn">
          <!-- Download Banner Alert -->
          <div class="glass-card rounded-2xl p-4 border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="text-3xl">💾</span>
              <div>
                <h4 class="text-sm font-bold text-emerald-900">تطبيق البكالوريا كامل بصيغة INDEX متاح للتحميل!</h4>
                <p class="text-xs text-emerald-700">يمكنك حفظ هذا الملف على جهازك وتشغيله مباشرة دون إنترنت مع حفظ كافة بياناتك ودروسك.</p>
              </div>
            </div>
            <button onclick="triggerFileDownload()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md whitespace-nowrap cursor-pointer flex items-center gap-1.5">
              <span>📥 تحميل ملف index.html الآن</span>
            </button>
          </div>

          <!-- Hero Greeting -->
          <div class="glass-card rounded-3xl p-6 border brand-border bg-gradient-to-br from-white/90 via-pink-50/50 to-rose-50/70 relative overflow-hidden shadow-sm">
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span class="px-3 py-1 rounded-full text-xs font-bold brand-btn font-comfortaa">
                  مرحباً بك، \${state.userProfile.name || 'طالب البكالوريا'} 🌸
                </span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-800 mt-2">
                  فلنجعل اليوم خطوة حقيقية نحو الامتياز!
                </h2>
                <p class="text-xs text-slate-600 mt-1 max-w-xl">
                  "\${state.userProfile.motto || 'لا مكان للمستحيل مع الإصرار والمراجعة الذكية والتوكل على الله.'}"
                </p>
              </div>

              <div class="flex items-center gap-3">
                <button onclick="switchTab('pomodoro')" class="px-5 py-3 rounded-2xl brand-btn text-white font-bold text-sm shadow-md flex items-center gap-2 cursor-pointer">
                  <span>⏱️ ابدأ جلسة بومودورو</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Stats 4 Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">⏳</span>
              <span class="text-2xl font-black brand-text font-mono">\${daysLeft}</span>
              <span class="text-xs text-slate-500 font-bold block mt-0.5">يوم للبكالوريا</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">🔥</span>
              <span class="text-2xl font-black text-rose-500 font-mono">\${streak}</span>
              <span class="text-xs text-slate-500 font-bold block mt-0.5">أيام متتالية</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">📖</span>
              <span class="text-2xl font-black text-purple-600 font-mono">\${totalHours}h</span>
              <span class="text-xs text-slate-500 font-bold block mt-0.5">ساعات المراجعة</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">🎯</span>
              <span class="text-2xl font-black text-emerald-600 font-mono">\${progressPercent}%</span>
              <span class="text-xs text-slate-500 font-bold block mt-0.5">إتقان المنهاج</span>
            </div>
          </div>

          <!-- Subject Progress Overview Card -->
          <div class="glass-card rounded-3xl p-5 border brand-border space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold brand-text flex items-center gap-2">
                <span>📚</span> نسبة الإنجاز في مواد البكالوريا
              </h3>
              <button onclick="switchTab('subjects')" class="text-xs brand-text font-bold hover:underline cursor-pointer">
                عرض جميع الدروس والمحاور ←
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              \${subjects.slice(0, 6).map(s => {
                let sTotal = 0;
                let sDone = 0;
                (s.units || []).forEach(u => (u.lessons || []).forEach(l => {
                  sTotal++;
                  if (l.status === 'mastered') sDone++;
                }));
                const pct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
                return \`
                  <div class="p-3 rounded-2xl bg-white/70 border brand-border space-y-1.5">
                    <div class="flex items-center justify-between text-xs font-bold">
                      <span class="text-slate-700">\${s.name}</span>
                      <span class="brand-text font-mono">\${pct}%</span>
                    </div>
                    <div class="w-full h-2 rounded-full bg-pink-100 overflow-hidden">
                      <div class="h-full brand-btn rounded-full transition-all duration-500" style="width: \${pct}%"></div>
                    </div>
                    <div class="flex justify-between text-[10px] text-slate-400">
                      <span>المعامل: \${s.coefficient}</span>
                      <span>\${sDone}/\${sTotal} درس</span>
                    </div>
                  </div>
                \`;
              }).join('')}
            </div>
          </div>
        </div>
      \`;
    }

    // TAB 2: BAC Subjects View
    function renderSubjectsView() {
      const subjects = state.subjects || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black brand-text">📚 متابعة مواد ومنهاج البكالوريا</h2>
              <p class="text-xs text-slate-500">سجل تقدمك في كل درس، من البداية حتى الحفظ والإتقان التام.</p>
            </div>
          </div>

          <div class="space-y-4">
            \${subjects.map((sub, sIdx) => {
              let total = 0;
              let done = 0;
              (sub.units || []).forEach(u => (u.lessons || []).forEach(l => {
                total++;
                if (l.status === 'mastered') done++;
              }));
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return \`
                <div class="glass-card rounded-2xl border brand-border overflow-hidden p-4 space-y-3">
                  <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b brand-border">
                    <div class="flex items-center gap-2.5">
                      <span class="w-8 h-8 rounded-xl brand-btn text-white font-bold flex items-center justify-center text-xs">
                        \${sub.code || 'BAC'}
                      </span>
                      <div>
                        <h3 class="text-base font-extrabold text-slate-800">\${sub.name}</h3>
                        <span class="text-[11px] text-slate-400 font-medium">المعامل: \${sub.coefficient} · \${done} من \${total} دروس تم إتقانها</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-3">
                      <div class="w-28 sm:w-36 h-2.5 rounded-full bg-pink-100 overflow-hidden">
                        <div class="h-full brand-btn rounded-full" style="width: \${pct}%"></div>
                      </div>
                      <span class="text-xs font-bold brand-text font-mono">\${pct}%</span>
                    </div>
                  </div>

                  <!-- Units & Lessons -->
                  <div class="space-y-3 pt-1">
                    \${(sub.units || []).map((u, uIdx) => \`
                      <div class="rounded-xl bg-pink-50/50 p-3 border brand-border space-y-2">
                        <h4 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-full brand-btn"></span>
                          \${u.title}
                        </h4>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          \${(u.lessons || []).map((l, lIdx) => {
                            const isDone = l.status === 'mastered';
                            const isStudying = l.status === 'studying';
                            let statusClass = 'bg-white border-slate-200 text-slate-700';
                            let badge = 'لم يبدأ';
                            if (isDone) {
                              statusClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold';
                              badge = 'تم الإتقان ✓';
                            } else if (isStudying) {
                              statusClass = 'bg-amber-50 border-amber-300 text-amber-800 font-medium';
                              badge = 'قيد المراجعة ⏳';
                            }
                            return \`
                              <div onclick="toggleLessonStatus(\${sIdx}, \${uIdx}, \${lIdx})" class="p-2.5 rounded-xl border \${statusClass} text-xs flex items-center justify-between cursor-pointer hover:shadow-xs transition-all select-none">
                                <span class="truncate flex-1 ml-2">\${l.name}</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/80 border shrink-0">\${badge}</span>
                              </div>
                            \`;
                          }).join('')}
                        </div>
                      </div>
                    \`).join('')}
                  </div>

                  <!-- Notes field -->
                  <div class="pt-2">
                    <textarea placeholder="ملاحظات وروابط وملخصات خاصة بمادة \${sub.name}..." onchange="updateSubjectNotes(\${sIdx}, this.value)" class="w-full text-xs p-2.5 rounded-xl bg-white border brand-border focus:outline-none focus:ring-1 focus:ring-pink-400 font-sans resize-none h-14">\${sub.notes || ''}</textarea>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    // TAB 3: Pomodoro Study Timer
    function renderPomodoroView() {
      const streak = state.pomodoroStats?.streakDays || 0;
      const totalHours = ((state.pomodoroStats?.totalSecondsStudied || 0) / 3600).toFixed(1);
      const todayMinutes = Math.floor((state.pomodoroStats?.todaySeconds || 0) / 60);

      return \`
        <div class="max-w-xl mx-auto space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-black brand-text">⏱️ مؤقت بومودورو الدراسي الذكي</h2>
            <p class="text-xs text-slate-500">تقنية 25 دقيقة تركيز تام مع 5 دقائق راحة لزيادة الإنتاجية والاستيعاب.</p>
          </div>

          <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 brand-border text-center shadow-lg relative overflow-hidden">
            <!-- Mode Switcher -->
            <div class="flex items-center justify-center gap-2 mb-6">
              <button onclick="setPomoMode('work')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'work' ? 'brand-btn shadow-xs' : 'bg-pink-50 brand-text'}">
                تركيز (25د)
              </button>
              <button onclick="setPomoMode('short')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'short' ? 'brand-btn shadow-xs' : 'bg-pink-50 brand-text'}">
                راحة قصيرة (5د)
              </button>
              <button onclick="setPomoMode('long')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'long' ? 'brand-btn shadow-xs' : 'bg-pink-50 brand-text'}">
                راحة طويلة (15د)
              </button>
            </div>

            <!-- Big Digital Timer Display -->
            <div class="my-6">
              <span id="pomo-display" class="text-6xl sm:text-7xl font-black font-mono tracking-wider brand-text select-all">
                \${formatTime(pomoSecondsLeft)}
              </span>
              <p class="text-xs text-slate-400 mt-2 font-medium">
                \${pomoMode === 'work' ? '📚 جلسة تركيز دراسي ومراجعة' : '☕ استراحة وتجديد النشاط'}
              </p>
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-center gap-3">
              <button onclick="togglePomoTimer()" class="px-8 py-3.5 rounded-2xl brand-btn text-white font-bold text-base shadow-md cursor-pointer flex items-center gap-2">
                <span>\${isPomoRunning ? 'إيقاف مؤقت ⏸' : 'ابدأ الجلسة ▶'}</span>
              </button>
              <button onclick="resetPomoTimer()" class="p-3.5 rounded-2xl bg-white border brand-border brand-text font-bold text-base hover:bg-pink-50 cursor-pointer" title="إعادة تعيين">
                🔄
              </button>
            </div>
          </div>

          <!-- Study Stats -->
          <div class="grid grid-cols-3 gap-3">
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 font-bold block">إنجاز اليوم</span>
              <span class="text-lg font-black brand-text font-mono">\${todayMinutes} دقيقة</span>
            </div>
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 font-bold block">مجموع الساعات</span>
              <span class="text-lg font-black text-purple-600 font-mono">\${totalHours} ساعة</span>
            </div>
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 font-bold block">أيام الحماس</span>
              <span class="text-lg font-black text-rose-500 font-mono">\${streak} أيام</span>
            </div>
          </div>
        </div>
      \`;
    }

    // TAB 4: Monthly Goals & Roadmap
    function renderMonthsView() {
      const months = state.months || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-black brand-text">🎯 خارطة طريق وأهداف الأشهر</h2>
              <p class="text-xs text-slate-500">محطات البكالوريا خطوة بخطوة من بداية الموسم حتى امتحانات جوان.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            \${months.map((m, mIdx) => {
              const goals = m.generalGoals || [];
              const doneCount = goals.filter(g => g.isCompleted).length;
              const pct = goals.length > 0 ? Math.round((doneCount / goals.length) * 100) : 0;

              return \`
                <div class="glass-card rounded-2xl p-4 border brand-border space-y-3">
                  <div class="flex items-center justify-between pb-2 border-b brand-border">
                    <div>
                      <h3 class="text-sm font-black brand-text">\${m.nameAr} - \${m.nameEn}</h3>
                      <span class="text-[10px] text-slate-400 italic">"\${m.quote || 'خطوة نحو النجاح'}"</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold brand-btn font-mono">\${pct}%</span>
                  </div>

                  <div class="space-y-1.5">
                    \${goals.map((g, gIdx) => \`
                      <div onclick="toggleMonthGoal(\${mIdx}, \${gIdx})" class="p-2 rounded-xl bg-white border brand-border flex items-center justify-between text-xs cursor-pointer hover:bg-pink-50/50">
                        <span class="\${g.isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}">\${g.text}</span>
                        <span>\${g.isCompleted ? '✅' : '⬜'}</span>
                      </div>
                    \`).join('')}
                  </div>

                  <!-- Add Goal Input -->
                  <div class="flex gap-2 pt-1">
                    <input type="text" id="new-goal-\${mIdx}" placeholder="أضف هدفاً لهذا الشهر..." class="flex-1 px-3 py-1.5 rounded-xl bg-white border brand-border text-xs focus:outline-none">
                    <button onclick="addMonthGoal(\${mIdx})" class="px-3 py-1.5 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer">
                      + إضافة
                    </button>
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    // TAB 5: Weekly Schedule View
    function renderScheduleView() {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const schedule = state.schedule || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black brand-text">📅 جدول المراجعة الأسبوعي المنظم</h2>
              <p class="text-xs text-slate-500">وزع ساعات دراستك اليومية لتضمن التوازن وتغطية كافة المواد.</p>
            </div>
            <button onclick="addNewScheduleSlot()" class="px-4 py-2 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer shadow-xs">
              + إضافة فترة دراسية جديدة
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            \${days.map((dayName, dIdx) => {
              const dayItems = schedule.filter(item => item.dayIndex === dIdx);
              return \`
                <div class="glass-card rounded-2xl p-4 border brand-border space-y-2.5">
                  <div class="flex items-center justify-between pb-1.5 border-b brand-border">
                    <h3 class="text-sm font-extrabold brand-text">\${dayName}</h3>
                    <span class="text-[10px] text-slate-400 font-bold">\${dayItems.length} فترات</span>
                  </div>

                  <div class="space-y-2">
                    \${dayItems.length === 0 ? \`
                      <p class="text-xs text-slate-400 text-center py-4">لا توجد حصص محددة لهذا اليوم</p>
                    \` : dayItems.map(item => \`
                      <div class="p-2.5 rounded-xl bg-white border brand-border space-y-1 text-xs">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-800">\${item.subject}</span>
                          <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-50 brand-text font-bold">\${item.time}</span>
                        </div>
                        <p class="text-[11px] text-slate-500">\${item.task || 'مراجعة عامة وحل تمارين'}</p>
                      </div>
                    \`).join('')}
                  </div>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    // TAB 6: Profile View
    function renderProfileView() {
      const prof = state.userProfile || {};

      return \`
        <div class="max-w-xl mx-auto space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-black brand-text">👤 الملف الشخصي وتخصيص هوية التلميذ</h2>
            <p class="text-xs text-slate-500">خصص اسمك وشعبتك وهدفك لتحفيز مستمر حتى يوم الامتحان.</p>
          </div>

          <div class="glass-card rounded-3xl p-6 border-2 brand-border space-y-4 shadow-sm">
            <div class="flex flex-col items-center gap-3">
              <div class="w-24 h-24 rounded-full border-4 brand-border shadow-md overflow-hidden bg-pink-100 flex items-center justify-center">
                <img id="profile-avatar-preview" src="\${prof.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=BacStudent'}" class="w-full h-full object-cover">
              </div>
              <label class="cursor-pointer px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 brand-text text-xs font-bold border brand-border transition-all">
                <span>تغيير الصورة الرمزية</span>
                <input type="file" accept="image/*" onchange="handleAvatarUpload(event)" class="hidden">
              </label>
            </div>

            <div class="space-y-3 text-right">
              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">اسم التلميذ(ة):</label>
                <input type="text" id="prof-name" value="\${prof.name || ''}" placeholder="اكتب اسمك هنا..." class="w-full px-3 py-2 rounded-xl bg-white border brand-border text-xs focus:outline-none focus:ring-1 focus:ring-pink-400">
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">شعبة البكالوريا:</label>
                <select id="prof-stream" class="w-full px-3 py-2 rounded-xl bg-white border brand-border text-xs focus:outline-none">
                  <option value="شعبة علوم تجريبية" \${prof.stream === 'شعبة علوم تجريبية' ? 'selected' : ''}>شعبة علوم تجريبية</option>
                  <option value="شعبة رياضيات" \${prof.stream === 'شعبة رياضيات' ? 'selected' : ''}>شعبة رياضيات</option>
                  <option value="شعبة تقني رياضي" \${prof.stream === 'شعبة تقني رياضي' ? 'selected' : ''}>شعبة تقني رياضي</option>
                  <option value="شعبة تسيير واقتصاد" \${prof.stream === 'شعبة تسيير واقتصاد' ? 'selected' : ''}>شعبة تسيير واقتصاد</option>
                  <option value="شعبة آداب وفلسفة" \${prof.stream === 'شعبة آداب وفلسفة' ? 'selected' : ''}>شعبة آداب وفلسفة</option>
                  <option value="شعبة لغات أجنبية" \${prof.stream === 'شعبة لغات أجنبية' ? 'selected' : ''}>شعبة لغات أجنبية</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 block mb-1">العبارة التحفيزية أو الشعار:</label>
                <input type="text" id="prof-motto" value="\${prof.motto || ''}" placeholder="طريقي نحو الامتياز ومعدل 18 إن شاء الله..." class="w-full px-3 py-2 rounded-xl bg-white border brand-border text-xs focus:outline-none">
              </div>

              <button onclick="saveProfileChanges()" class="w-full py-3 rounded-xl brand-btn text-white font-bold text-sm shadow-md cursor-pointer mt-2">
                حفظ التعديلات في الملف
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // Modals Container (Music, Settings, Download)
    function renderModals() {
      return \`
        <!-- Settings Modal -->
        \${isSettingsModalOpen ? \`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-fadeIn">
            <div class="w-full max-w-lg glass-card rounded-3xl p-6 border-2 brand-border space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div class="flex items-center justify-between pb-3 border-b brand-border">
                <h3 class="text-base font-black brand-text">⚙️ إعدادات التطبيق وتخصيص الألوان</h3>
                <button onclick="closeSettingsModal()" class="w-7 h-7 rounded-lg bg-pink-100 brand-text font-bold cursor-pointer">✕</button>
              </div>

              <!-- Color picker -->
              <div class="p-3.5 rounded-2xl bg-white/70 border brand-border space-y-2">
                <label class="text-xs font-bold text-slate-700 block">اختر لون الموقع الأساسي:</label>
                <div class="flex items-center gap-2">
                  <input type="color" value="\${state.settings.siteColor || '#F472B6'}" onchange="changeSiteColor(this.value)" class="w-10 h-10 rounded-xl cursor-pointer border p-0.5">
                  <span class="text-xs font-mono font-bold text-slate-600">\${state.settings.siteColor || '#F472B6'}</span>
                </div>
              </div>

              <!-- Download index.html Section -->
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2">
                <h4 class="text-xs font-bold text-emerald-900">📥 تحميل التطبيق كملف INDEX كامل ومستقل</h4>
                <p class="text-[11px] text-emerald-700">اضغط الزر التالي لتحميل ملف \`index.html\` الكامل على حاسوبك أو هاتفك واستخدامه في أي وقت دون الحاجة لخادم أو إنترنت.</p>
                <button onclick="triggerFileDownload()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer">
                  تحميل تطبيق index.html الآن
                </button>
              </div>

              <!-- Backup & Reset -->
              <div class="pt-2 flex items-center justify-between text-xs">
                <button onclick="resetAllData()" class="text-rose-500 font-bold hover:underline cursor-pointer">
                  تصفير وإعادة تعيين البيانات
                </button>
                <button onclick="closeSettingsModal()" class="px-4 py-2 rounded-xl brand-btn text-white font-bold cursor-pointer">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        \` : ''}

        <!-- Music Modal -->
        \${isMusicModalOpen ? \`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-fadeIn">
            <div class="w-full max-w-md glass-card rounded-3xl p-6 border-2 brand-border space-y-4 shadow-2xl">
              <div class="flex items-center justify-between pb-3 border-b brand-border">
                <h3 class="text-base font-black brand-text">🎵 أصوات الاسترخاء والتركيز</h3>
                <button onclick="closeMusicModal()" class="w-7 h-7 rounded-lg bg-pink-100 brand-text font-bold cursor-pointer">✕</button>
              </div>

              <div class="space-y-3">
                <div class="p-3 rounded-2xl bg-white border brand-border flex items-center justify-between">
                  <div>
                    <span class="text-xs font-bold text-slate-800 block">صوت المطر الهادئ (أوفلاين)</span>
                    <span class="text-[10px] text-slate-400">مولد أصوات طبيعية يعمل بدون إنترنت</span>
                  </div>
                  <button id="btn-toggle-rain" onclick="toggleRainSound()" class="px-3 py-1.5 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer">
                    تشغيل 🌧️
                  </button>
                </div>
              </div>

              <div class="pt-2 flex justify-end">
                <button onclick="closeMusicModal()" class="px-4 py-2 rounded-xl brand-btn text-white font-bold text-xs cursor-pointer">
                  تم
                </button>
              </div>
            </div>
          </div>
        \` : ''}
      \`;
    }

    // Attach Interactive Event Handlers
    function attachEvents() {
      // Game title buttons
      const btnPlay = document.getElementById('btn-play-game');
      if (btnPlay) {
        btnPlay.onclick = () => {
          WebAudio.playClick();
          currentScreen = 'desktop';
          render();
        };
      }

      const btnProfileMenu = document.getElementById('btn-open-profile-menu');
      if (btnProfileMenu) {
        btnProfileMenu.onclick = () => {
          WebAudio.playClick();
          currentScreen = 'desktop';
          currentTab = 'profile';
          render();
        };
      }

      const btnSettingsMenu = document.getElementById('btn-open-settings-menu');
      if (btnSettingsMenu) {
        btnSettingsMenu.onclick = () => {
          WebAudio.playClick();
          isSettingsModalOpen = true;
          render();
        };
      }

      const btnDownloadAppMenu = document.getElementById('btn-download-app-menu');
      if (btnDownloadAppMenu) {
        btnDownloadAppMenu.onclick = () => {
          triggerFileDownload();
        };
      }

      // Top bar buttons
      const btnBackGame = document.getElementById('btn-back-to-game');
      if (btnBackGame) {
        btnBackGame.onclick = () => {
          WebAudio.playClick();
          currentScreen = 'game_title';
          render();
        };
      }

      const topProfile = document.getElementById('top-profile-badge');
      if (topProfile) {
        topProfile.onclick = () => {
          WebAudio.playClick();
          currentTab = 'profile';
          render();
        };
      }

      const btnTopDownload = document.getElementById('btn-top-download');
      if (btnTopDownload) {
        btnTopDownload.onclick = () => {
          triggerFileDownload();
        };
      }

      const btnTopMusic = document.getElementById('btn-top-music');
      if (btnTopMusic) {
        btnTopMusic.onclick = () => {
          WebAudio.playClick();
          isMusicModalOpen = true;
          render();
        };
      }

      const btnTopSettings = document.getElementById('btn-top-settings');
      if (btnTopSettings) {
        btnTopSettings.onclick = () => {
          WebAudio.playClick();
          isSettingsModalOpen = true;
          render();
        };
      }

      const dockBtnSettings = document.getElementById('dock-btn-settings');
      if (dockBtnSettings) {
        dockBtnSettings.onclick = () => {
          WebAudio.playClick();
          isSettingsModalOpen = true;
          render();
        };
      }
    }

    // Actions & Tab Switching
    window.switchTab = function(tab) {
      WebAudio.playClick();
      currentTab = tab;
      render();
    };

    window.closeSettingsModal = function() {
      isSettingsModalOpen = false;
      render();
    };

    window.closeMusicModal = function() {
      isMusicModalOpen = false;
      render();
    };

    let isRainActive = false;
    window.toggleRainSound = function() {
      isRainActive = !isRainActive;
      WebAudio.toggleRain(isRainActive, 0.15);
      const btn = document.getElementById('btn-toggle-rain');
      if (btn) {
        btn.innerText = isRainActive ? 'إيقاف ⏸' : 'تشغيل 🌧️';
      }
    };

    window.changeSiteColor = function(color) {
      state.settings.siteColor = color;
      saveState();
      updateThemeColor();
      render();
    };

    window.resetAllData = function() {
      if (confirm('هل أنت متأكد من رغبتك في تصفير بيانات الدراسة؟')) {
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveState();
        isSettingsModalOpen = false;
        render();
      }
    };

    // Lessons status toggle
    window.toggleLessonStatus = function(sIdx, uIdx, lIdx) {
      WebAudio.playClick();
      const lesson = state.subjects[sIdx].units[uIdx].lessons[lIdx];
      if (lesson.status === 'not_started') {
        lesson.status = 'studying';
      } else if (lesson.status === 'studying') {
        lesson.status = 'mastered';
        WebAudio.playBell();
      } else {
        lesson.status = 'not_started';
      }
      saveState();
      render();
    };

    window.updateSubjectNotes = function(sIdx, text) {
      state.subjects[sIdx].notes = text;
      saveState();
    };

    // Pomodoro logic
    window.setPomoMode = function(mode) {
      WebAudio.playClick();
      pomoMode = mode;
      if (isPomoRunning) {
        clearInterval(pomoInterval);
        isPomoRunning = false;
      }
      if (mode === 'work') pomoSecondsLeft = 25 * 60;
      else if (mode === 'short') pomoSecondsLeft = 5 * 60;
      else pomoSecondsLeft = 15 * 60;
      render();
    };

    window.togglePomoTimer = function() {
      WebAudio.playClick();
      if (isPomoRunning) {
        clearInterval(pomoInterval);
        isPomoRunning = false;
        render();
      } else {
        isPomoRunning = true;
        render();
        pomoInterval = setInterval(() => {
          if (pomoSecondsLeft > 0) {
            pomoSecondsLeft--;
            if (pomoMode === 'work') {
              state.pomodoroStats.totalSecondsStudied = (state.pomodoroStats.totalSecondsStudied || 0) + 1;
              state.pomodoroStats.todaySeconds = (state.pomodoroStats.todaySeconds || 0) + 1;
              if (pomoSecondsLeft % 10 === 0) saveState();
            }
            const disp = document.getElementById('pomo-display');
            if (disp) disp.innerText = formatTime(pomoSecondsLeft);
          } else {
            clearInterval(pomoInterval);
            isPomoRunning = false;
            WebAudio.playBell();
            if (pomoMode === 'work') {
              state.pomodoroStats.sessionsCompleted = (state.pomodoroStats.sessionsCompleted || 0) + 1;
              saveState();
            }
            render();
          }
        }, 1000);
      }
    };

    window.resetPomoTimer = function() {
      WebAudio.playClick();
      if (isPomoRunning) {
        clearInterval(pomoInterval);
        isPomoRunning = false;
      }
      if (pomoMode === 'work') pomoSecondsLeft = 25 * 60;
      else if (pomoMode === 'short') pomoSecondsLeft = 5 * 60;
      else pomoSecondsLeft = 15 * 60;
      render();
    };

    // Monthly goals
    window.toggleMonthGoal = function(mIdx, gIdx) {
      WebAudio.playClick();
      const g = state.months[mIdx].generalGoals[gIdx];
      g.isCompleted = !g.isCompleted;
      if (g.isCompleted) WebAudio.playBell();
      saveState();
      render();
    };

    window.addMonthGoal = function(mIdx) {
      const input = document.getElementById('new-goal-' + mIdx);
      if (!input || !input.value.trim()) return;
      WebAudio.playClick();
      state.months[mIdx].generalGoals.push({
        id: 'g-' + Date.now(),
        text: input.value.trim(),
        isCompleted: false
      });
      saveState();
      render();
    };

    // Schedule
    window.addNewScheduleSlot = function() {
      const subject = prompt('اسم المادة:');
      if (!subject) return;
      const time = prompt('الوقت (مثال 18:00 - 20:00):', '18:00 - 20:00') || '18:00';
      const day = prompt('اليوم (0 للأحد، 1 للإثنين، ... 6 للسبت):', '0');
      const dayIdx = parseInt(day) || 0;
      state.schedule.push({
        id: 'sch-' + Date.now(),
        dayIndex: dayIdx,
        time: time,
        subject: subject,
        task: 'مراجعة وتمارين',
        isCompleted: false,
        colorTag: '#F472B6'
      });
      saveState();
      render();
    };

    // Profile
    window.saveProfileChanges = function() {
      const nameInput = document.getElementById('prof-name');
      const streamInput = document.getElementById('prof-stream');
      const mottoInput = document.getElementById('prof-motto');
      if (nameInput) state.userProfile.name = nameInput.value.trim();
      if (streamInput) state.userProfile.stream = streamInput.value;
      if (mottoInput) state.userProfile.motto = mottoInput.value.trim();
      saveState();
      WebAudio.playBell();
      alert('تم حفظ بيانات الملف الشخصي بنجاح!');
      render();
    };

    window.handleAvatarUpload = function(e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          state.userProfile.avatar = evt.target.result;
          saveState();
          render();
        };
        reader.readAsDataURL(file);
      }
    };

    // TRIGGER DOWNLOAD OF STANDALONE FILE
    window.triggerFileDownload = function() {
      WebAudio.playBell();
      // Re-serialize with latest in-memory state
      const currentFullHtml = \`<!DOCTYPE html>\\n\` + document.documentElement.outerHTML;
      const blob = new Blob([currentFullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    // Initial render
    render();
  </script>
</body>
</html>`;
}
