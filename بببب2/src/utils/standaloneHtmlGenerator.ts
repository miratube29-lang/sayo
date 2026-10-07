import { UserProfile, BacSubject, MonthData, ScheduleItem, PomodoroStats, AppSettings, TodoItem, WorkspaceItem } from '../types';

interface ExportDataParams {
  userProfile: UserProfile;
  subjects: BacSubject[];
  months: MonthData[];
  schedule: ScheduleItem[];
  pomodoroStats: PomodoroStats;
  settings: AppSettings;
  todos?: TodoItem[];
  workspaceItems?: WorkspaceItem[];
}

export function generateStandaloneHtml(data: ExportDataParams): string {
  const jsonState = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BAC Study Hub - تطبيق دراسة البكالوريا المتكامل</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@300;400;500;600;700;800&family=Comfortaa:wght@400;600;700&family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Alexandria', 'sans-serif'],
            comfortaa: ['Comfortaa', 'sans-serif'],
            fredoka: ['Fredoka', 'sans-serif'],
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
      --brand-heading: #BE185D;
    }
    body {
      font-family: 'Alexandria', sans-serif;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      background-color: ${data.settings?.customBgColor || '#FFF0F5'};
      color: #1e293b;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    body.dark {
      background-color: #000000 !important;
      color: #f8fafc !important;
    }
    body.dark .glass-card {
      background: rgba(12, 12, 15, 0.95) !important;
      border-color: #27272a !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7) !important;
      color: #f4f4f5 !important;
    }
    body.dark .bg-white {
      background-color: #18181b !important;
      color: #f4f4f5 !important;
    }
    body.dark input, body.dark select, body.dark textarea {
      background-color: #18181b !important;
      color: #f4f4f5 !important;
      border-color: #27272a !important;
    }
    body.dark h1, body.dark h2, body.dark h3, body.dark h4, body.dark h5, body.dark h6 {
      color: var(--brand-heading-dark, var(--brand-color, #ffffff)) !important;
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
      box-shadow: 0 10px 25px -5px rgba(244, 114, 182, 0.1);
    }
  </style>
</head>
<body class="${data.settings?.darkMode ? 'dark' : ''} min-h-screen text-slate-800 flex flex-col relative overflow-x-hidden">

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
      }
    };
  </script>

  <!-- Main Root Container -->
  <div id="app" class="flex-1 flex flex-col min-h-screen"></div>

  <!-- Application Logic & Embedded State -->
  <script>
    const INITIAL_STATE = ${jsonState};
    const STORAGE_KEY = 'bac_study_hub_standalone_data';

    const DEFAULT_WORKSPACE = [
      {
        id: 'ws-1',
        title: 'جدول مقارنة واستنتاج المفاهيم',
        type: 'table',
        tableData: {
          headers: ['المفهوم / النظرية', 'المادة والشعبة', 'الخصائص وأهم القوانين', 'ملاحظات وتطبيقات'],
          rows: [
            ['المتتاليات الحسابية', 'الرياضيات', 'Un = U0 + n*r / Un = Up + (n-p)*r', 'تذكر شرط الأساس r'],
            ['المتتاليات الهندسية', 'الرياضيات', 'Vn = V0 * q^n', 'تذكر دراسة التقارب'],
            ['الأكسدة والإرجاع', 'العلوم الفيزيائية', 'المؤكسد يكتسب والمرجع يفقد', 'معادلة النصفية وتفاعل الأكسدة'],
            ['ظاهرة الاستنساخ', 'علوم الطبيعة والحياة', 'تتم في النواة وتتطلب ARN بوليمراز', 'نضج الـ ARNm وخروجه للترجمة']
          ]
        }
      },
      {
        id: 'ws-2',
        title: 'قائمة مراجعة المواد الأساسية',
        type: 'checklist',
        checklistData: [
          { id: 'c-1', text: 'حل موضوعين نموذجيين في الرياضيات مع ضبط الوقت', isDone: false },
          { id: 'c-2', text: 'مراجعة تواريخ وشخصيات الوحدة الأولى في التاريخ', isDone: false },
          { id: 'c-3', text: 'كتابة مقال فلسفي حول الحرية والمسؤولية', isDone: false },
          { id: 'c-4', text: 'حفظ آيات وأحاديث العلوم الإسلامية المقررة', isDone: true }
        ]
      },
      {
        id: 'ws-3',
        title: 'مساحة حرة للملاحظات والأفكار',
        type: 'note',
        content: 'مساحة حرة لكتابة كل ما تحتاجه للتحضير للبكالوريا: استنتاجات سريعة، أفكار مقالات، ملاحظات من الأساتذة، وتدوين القوانين المعقدة.'
      }
    ];

    const DEFAULT_TODOS = [
      { id: 'todo-1', text: 'حل مسألة شاملة في الدوال العددية واللوغاريتم', isCompleted: false, category: 'الرياضيات' },
      { id: 'todo-2', text: 'مراجعة الوحدة الأولى في الفيزياء (المتابعة الزمنية)', isCompleted: false, category: 'الفيزياء' },
      { id: 'todo-3', text: 'حفظ 5 مصطلحات وتواريخ في مادة التاريخ', isCompleted: true, category: 'التاريخ' },
      { id: 'todo-4', text: 'كتابة ملخص درس العلوم الطبيعية (الترجمة والاستنساخ)', isCompleted: false, category: 'العلوم' },
    ];

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
    if (!state.todos || !state.todos.length) state.todos = DEFAULT_TODOS;
    if (!state.workspaceItems || !state.workspaceItems.length) state.workspaceItems = DEFAULT_WORKSPACE;

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch(e){}
    }

    // Set site theme color & dark mode
    function updateTheme() {
      const color = state.settings?.siteColor || '#F472B6';
      const isDark = !!state.settings?.darkMode;
      
      document.documentElement.style.setProperty('--brand-color', color);
      document.documentElement.style.setProperty('--brand-border', color + '40');
      document.documentElement.style.setProperty('--brand-light', color + '15');
      
      if (isDark) {
        document.body.classList.add('dark');
        document.body.style.backgroundColor = '#000000';
        document.documentElement.style.setProperty('--brand-heading-dark', color === '#000000' ? '#FFFFFF' : color);
      } else {
        document.body.classList.remove('dark');
        document.body.style.backgroundColor = state.settings?.customBgColor || '#FFF0F5';
      }
    }
    updateTheme();

    let currentScreen = 'game_title'; // 'game_title' | 'desktop'
    let currentTab = 'home'; // 'home' | 'subjects' | 'pomodoro' | 'workspace' | 'months' | 'schedule' | 'profile'
    let isSettingsModalOpen = false;
    let isDownloadModalOpen = false;
    let expandedUnits = {}; // Collapsible unit accordion state (closed by default)

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
      const name = state.userProfile?.name ? state.userProfile.name.trim() : 'STUDENT';
      const stream = state.userProfile?.stream || 'BAC CANDIDATE';
      const motto = state.userProfile?.motto || 'طريقي نحو الامتياز والتفوق في شهادة البكالوريا';

      return \`
        <div class="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div class="absolute top-10 right-10 w-48 h-48 rounded-full bg-pink-200/50 dark:bg-pink-900/20 blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-rose-200/40 dark:bg-rose-900/20 blur-3xl pointer-events-none"></div>

          <div class="w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-10 border-2 brand-border flex flex-col md:flex-row items-center gap-8 relative z-10 shadow-2xl">
            <!-- Left Banner -->
            <div class="w-full md:w-1/2 flex flex-col items-center text-center">
              <div class="relative w-full max-w-xs rounded-2xl overflow-hidden border-2 brand-border shadow-md bg-gradient-to-br from-pink-400 via-rose-300 to-purple-300 p-1">
                <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-5 text-center flex flex-col items-center">
                  <div class="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-700 shadow-lg overflow-hidden mb-3 bg-pink-50 dark:bg-zinc-800 flex items-center justify-center">
                    <span class="text-3xl">🌸</span>
                  </div>
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold brand-btn tracking-wider mb-1 font-comfortaa">
                    STUDENT PASS
                  </span>
                  <h3 class="text-xl font-black text-slate-800 dark:text-zinc-100 font-sans">\${name}</h3>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">\${stream}</p>
                  <p class="text-[11px] text-pink-600 dark:text-pink-300 italic mt-2 bg-pink-50/80 dark:bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-pink-100 dark:border-zinc-700 max-w-full">
                    "\${motto}"
                  </p>
                </div>
              </div>

              <div class="mt-4">
                <h1 class="text-2xl sm:text-3xl font-extrabold brand-text tracking-wide font-sans">
                  STUDENT PLANNER
                </h1>
                <p class="text-xs text-pink-500 dark:text-pink-300 font-bold uppercase tracking-widest mt-1 font-comfortaa">
                  BAC STUDY SPACE · INDEX HTML
                </p>
              </div>
            </div>

            <!-- Right Buttons Menu -->
            <div class="w-full md:w-1/2 flex flex-col items-center gap-3">
              <button id="btn-play-game" class="w-full max-w-xs py-3 px-6 rounded-full brand-btn text-white font-bold text-lg shadow-md flex items-center justify-between group cursor-pointer font-comfortaa">
                <span>PLAY</span>
                <span class="text-xl">▶</span>
              </button>

              <button id="btn-open-settings-menu" class="w-full max-w-xs py-3 px-6 rounded-full bg-white dark:bg-zinc-900 border-2 brand-border brand-text font-bold text-base hover:bg-pink-50/70 dark:hover:bg-zinc-800 shadow-sm flex items-center justify-between cursor-pointer font-comfortaa">
                <span>SETTINGS</span>
                <span class="text-lg">⚙️</span>
              </button>

              <button id="btn-download-app-menu" class="w-full max-w-xs py-2.5 px-5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-between cursor-pointer font-comfortaa">
                <span>DOWNLOAD INDEX.HTML</span>
                <span class="text-sm">📥</span>
              </button>

              <div class="mt-2 text-center text-xs text-slate-400 dark:text-zinc-500 font-mono">
                نسخة كاملة مستقلة تعمل 100% بدون إنترنت مع حفظ كافة البيانات
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    function renderDesktopHub() {
      const streak = state.pomodoroStats?.streakDays || 0;
      const totalHours = ((state.pomodoroStats?.totalSecondsStudied || 0) / 3600).toFixed(1);
      const name = state.userProfile?.name ? state.userProfile.name.trim() : 'طالب البكالوريا';
      const daysLeft = calculateBacDays();

      return \`
        <!-- Top Status Bar -->
        <header class="w-full glass-card border-b brand-border px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <!-- Right: Profile & Game Menu -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-2 cursor-pointer" onclick="switchTab('profile')">
              <div class="w-8 h-8 rounded-full border-2 brand-border shadow-xs bg-pink-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs brand-text">
                \${name.charAt(0).toUpperCase()}
              </div>
              <div class="hidden sm:block text-right">
                <span class="text-xs font-bold brand-text block leading-tight">\${name}</span>
                <span class="text-[10px] text-slate-400 dark:text-zinc-400 font-medium">\${state.userProfile?.stream || 'بكالوريا'}</span>
              </div>
            </div>

            <button onclick="currentScreen = 'game_title'; render();" class="px-2.5 py-1 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 brand-text text-xs font-bold flex items-center gap-1 transition-all cursor-pointer">
              <span>🎮 القائمة</span>
            </button>
          </div>

          <!-- Center: Badges -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-900 border brand-border brand-text text-xs font-bold">
              <span>⏳</span>
              <span>باقي \${daysLeft} يوم للباك</span>
            </div>

            <div class="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
              <span>🔥 \${streak}d STREAK</span>
            </div>

            <div class="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-zinc-900 border border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold font-mono">
              <span>⏱️ \${totalHours}h</span>
            </div>
          </div>

          <!-- Left: Action Buttons -->
          <div class="flex items-center gap-2">
            <button onclick="triggerFileDownload()" class="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer font-mono" title="تحميل التطبيق كملف index.html كامل">
              <span>📥 index.html</span>
            </button>

            <button onclick="isSettingsModalOpen = true; render();" class="w-8 h-8 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 brand-text flex items-center justify-center cursor-pointer text-sm" title="الإعدادات والألوان">
              ⚙️
            </button>
          </div>
        </header>

        <!-- Main Body: Sidebar Dock + Active View Content -->
        <div class="flex-1 flex w-full relative">
          <!-- Right Sidebar Navigation (RTL layout) -->
          <aside class="w-16 sm:w-20 glass-card border-l brand-border flex flex-col items-center py-4 gap-2 shrink-0 z-20">
            \${renderDockButton('home', '🏠', 'الرئيسية')}
            \${renderDockButton('subjects', '📚', 'المواد')}
            \${renderDockButton('pomodoro', '⏱️', 'المؤقت')}
            \${renderDockButton('workspace', '📝', 'المساحة')}
            \${renderDockButton('months', '🎯', 'الأشهر')}
            \${renderDockButton('schedule', '📅', 'الجدول')}
            \${renderDockButton('profile', '👤', 'حسابي')}

            <div class="mt-auto flex flex-col gap-2 pt-2 border-t brand-border w-full items-center">
              <button onclick="isSettingsModalOpen = true; render();" class="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-pink-100 dark:hover:bg-zinc-800 brand-text border brand-border flex items-center justify-center text-base cursor-pointer shadow-xs" title="الإعدادات">
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
            : 'bg-white dark:bg-zinc-900 hover:bg-pink-50 dark:hover:bg-zinc-800 brand-text border brand-border'
        }" title="\${label}">
          <span class="text-base leading-none">\${icon}</span>
          <span class="text-[8.5px] font-bold truncate max-w-[46px]">\${label}</span>
        </button>
      \`;
    }

    function renderCurrentTabContent() {
      switch(currentTab) {
        case 'home': return renderHomeView();
        case 'subjects': return renderSubjectsView();
        case 'pomodoro': return renderPomodoroView();
        case 'workspace': return renderWorkspaceView();
        case 'months': return renderMonthsView();
        case 'schedule': return renderScheduleView();
        case 'profile': return renderProfileView();
        default: return renderHomeView();
      }
    }

    // TAB 1: Home Dashboard View with Todo List Widget
    function renderHomeView() {
      const daysLeft = calculateBacDays();
      const totalHours = ((state.pomodoroStats?.totalSecondsStudied || 0) / 3600).toFixed(1);
      const streak = state.pomodoroStats?.streakDays || 0;
      
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
      const todos = state.todos || [];

      return \`
        <div class="space-y-6">
          <!-- Download Banner Alert -->
          <div class="glass-card rounded-2xl p-4 border-2 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div class="flex items-center gap-3">
              <span class="text-3xl">💾</span>
              <div>
                <h4 class="text-sm font-bold text-emerald-900 dark:text-emerald-200">تحميل التطبيق كملف index.html كامل ومستقل</h4>
                <p class="text-xs text-emerald-700 dark:text-emerald-400">الملف يحتوي على التطبيق كاملاً ويعمل مباشرة بنقرة واحدة في أي متصفح وبدون إنترنت.</p>
              </div>
            </div>
            <button onclick="triggerFileDownload()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md whitespace-nowrap cursor-pointer flex items-center gap-1.5 font-mono">
              <span>📥 تحميل ملف index.html الآن</span>
            </button>
          </div>

          <!-- Hero Greeting -->
          <div class="glass-card rounded-3xl p-6 border brand-border relative overflow-hidden shadow-xs">
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span class="px-3 py-1 rounded-full text-xs font-bold brand-btn font-comfortaa">
                  مرحباً بك، \${state.userProfile?.name || 'طالب البكالوريا'} 🌸
                </span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-zinc-100 mt-2">
                  فلنجعل اليوم خطوة حقيقية نحو الامتياز!
                </h2>
                <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-xl">
                  "\${state.userProfile?.motto || 'طريقي نحو الامتياز والتفوق في شهادة البكالوريا.'}"
                </p>
              </div>

              <div class="flex items-center gap-2">
                <button onclick="switchTab('pomodoro')" class="px-4 py-2.5 rounded-2xl brand-btn text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer">
                  <span>⏱️ ابدأ مؤقت المذاكرة</span>
                </button>
                <button onclick="switchTab('workspace')" class="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-800 border brand-border brand-text font-bold text-xs shadow-xs cursor-pointer">
                  <span>📝 الجداول والمساحة الحرة</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Stats 4 Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">⏳</span>
              <span class="text-2xl font-black brand-text font-mono">\${daysLeft}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block mt-0.5">يوم للبكالوريا</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">🔥</span>
              <span class="text-2xl font-black text-rose-500 font-mono">\${streak}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block mt-0.5">أيام حماس</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">📖</span>
              <span class="text-2xl font-black text-purple-600 font-mono">\${totalHours}h</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block mt-0.5">ساعات المذاكرة</span>
            </div>

            <div class="glass-card rounded-2xl p-4 border brand-border text-center">
              <span class="text-2xl block mb-1">🎯</span>
              <span class="text-2xl font-black text-emerald-600 font-mono">\${progressPercent}%</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block mt-0.5">إتقان المنهاج</span>
            </div>
          </div>

          <!-- Main Dashboard Split: Todo List + Subjects Progress -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <!-- Left: TO-DO LIST WIDGET -->
            <div class="lg:col-span-5 glass-card rounded-3xl p-5 border brand-border space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold brand-text flex items-center gap-1.5">
                  <span>📝</span> قائمة المهام اليومية (TO-DO LIST)
                </h3>
                <span class="text-xs font-mono font-bold brand-text">
                  \${todos.filter(t => t.isCompleted).length} / \${todos.length}
                </span>
              </div>

              <!-- Add Todo Form -->
              <form onsubmit="addTodoItem(event)" class="flex gap-1.5">
                <input type="text" id="new-todo-input" placeholder="أضف مهمة دراسية جديدة..." class="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border brand-border text-xs focus:outline-none" required>
                <button type="submit" class="px-3.5 py-2 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer font-comfortaa">
                  ADD
                </button>
              </form>

              <!-- Todo List Items -->
              <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                \${todos.map((t, idx) => \`
                  <div class="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900 border brand-border flex items-center justify-between gap-2 text-xs group">
                    <div onclick="toggleTodoItem(\${idx})" class="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <span>\${t.isCompleted ? '✅' : '⬜'}</span>
                      <span class="\${t.isCompleted ? 'line-through text-slate-400 dark:text-zinc-500' : 'text-slate-800 dark:text-zinc-200 font-medium'} truncate">\${t.text}</span>
                    </div>
                    <button onclick="deleteTodoItem(\${idx})" class="text-slate-300 hover:text-rose-500 cursor-pointer text-xs p-1" title="حذف">🗑️</button>
                  </div>
                \`).join('')}
              </div>
            </div>

            <!-- Right: Subject Progress Overview -->
            <div class="lg:col-span-7 glass-card rounded-3xl p-5 border brand-border space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold brand-text flex items-center gap-2">
                  <span>📚</span> نسبة الإنجاز في مواد البكالوريا
                </h3>
                <button onclick="switchTab('subjects')" class="text-xs brand-text font-bold hover:underline cursor-pointer">
                  عرض المواد والدروس ←
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                \${subjects.slice(0, 6).map(s => {
                  let sTotal = 0;
                  let sDone = 0;
                  (s.units || []).forEach(u => (u.lessons || []).forEach(l => {
                    sTotal++;
                    if (l.status === 'mastered') sDone++;
                  }));
                  const pct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
                  return \`
                    <div class="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900 border brand-border space-y-1.5">
                      <div class="flex items-center justify-between text-xs font-bold">
                        <span class="text-slate-800 dark:text-zinc-200">\${s.name}</span>
                        <span class="brand-text font-mono">\${pct}%</span>
                      </div>
                      <div class="w-full h-2 rounded-full bg-pink-100 dark:bg-zinc-800 overflow-hidden">
                        <div class="h-full brand-btn rounded-full transition-all duration-500" style="width: \${pct}%"></div>
                      </div>
                      <div class="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                        <span>المعامل: ×\${s.coefficient}</span>
                        <span>\${sDone}/\${sTotal} درس</span>
                      </div>
                    </div>
                  \`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // TAB 2: BAC Subjects View (with Collapsible Accordion & Editability)
    function renderSubjectsView() {
      const subjects = state.subjects || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black brand-text">📚 منهاج ومواد البكالوريا (المحاور والدروس)</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">انقر على أي محور لفتحه أو إغلاقه لتنظيم مساحة المذاكرة.</p>
            </div>
            <button onclick="addCustomSubject()" class="px-3.5 py-1.5 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer">
              + إضافة مادة جديدة
            </button>
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
                        <h3 class="text-base font-extrabold text-slate-800 dark:text-zinc-100">\${sub.name}</h3>
                        <span class="text-[11px] text-slate-400 dark:text-zinc-400 font-medium">المعامل: ×\${sub.coefficient} · \${done} من \${total} دروس تم إتقانها</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-3">
                      <div class="w-28 sm:w-36 h-2 rounded-full bg-pink-100 dark:bg-zinc-800 overflow-hidden">
                        <div class="h-full brand-btn rounded-full" style="width: \${pct}%"></div>
                      </div>
                      <span class="text-xs font-bold brand-text font-mono">\${pct}%</span>

                      <button onclick="addCustomUnit(\${sIdx})" class="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-zinc-800 brand-text text-xs font-bold border brand-border cursor-pointer" title="إضافة محور جديد">
                        + محور
                      </button>
                    </div>
                  </div>

                  <!-- Units (Collapsible Accordion) -->
                  <div class="space-y-2 pt-1">
                    \${(sub.units || []).map((u, uIdx) => {
                      const unitKey = sIdx + '-' + uIdx;
                      const isExpanded = !!expandedUnits[unitKey];
                      const uTotal = (u.lessons || []).length;
                      const uDone = (u.lessons || []).filter(l => l.status === 'mastered').length;

                      return \`
                        <div class="rounded-xl bg-pink-50/50 dark:bg-zinc-900 border brand-border overflow-hidden">
                          <!-- Unit Header: Click expands/collapses -->
                          <div onclick="toggleUnitCollapse('\${unitKey}')" class="p-3 flex items-center justify-between cursor-pointer select-none hover:bg-pink-100/50 dark:hover:bg-zinc-800 transition-colors">
                            <h4 class="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                              <span class="text-[10px] brand-text">\${isExpanded ? '▼' : '◀'}</span>
                              <span>\${u.title}</span>
                            </h4>
                            <div class="flex items-center gap-2">
                              <span class="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-mono font-bold border brand-border">
                                \${uDone}/\${uTotal}
                              </span>
                              <button onclick="event.stopPropagation(); addCustomLesson(\${sIdx}, \${uIdx});" class="text-[10px] px-2 py-0.5 rounded-md brand-btn text-white font-bold cursor-pointer">
                                + درس
                              </button>
                            </div>
                          </div>

                          <!-- Lessons List (Shown only when expanded) -->
                          \${isExpanded ? \`
                            <div class="p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fadeIn border-t border-pink-100 dark:border-zinc-800 mt-1">
                              \${(u.lessons || []).map((l, lIdx) => {
                                const isDone = l.status === 'mastered';
                                const isStudying = l.status === 'studying';
                                let statusClass = 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300';
                                let badge = 'لم يبدأ';
                                if (isDone) {
                                  statusClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-300 font-bold';
                                  badge = 'تم الإتقان ✓';
                                } else if (isStudying) {
                                  statusClass = 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300 font-medium';
                                  badge = 'قيد المراجعة ⏳';
                                }
                                return \`
                                  <div onclick="toggleLessonStatus(\${sIdx}, \${uIdx}, \${lIdx})" class="p-2.5 rounded-xl border \${statusClass} text-xs flex items-center justify-between cursor-pointer hover:shadow-xs transition-all select-none">
                                    <span class="truncate flex-1 ml-2">\${l.name}</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-zinc-800 border shrink-0">\${badge}</span>
                                  </div>
                                \`;
                              }).join('')}
                            </div>
                          \` : ''}
                        </div>
                      \`;
                    }).join('')}
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
        <div class="max-w-xl mx-auto space-y-5">
          <div class="text-center">
            <h2 class="text-xl font-black brand-text">⏱️ مؤقت بومودورو الدراسي (POMODORO)</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400">جلسات تركيز واستراحات منظمة لرفع معدل الاستيعاب والحفظ.</p>
          </div>

          <div class="glass-card rounded-3xl p-6 sm:p-8 border-2 brand-border text-center shadow-lg relative overflow-hidden">
            <!-- Mode Switcher -->
            <div class="flex items-center justify-center gap-2 mb-6">
              <button onclick="setPomoMode('work')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'work' ? 'brand-btn shadow-xs' : 'bg-pink-50 dark:bg-zinc-800 brand-text'}">
                FOCUS (25m)
              </button>
              <button onclick="setPomoMode('short')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'short' ? 'brand-btn shadow-xs' : 'bg-pink-50 dark:bg-zinc-800 brand-text'}">
                BREAK (5m)
              </button>
              <button onclick="setPomoMode('long')" class="px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer \${pomoMode === 'long' ? 'brand-btn shadow-xs' : 'bg-pink-50 dark:bg-zinc-800 brand-text'}">
                LONG (15m)
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
              <button onclick="togglePomoTimer()" class="px-8 py-3.5 rounded-2xl brand-btn text-white font-bold text-base shadow-md cursor-pointer flex items-center gap-2 font-comfortaa">
                <span>\${isPomoRunning ? 'PAUSE ⏸' : 'START ▶'}</span>
              </button>
              <button onclick="resetPomoTimer()" class="p-3.5 rounded-2xl bg-white dark:bg-zinc-800 border brand-border brand-text font-bold text-base hover:bg-pink-50 dark:hover:bg-zinc-700 cursor-pointer" title="إعادة تعيين">
                🔄
              </button>
            </div>
          </div>

          <!-- Free Space & Scratchpad Directly Under Timer -->
          <div class="glass-card rounded-2xl p-4 border brand-border space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold brand-text flex items-center gap-1.5">
                <span>✍️</span> مساحة حرة للملاحظات السريعة تحت المؤقت:
              </span>
              <button onclick="switchTab('workspace')" class="text-xs brand-text font-bold hover:underline cursor-pointer">
                فتح الجداول وقوائم الفحص ←
              </button>
            </div>
            <textarea id="pomo-scratchpad" oninput="savePomoScratchpad(this.value)" placeholder="اكتب هنا قوانين أو استنتاجات الجلسة وملاحظات المذاكرة..." class="w-full text-xs p-3 rounded-xl bg-white dark:bg-zinc-900 border brand-border focus:outline-none h-20 resize-none font-sans">\${state.pomoScratchpad || ''}</textarea>
          </div>

          <!-- Stats 3 Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block">إنجاز اليوم</span>
              <span class="text-lg font-black brand-text font-mono">\${todayMinutes} دقيقة</span>
            </div>
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block">مجموع الساعات</span>
              <span class="text-lg font-black text-purple-600 font-mono">\${totalHours} ساعة</span>
            </div>
            <div class="glass-card rounded-2xl p-3.5 border brand-border text-center">
              <span class="text-xs text-slate-500 dark:text-zinc-400 font-bold block">أيام الحماس</span>
              <span class="text-lg font-black text-rose-500 font-mono">\${streak} أيام</span>
            </div>
          </div>
        </div>
      \`;
    }

    // TAB 4: Free Space Workspace (جداول وقوائم وملاحظات حرة)
    function renderWorkspaceView() {
      const items = state.workspaceItems || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black brand-text">📝 المساحة الحرة والجداول الدراسية (WORKSPACE)</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">مكان حر لإنشاء جداول المقارنات، قوائم المراجعة، وتدوين الأفكار والقوانين.</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="createWorkspaceTable()" class="px-3.5 py-1.5 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer">
                + إنشاء جدول
              </button>
              <button onclick="createWorkspaceChecklist()" class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer">
                + قائمة مراجعة
              </button>
              <button onclick="createWorkspaceNote()" class="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
                + ملاحظة حرة
              </button>
            </div>
          </div>

          <div class="space-y-4">
            \${items.map((item, itemIdx) => {
              if (item.type === 'table') {
                const headers = item.tableData?.headers || [];
                const rows = item.tableData?.rows || [];
                return \`
                  <div class="glass-card rounded-2xl p-4 border brand-border space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b brand-border">
                      <h3 class="text-sm font-bold brand-text flex items-center gap-2">
                        <span>📊</span> \${item.title}
                      </h3>
                      <div class="flex items-center gap-2">
                        <button onclick="addTableRow(\${itemIdx})" class="px-2 py-1 rounded-lg bg-pink-50 dark:bg-zinc-800 brand-text text-xs font-bold border brand-border cursor-pointer">
                          + إضافة صف
                        </button>
                        <button onclick="deleteWorkspaceItem(\${itemIdx})" class="text-slate-400 hover:text-rose-500 text-xs cursor-pointer p-1" title="حذف الجدول">🗑️</button>
                      </div>
                    </div>

                    <div class="overflow-x-auto">
                      <table class="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr class="bg-pink-100/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200">
                            \${headers.map((h, colIdx) => \`
                              <th class="p-2.5 border border-pink-200 dark:border-zinc-700 font-bold">\${h}</th>
                            \`).join('')}
                          </tr>
                        </thead>
                        <tbody>
                          \${rows.map((row, rowIdx) => \`
                            <tr class="hover:bg-pink-50/40 dark:hover:bg-zinc-850">
                              \${row.map((cell, colIdx) => \`
                                <td class="p-2 border border-pink-200 dark:border-zinc-700">
                                  <input type="text" value="\${cell}" onchange="updateTableCell(\${itemIdx}, \${rowIdx}, \${colIdx}, this.value)" class="w-full bg-transparent text-xs p-1 focus:outline-none focus:bg-white dark:focus:bg-zinc-800 rounded">
                                </td>
                              \`).join('')}
                            </tr>
                          \`).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                \`;
              } else if (item.type === 'checklist') {
                const list = item.checklistData || [];
                return \`
                  <div class="glass-card rounded-2xl p-4 border brand-border space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b brand-border">
                      <h3 class="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <span>📋</span> \${item.title}
                      </h3>
                      <div class="flex items-center gap-2">
                        <button onclick="addChecklistItem(\${itemIdx})" class="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-zinc-800 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-zinc-700 cursor-pointer">
                          + إضافة عنصر
                        </button>
                        <button onclick="deleteWorkspaceItem(\${itemIdx})" class="text-slate-400 hover:text-rose-500 text-xs cursor-pointer p-1" title="حذف القائمة">🗑️</button>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      \${list.map((c, cIdx) => \`
                        <div class="p-2 rounded-xl bg-white/70 dark:bg-zinc-900 border border-purple-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
                          <div onclick="toggleWorkspaceCheck(\${itemIdx}, \${cIdx})" class="flex items-center gap-2 cursor-pointer flex-1">
                            <span>\${c.isDone ? '✅' : '⬜'}</span>
                            <span class="\${c.isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-zinc-200 font-medium'}">\${c.text}</span>
                          </div>
                          <button onclick="deleteChecklistItem(\${itemIdx}, \${cIdx})" class="text-slate-300 hover:text-rose-500 text-xs cursor-pointer">✕</button>
                        </div>
                      \`).join('')}
                    </div>
                  </div>
                \`;
              } else {
                return \`
                  <div class="glass-card rounded-2xl p-4 border brand-border space-y-2">
                    <div class="flex items-center justify-between pb-1.5 border-b brand-border">
                      <h3 class="text-sm font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                        <span>📝</span> \${item.title}
                      </h3>
                      <button onclick="deleteWorkspaceItem(\${itemIdx})" class="text-slate-400 hover:text-rose-500 text-xs cursor-pointer p-1" title="حذف">🗑️</button>
                    </div>
                    <textarea onchange="updateNoteContent(\${itemIdx}, this.value)" class="w-full text-xs p-3 rounded-xl bg-white dark:bg-zinc-900 border brand-border focus:outline-none h-24 resize-none font-sans leading-relaxed">\${item.content || ''}</textarea>
                  </div>
                \`;
              }
            }).join('')}
          </div>
        </div>
      \`;
    }

    // TAB 5: Monthly Goals
    function renderMonthsView() {
      const months = state.months || [];
      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-black brand-text">🎯 أهداف ومحطات الأشهر</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">أهداف تفصيلية من بداية التحضير حتى الامتحانات النهائية.</p>
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
                      <span class="text-[10px] text-slate-400 dark:text-zinc-400 italic">"\${m.quote || 'خطوة نحو النجاح'}"</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-bold brand-btn font-mono">\${pct}%</span>
                  </div>

                  <div class="space-y-1.5">
                    \${goals.map((g, gIdx) => \`
                      <div onclick="toggleMonthGoal(\${mIdx}, \${gIdx})" class="p-2 rounded-xl bg-white dark:bg-zinc-900 border brand-border flex items-center justify-between text-xs cursor-pointer hover:bg-pink-50/50">
                        <span class="\${g.isCompleted ? 'line-through text-slate-400 font-medium' : 'text-slate-800 dark:text-zinc-200 font-semibold'}">\${g.text}</span>
                        <span>\${g.isCompleted ? '✅' : '⬜'}</span>
                      </div>
                    \`).join('')}
                  </div>

                  <div class="flex gap-2 pt-1">
                    <input type="text" id="new-goal-\${mIdx}" placeholder="أضف هدفاً لهذا الشهر..." class="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border brand-border text-xs focus:outline-none">
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

    // TAB 6: Schedule View
    function renderScheduleView() {
      const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const schedule = state.schedule || [];

      return \`
        <div class="space-y-6">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 class="text-xl font-black brand-text">📅 جدول المراجعة الأسبوعي المنظم</h2>
              <p class="text-xs text-slate-500 dark:text-zinc-400">تنظيم وتوزيع فترات الدراسة على أيام الأسبوع.</p>
            </div>
            <button onclick="addNewScheduleSlot()" class="px-4 py-2 rounded-xl brand-btn text-white text-xs font-bold cursor-pointer shadow-xs">
              + إضافة فترة جديدة
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
                      <div class="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border brand-border space-y-1 text-xs">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-slate-800 dark:text-zinc-200">\${item.subject}</span>
                          <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-pink-50 dark:bg-zinc-800 brand-text font-bold">\${item.time}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 dark:text-zinc-400">\${item.task || 'مراجعة عامة وحل تمارين'}</p>
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

    // TAB 7: Profile View
    function renderProfileView() {
      const prof = state.userProfile || {};

      return \`
        <div class="max-w-xl mx-auto space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-black brand-text">👤 الملف الشخصي وتخصيص هوية التلميذ</h2>
            <p class="text-xs text-slate-500 dark:text-zinc-400">خصص اسمك وشعبتك وهدفك لتحفيز مستمر حتى يوم الامتحان.</p>
          </div>

          <div class="glass-card rounded-3xl p-6 border-2 brand-border space-y-4 shadow-sm">
            <div class="flex flex-col items-center gap-3">
              <div class="w-20 h-20 rounded-full border-4 brand-border shadow-md overflow-hidden bg-pink-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-2xl brand-text">
                \${(prof.name || 'S').charAt(0).toUpperCase()}
              </div>
            </div>

            <div class="space-y-3 text-right">
              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">اسم التلميذ(ة):</label>
                <input type="text" id="prof-name" value="\${prof.name || ''}" placeholder="اكتب اسمك هنا..." class="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border brand-border text-xs focus:outline-none">
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">شعبة البكالوريا:</label>
                <select id="prof-stream" class="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border brand-border text-xs focus:outline-none">
                  <option value="شعبة علوم تجريبية" \${prof.stream === 'شعبة علوم تجريبية' ? 'selected' : ''}>شعبة علوم تجريبية</option>
                  <option value="شعبة رياضيات" \${prof.stream === 'شعبة رياضيات' ? 'selected' : ''}>شعبة رياضيات</option>
                  <option value="شعبة تقني رياضي" \${prof.stream === 'شعبة تقني رياضي' ? 'selected' : ''}>شعبة تقني رياضي</option>
                  <option value="شعبة تسيير واقتصاد" \${prof.stream === 'شعبة تسيير واقتصاد' ? 'selected' : ''}>شعبة تسيير واقتصاد</option>
                  <option value="شعبة آداب وفلسفة" \${prof.stream === 'شعبة آداب وفلسفة' ? 'selected' : ''}>شعبة آداب وفلسفة</option>
                  <option value="شعبة لغات أجنبية" \${prof.stream === 'شعبة لغات أجنبية' ? 'selected' : ''}>شعبة لغات أجنبية</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">العبارة التحفيزية أو الشعار:</label>
                <input type="text" id="prof-motto" value="\${prof.motto || ''}" placeholder="طريقي نحو الامتياز..." class="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border brand-border text-xs focus:outline-none">
              </div>

              <button onclick="saveProfileChanges()" class="w-full py-3 rounded-xl brand-btn text-white font-bold text-sm shadow-md cursor-pointer mt-2">
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    // Modals Container (Settings & Download)
    function renderModals() {
      return \`
        \${isSettingsModalOpen ? \`
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div class="w-full max-w-lg glass-card rounded-3xl p-6 border-2 brand-border space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div class="flex items-center justify-between pb-3 border-b brand-border">
                <h3 class="text-base font-black brand-text">⚙️ إعدادات العرض والألوان</h3>
                <button onclick="isSettingsModalOpen = false; render();" class="w-7 h-7 rounded-lg bg-pink-100 dark:bg-zinc-800 brand-text font-bold cursor-pointer">✕</button>
              </div>

              <!-- Display Mode Toggle -->
              <div class="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900 border brand-border space-y-2">
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300 block">وضع العرض (Display Mode):</label>
                <div class="grid grid-cols-2 gap-2">
                  <button onclick="toggleDarkMode(false)" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer \${!state.settings?.darkMode ? 'brand-btn' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}">
                    ☀️ لايت مود (Light)
                  </button>
                  <button onclick="toggleDarkMode(true)" class="py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer \${state.settings?.darkMode ? 'brand-btn' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}">
                    🌙 دارك مود أسود (Dark)
                  </button>
                </div>
              </div>

              <!-- Color picker -->
              <div class="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900 border brand-border space-y-2">
                <label class="text-xs font-bold text-slate-700 dark:text-zinc-300 block">اختر لون التطبيق الأساسي:</label>
                <div class="flex items-center gap-2">
                  <input type="color" value="\${state.settings?.siteColor || '#F472B6'}" onchange="changeSiteColor(this.value)" class="w-10 h-10 rounded-xl cursor-pointer border p-0.5">
                  <span class="text-xs font-mono font-bold text-slate-600 dark:text-zinc-300">\${state.settings?.siteColor || '#F472B6'}</span>
                </div>
              </div>

              <!-- Download index.html Section -->
              <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                <h4 class="text-xs font-bold text-emerald-900 dark:text-emerald-200">📥 تحميل التطبيق كملف INDEX كامل ومستقل</h4>
                <p class="text-[11px] text-emerald-700 dark:text-emerald-300">يمكنك حفظ ملف \`index.html\` على جهازك واستخدامه في أي وقت دون الحاجة لإنترنت أو تثبيت برامج.</p>
                <button onclick="triggerFileDownload()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer font-mono">
                  تحميل تطبيق index.html الآن
                </button>
              </div>

              <div class="pt-2 flex items-center justify-between text-xs">
                <button onclick="resetAllData()" class="text-rose-500 font-bold hover:underline cursor-pointer">
                  تصفير البيانات (0)
                </button>
                <button onclick="isSettingsModalOpen = false; render();" class="px-4 py-2 rounded-xl brand-btn text-white font-bold cursor-pointer">
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        \` : ''}
      \`;
    }

    // Attach Event Handlers
    function attachEvents() {
      const btnPlay = document.getElementById('btn-play-game');
      if (btnPlay) {
        btnPlay.onclick = () => {
          WebAudio.playClick();
          currentScreen = 'desktop';
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
    }

    // Actions & Tab Switching
    window.switchTab = function(tab) {
      WebAudio.playClick();
      currentTab = tab;
      render();
    };

    window.toggleDarkMode = function(enable) {
      WebAudio.playClick();
      state.settings.darkMode = enable;
      saveState();
      updateTheme();
      render();
    };

    window.changeSiteColor = function(color) {
      state.settings.siteColor = color;
      saveState();
      updateTheme();
      render();
    };

    // Todo handlers
    window.addTodoItem = function(e) {
      e.preventDefault();
      const input = document.getElementById('new-todo-input');
      if (!input || !input.value.trim()) return;
      WebAudio.playClick();
      if (!state.todos) state.todos = [];
      state.todos.unshift({
        id: 't-' + Date.now(),
        text: input.value.trim(),
        isCompleted: false
      });
      saveState();
      render();
    };

    window.toggleTodoItem = function(idx) {
      WebAudio.playClick();
      state.todos[idx].isCompleted = !state.todos[idx].isCompleted;
      if (state.todos[idx].isCompleted) WebAudio.playBell();
      saveState();
      render();
    };

    window.deleteTodoItem = function(idx) {
      WebAudio.playClick();
      state.todos.splice(idx, 1);
      saveState();
      render();
    };

    // Collapsible units
    window.toggleUnitCollapse = function(key) {
      WebAudio.playClick();
      expandedUnits[key] = !expandedUnits[key];
      render();
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

    window.addCustomSubject = function() {
      const name = prompt('اسم المادة:');
      if (!name) return;
      const coeff = prompt('معامل المادة:', '3') || '3';
      state.subjects.push({
        id: 'sub-' + Date.now(),
        name: name,
        code: name.slice(0, 3).toUpperCase(),
        coefficient: parseInt(coeff) || 3,
        units: []
      });
      saveState();
      render();
    };

    window.addCustomUnit = function(sIdx) {
      const title = prompt('عنوان المحور الجديد:');
      if (!title) return;
      state.subjects[sIdx].units.push({
        id: 'u-' + Date.now(),
        title: title,
        lessons: []
      });
      saveState();
      render();
    };

    window.addCustomLesson = function(sIdx, uIdx) {
      const name = prompt('اسم الدرس الجديد:');
      if (!name) return;
      state.subjects[sIdx].units[uIdx].lessons.push({
        id: 'l-' + Date.now(),
        name: name,
        status: 'not_started'
      });
      saveState();
      render();
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

    window.savePomoScratchpad = function(val) {
      state.pomoScratchpad = val;
      saveState();
    };

    // Workspace logic
    window.createWorkspaceTable = function() {
      const title = prompt('عنوان الجدول الجديد:', 'جدول مقارنة') || 'جدول دراسي';
      state.workspaceItems.unshift({
        id: 'ws-' + Date.now(),
        title: title,
        type: 'table',
        tableData: {
          headers: ['العمود 1', 'العمود 2', 'العمود 3'],
          rows: [['', '', ''], ['', '', '']]
        }
      });
      saveState();
      render();
    };

    window.createWorkspaceChecklist = function() {
      const title = prompt('عنوان قائمة المراجعة:', 'قائمة مراجعة') || 'قائمة مراجعة';
      state.workspaceItems.unshift({
        id: 'ws-' + Date.now(),
        title: title,
        type: 'checklist',
        checklistData: [
          { id: 'c-1', text: 'العنصر الأول', isDone: false },
          { id: 'c-2', text: 'العنصر الثاني', isDone: false }
        ]
      });
      saveState();
      render();
    };

    window.createWorkspaceNote = function() {
      const title = prompt('عنوان الملاحظة:', 'ملاحظة حرة') || 'ملاحظة حرة';
      state.workspaceItems.unshift({
        id: 'ws-' + Date.now(),
        title: title,
        type: 'note',
        content: ''
      });
      saveState();
      render();
    };

    window.addTableRow = function(itemIdx) {
      const headers = state.workspaceItems[itemIdx].tableData.headers;
      state.workspaceItems[itemIdx].tableData.rows.push(headers.map(() => ''));
      saveState();
      render();
    };

    window.updateTableCell = function(itemIdx, rIdx, cIdx, val) {
      state.workspaceItems[itemIdx].tableData.rows[rIdx][cIdx] = val;
      saveState();
    };

    window.addChecklistItem = function(itemIdx) {
      const text = prompt('نص العنصر الجديد:');
      if (!text) return;
      state.workspaceItems[itemIdx].checklistData.push({
        id: 'chk-' + Date.now(),
        text: text,
        isDone: false
      });
      saveState();
      render();
    };

    window.toggleWorkspaceCheck = function(itemIdx, cIdx) {
      WebAudio.playClick();
      state.workspaceItems[itemIdx].checklistData[cIdx].isDone = !state.workspaceItems[itemIdx].checklistData[cIdx].isDone;
      saveState();
      render();
    };

    window.deleteChecklistItem = function(itemIdx, cIdx) {
      state.workspaceItems[itemIdx].checklistData.splice(cIdx, 1);
      saveState();
      render();
    };

    window.updateNoteContent = function(itemIdx, val) {
      state.workspaceItems[itemIdx].content = val;
      saveState();
    };

    window.deleteWorkspaceItem = function(itemIdx) {
      if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        state.workspaceItems.splice(itemIdx, 1);
        saveState();
        render();
      }
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

    window.resetAllData = function() {
      if (confirm('هل أنت متأكد من رغبتك في تصفير بيانات الدراسة؟')) {
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveState();
        isSettingsModalOpen = false;
        render();
      }
    };

    // TRIGGER DOWNLOAD OF STANDALONE FILE
    window.triggerFileDownload = function() {
      WebAudio.playBell();
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
