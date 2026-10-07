import React, { useState } from 'react';
import { 
  Settings, 
  Youtube, 
  Volume2, 
  Palette, 
  X, 
  RotateCcw, 
  Check,
  FolderUp,
  Moon,
  Sun,
  Sparkles,
  Download
} from 'lucide-react';
import { AppSettings } from '../types';
import { sound } from '../utils/audio';
import { readFileAsDataUrl } from '../utils/helpers';
import { extractYouTubeId, PRESET_TRACKS } from './MusicPlayerModal';
import { SITE_COLOR_PRESETS, parseHex } from '../utils/theme';
import { downloadStandaloneIndexHtml } from '../utils/downloadApp';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetData: () => void;
}

const BG_COLOR_PRESETS = [
  { label: 'Pitch Black', hex: '#000000' },
  { label: 'Pure White', hex: '#FFFFFF' },
  { label: 'Soft Pink', hex: '#FFF0F5' },
  { label: 'Cotton Blush', hex: '#FFF5F8' },
  { label: 'Lavender', hex: '#F5F3FF' },
  { label: 'Mint Mist', hex: '#F0FDFA' },
  { label: 'Warm Cream', hex: '#FFFBEB' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetData,
}) => {
  const [youtubeInput, setYoutubeInput] = useState(settings.youtubeUrl);
  const [youtubeError, setYoutubeError] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // Exact Hex text state for precise color picker typing
  const currentSiteColor = settings.siteColor || '#F472B6';
  const [hexInputText, setHexInputText] = useState(currentSiteColor);

  if (!isOpen) return null;

  // Dark Mode Toggle (Light Mode: White / Dark Mode: Pitch Black #000000)
  const handleToggleDarkMode = (enableDark: boolean) => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      darkMode: enableDark,
      // If enabling dark mode, switch background to pitch black #000000 unless a custom photo is set
      customBgColor: enableDark ? '#000000' : (settings.customBgColor === '#000000' ? '#FFF0F5' : settings.customBgColor),
    });
  };

  // One-click True Black for the entire app (خيار لون أسود تماماً للتطبيق كامل)
  const handleSetTrueBlackAll = () => {
    sound.playSuccess();
    setHexInputText('#000000');
    onUpdateSettings({
      ...settings,
      darkMode: true,
      customBgColor: '#000000',
      customBgImage: '',
      siteColor: '#000000',
    });
  };

  const handleSaveYoutube = () => {
    sound.playClick();
    const id = extractYouTubeId(youtubeInput);
    if (!id) {
      setYoutubeError('Please enter a valid YouTube video URL');
      return;
    }
    setYoutubeError('');
    onUpdateSettings({
      ...settings,
      youtubeUrl: youtubeInput.trim(),
      isBgmPlaying: true,
      bgmPreset: 'youtube',
    });
  };

  const handleToggleBgm = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      isBgmPlaying: !settings.isBgmPlaying,
    });
  };

  const handleToggleSoundFx = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      soundFxEnabled: !settings.soundFxEnabled,
    });
  };

  // Precise website theme color change
  const handleSiteColorChange = (color: string) => {
    sound.playClick();
    const formatted = color.startsWith('#') ? color : `#${color}`;
    setHexInputText(formatted);
    onUpdateSettings({
      ...settings,
      siteColor: formatted,
    });
  };

  const handleHexTextBlur = () => {
    const clean = parseHex(hexInputText);
    const validHex = `#${clean}`;
    setHexInputText(validHex);
    onUpdateSettings({
      ...settings,
      siteColor: validHex,
    });
  };

  // Custom background color
  const handleBgColorChange = (color: string) => {
    onUpdateSettings({
      ...settings,
      customBgColor: color,
    });
  };

  // Custom background image upload from PC
  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playClick();
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onUpdateSettings({
          ...settings,
          customBgImage: dataUrl,
        });
      } catch (err) {
        console.error('Failed to read background image', err);
      }
    }
  };

  const handleClearBgImage = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      customBgImage: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-7 shadow-2xl border border-pink-200 dark:border-zinc-800 relative overflow-hidden max-h-[88vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-400 dark:text-pink-300 uppercase tracking-widest block font-['Comfortaa',sans-serif]">
                CONFIGURATION
              </span>
              <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
                SETTINGS & PREFERENCES
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 flex items-center justify-center text-pink-600 dark:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Section 0: DARK MODE & LIGHT MODE (دارك مود أسود ولايت مود أبيض) */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <Moon className="w-4 h-4 text-pink-500" />
                DISPLAY MODE (وضع العرض - لايت مود / دارك مود)
              </h3>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium font-['Comfortaa',sans-serif]">
              Switch between Light Mode (White / Pastel) and Dark Mode (Pitch Black #000000):
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => handleToggleDarkMode(false)}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-['Comfortaa',sans-serif] ${
                  !settings.darkMode
                    ? 'bg-white border-pink-500 text-pink-700 shadow-sm ring-2 ring-pink-300 font-bold'
                    : 'bg-white/60 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-xs">☀️ LIGHT MODE (أبيض)</span>
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => handleToggleDarkMode(true)}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 transition-all font-['Comfortaa',sans-serif] ${
                  settings.darkMode
                    ? 'bg-black border-pink-500 text-white shadow-sm ring-2 ring-pink-400 font-bold'
                    : 'bg-white/60 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800'
                }`}
              >
                <Moon className="w-4 h-4 text-purple-400" />
                <span className="text-xs">🌙 DARK MODE (أسود تماماً)</span>
              </button>
            </div>

            {/* True Black All Action Button */}
            <button
              type="button"
              onClick={handleSetTrueBlackAll}
              className="w-full py-2 px-3 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs shadow-xs border border-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-95 font-['Comfortaa',sans-serif]"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>SET ENTIRE APP TO PURE BLACK #000000 (تطبيق أسود تماماً للتطبيق كامل)</span>
            </button>
          </div>

          {/* Section 1: Website Main Theme Color (دقة اختيار الألوان وحفظها) */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <Palette className="w-4 h-4 text-pink-500" />
                WEBSITE THEME COLOR (لون الموقع الأساسي)
              </h3>
              <button
                type="button"
                onClick={() => handleSiteColorChange('#F472B6')}
                className="text-[10px] text-pink-500 dark:text-pink-400 hover:underline font-bold font-['Comfortaa',sans-serif]"
              >
                Reset to Pink
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium font-['Comfortaa',sans-serif]">
              Pick any exact color for buttons, badges, borders, active tabs, and highlights:
            </p>

            {/* Precise Color Inputs */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentSiteColor.startsWith('#') && currentSiteColor.length === 7 ? currentSiteColor : '#F472B6'}
                onChange={(e) => handleSiteColorChange(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-pink-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5 shadow-xs"
                title="Choose any exact color"
              />
              <input
                type="text"
                value={hexInputText}
                onChange={(e) => setHexInputText(e.target.value)}
                onBlur={handleHexTextBlur}
                className="w-28 px-2.5 py-1.5 rounded-lg border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-semibold text-slate-800 dark:text-zinc-100"
                dir="ltr"
                placeholder="#F472B6"
              />
              <div 
                className="w-8 h-8 rounded-xl shadow-inner border-2 border-white dark:border-zinc-700 shrink-0" 
                style={{ backgroundColor: currentSiteColor }}
                title="Current site color preview"
              />
              <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                Active: {currentSiteColor}
              </span>
            </div>

            {/* Quick Accurate Presets */}
            <div className="pt-1.5 border-t border-pink-100 dark:border-zinc-800">
              <span className="text-[10px] text-pink-600 dark:text-pink-300 font-bold block mb-1.5 font-['Comfortaa',sans-serif]">
                Popular Color Presets (Exact Palettes):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {SITE_COLOR_PRESETS.map((p) => {
                  const isSelected = currentSiteColor.toLowerCase() === p.hex.toLowerCase();
                  return (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => handleSiteColorChange(p.hex)}
                      className={`p-1.5 rounded-xl border text-center transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-pink-500 bg-white dark:bg-zinc-800 shadow-xs ring-2 ring-pink-400 scale-102 font-bold'
                          : 'border-pink-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/70 hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shadow-xs border border-black/20 shrink-0"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-[9px] text-slate-700 dark:text-zinc-300 truncate font-['Comfortaa',sans-serif]">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Custom Background (Color Picker + Pure Black Preset + PC Image Upload) */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-3">
            <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
              <Palette className="w-4 h-4 text-pink-500" />
              BACKGROUND THEME & WALLPAPER
            </h3>

            {/* Color selection */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 block mb-1.5 font-['Comfortaa',sans-serif]">
                Pick Any Background Color:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.customBgColor || (settings.darkMode ? '#000000' : '#FFF0F5')}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="w-9 h-9 rounded-xl cursor-pointer border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-0.5"
                />
                <input
                  type="text"
                  value={settings.customBgColor || (settings.darkMode ? '#000000' : '#FFF0F5')}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-lg border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-semibold text-slate-800 dark:text-zinc-100"
                  dir="ltr"
                />
                <div className="flex flex-wrap gap-1 flex-1">
                  {BG_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => handleBgColorChange(p.hex)}
                      style={{ backgroundColor: p.hex }}
                      className={`w-6 h-6 rounded-lg border transition-all ${
                        settings.customBgColor === p.hex 
                          ? 'border-pink-500 scale-110 shadow-xs ring-1 ring-pink-400' 
                          : 'border-slate-300 dark:border-zinc-700 hover:scale-105'
                      }`}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Custom PC Background Image Upload */}
            <div className="pt-2 border-t border-pink-100 dark:border-zinc-800">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 block mb-1.5 font-['Comfortaa',sans-serif]">
                Upload Background Image from PC:
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-pink-50 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 text-xs font-bold border border-pink-200 dark:border-zinc-700 shadow-xs flex items-center gap-1.5 transition-all font-['Comfortaa',sans-serif]">
                  <FolderUp className="w-3.5 h-3.5 text-pink-500" />
                  <span>UPLOAD WALLPAPER</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                </label>

                {settings.customBgImage && (
                  <button
                    type="button"
                    onClick={handleClearBgImage}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 transition-all font-['Comfortaa',sans-serif]"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              {settings.customBgImage && (
                <div className="mt-2 text-[10px] text-pink-600 dark:text-pink-400 font-mono flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Custom wallpaper active
                </div>
              )}
            </div>
          </div>

          {/* Section 3: YouTube Audio */}
          <div className="p-4 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <Youtube className="w-4 h-4 text-rose-500" />
                BACKGROUND AUDIO (YOUTUBE)
              </h3>
              <button
                onClick={handleToggleBgm}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all font-['Comfortaa',sans-serif] ${
                  settings.isBgmPlaying 
                    ? 'bg-rose-500 text-white shadow-xs' 
                    : 'bg-white dark:bg-zinc-800 border border-pink-200 dark:border-zinc-700 text-pink-600 dark:text-pink-300 hover:bg-pink-100'
                }`}
              >
                <span>{settings.isBgmPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-sans focus:outline-none focus:border-pink-400"
                  dir="ltr"
                />
                <button
                  onClick={handleSaveYoutube}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs whitespace-nowrap active:scale-95 font-['Comfortaa',sans-serif]"
                >
                  SAVE & PLAY
                </button>
              </div>
              {youtubeError && <p className="text-[11px] text-rose-500 font-mono">{youtubeError}</p>}
            </div>

            {/* Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-pink-500 dark:text-pink-400 font-bold block mb-1 font-['Comfortaa',sans-serif]">
                Study Playlists:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {PRESET_TRACKS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      sound.playClick();
                      setYoutubeInput(t.url);
                      onUpdateSettings({
                        ...settings,
                        youtubeUrl: t.url,
                        isBgmPlaying: true,
                        bgmPreset: 'youtube',
                      });
                    }}
                    className={`p-1.5 rounded-lg border text-left transition-all truncate text-[10px] font-['Comfortaa',sans-serif] ${
                      settings.youtubeUrl === t.url
                        ? 'bg-pink-100 dark:bg-zinc-800 border-pink-400 dark:border-pink-500 text-pink-900 dark:text-pink-200 font-bold'
                        : 'bg-white dark:bg-zinc-800/80 border-pink-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-pink-100 dark:border-zinc-800">
              <span className="text-pink-600 dark:text-pink-300 font-bold flex items-center gap-1 font-['Comfortaa',sans-serif]">
                <Volume2 className="w-3.5 h-3.5" />
                VOLUME:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.bgmVolume}
                  onChange={(e) => {
                    onUpdateSettings({ ...settings, bgmVolume: Number(e.target.value) });
                  }}
                  className="w-28 accent-pink-500 cursor-pointer"
                />
                <span className="font-mono text-pink-700 dark:text-pink-300 text-xs w-7">{settings.bgmVolume}%</span>
              </div>
            </div>
          </div>

          {/* Section 4: Sound Effects */}
          <div className="p-3 rounded-2xl bg-pink-50/60 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-pink-700 dark:text-pink-300 block font-['Comfortaa',sans-serif]">
                SOUND FX:
              </span>
              <span className="text-[10px] text-pink-400 dark:text-zinc-400 font-['Comfortaa',sans-serif]">
                Button clicks & success blips
              </span>
            </div>
            <button
              onClick={handleToggleSoundFx}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all font-['Comfortaa',sans-serif] ${
                settings.soundFxEnabled ? 'bg-pink-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
              }`}
            >
              {settings.soundFxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Section 5: Offline Standalone index.html Download */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>OFFLINE STANDALONE APP (تحميل كود المشروع كملف index.html)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold font-mono">
                HTML + CSS + JS
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-['Comfortaa',sans-serif]">
              حمّل ملف <code className="px-1 py-0.5 rounded bg-white dark:bg-zinc-800 font-mono font-bold text-emerald-800 dark:text-emerald-300">index.html</code> المستقل والشامل، ليعمل مباشرة بالنقر عليه في أي متصفح وبدون إنترنت مع حفظ كافة بياناتك ودروسك محلياً!
            </p>
            <button
              type="button"
              onClick={downloadStandaloneIndexHtml}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 font-['Comfortaa',sans-serif]"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف index.html الآن</span>
            </button>
          </div>

          {/* Section 6: Reset Study Data */}
          <div className="pt-1">
            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold font-['Comfortaa',sans-serif]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET ALL STUDY DATA (0)</span>
              </button>
            ) : (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                <span>Reset all data to 0?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onResetData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-500 text-white rounded-lg font-bold font-['Comfortaa',sans-serif]"
                  >
                    YES
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-['Comfortaa',sans-serif]"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-pink-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors font-['Comfortaa',sans-serif]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
