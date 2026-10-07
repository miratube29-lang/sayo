import React, { useState } from 'react';
import { Play, Pause, Music, Volume2, X, ExternalLink } from 'lucide-react';
import { AppSettings } from '../types';
import { sound } from '../utils/audio';

interface MusicPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export const PRESET_TRACKS = [
  {
    id: 'jfKfPfyJRdk',
    name: 'Lofi Girl - Relaxing Study Beats',
    desc: 'Warm and cozy beats for deep focus sessions',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
  },
  {
    id: '4xDzrJKXOOY',
    name: 'Ghibli Studio Piano & Rain Relax',
    desc: 'Soothing piano melodies with peaceful rain ambience',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
  },
  {
    id: 'TURbeWK2wwg',
    name: 'Japanese Cafe Anime Study',
    desc: 'Tokyo cafe atmosphere with cheerful rhythms',
    url: 'https://www.youtube.com/watch?v=TURbeWK2wwg',
  },
  {
    id: 'DWcJFNfaw9c',
    name: 'Chillhop - Peaceful Study Session',
    desc: 'Gentle chillhop to keep your focus sharp and relaxed',
    url: 'https://www.youtube.com/watch?v=DWcJFNfaw9c',
  }
];

export const MusicPlayerModal: React.FC<MusicPlayerModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [inputUrl, setInputUrl] = useState(settings.youtubeUrl);
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const handleApplyUrl = () => {
    sound.playClick();
    const id = extractYouTubeId(inputUrl);
    if (!id) {
      setUrlError('Please enter a valid YouTube video URL');
      return;
    }
    setUrlError('');
    onUpdateSettings({
      ...settings,
      youtubeUrl: inputUrl.trim(),
      isBgmPlaying: true,
      bgmPreset: 'youtube',
    });
  };

  const handleTogglePlay = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      isBgmPlaying: !settings.isBgmPlaying,
    });
  };

  const handleSelectPreset = (track: typeof PRESET_TRACKS[0]) => {
    sound.playClick();
    setInputUrl(track.url);
    setUrlError('');
    onUpdateSettings({
      ...settings,
      youtubeUrl: track.url,
      isBgmPlaying: true,
      bgmPreset: 'youtube',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-900/30 dark:bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl p-5 sm:p-6 shadow-2xl border border-pink-200 dark:border-zinc-800 relative overflow-hidden max-h-[90vh] overflow-y-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-zinc-800 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-xs">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-pink-400 dark:text-pink-300 uppercase tracking-widest block font-['Comfortaa',sans-serif]">
                AUDIO ENGINE
              </span>
              <h2 className="text-base sm:text-lg font-bold text-pink-600 dark:text-pink-400 font-['Comfortaa',sans-serif]">
                BACKGROUND AUDIO & YOUTUBE
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

        {/* Custom YouTube URL input */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold text-pink-700 dark:text-pink-300 block font-['Comfortaa',sans-serif]">
            PASTE YOUTUBE URL:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-pink-200 dark:border-zinc-700 focus:border-pink-400 focus:outline-none bg-pink-50/40 dark:bg-zinc-900 text-xs text-slate-700 dark:text-zinc-100 font-sans"
              dir="ltr"
            />
            <button
              onClick={handleApplyUrl}
              className="px-4 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs transition-all active:scale-95 whitespace-nowrap font-['Comfortaa',sans-serif]"
            >
              SAVE & PLAY
            </button>
          </div>
          {urlError && <p className="text-xs text-rose-500 font-mono">{urlError}</p>}
        </div>

        {/* Master Controls & Status */}
        <div className="mt-4 p-3.5 rounded-2xl bg-pink-50/70 dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs transition-all active:scale-90 ${
                settings.isBgmPlaying 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-pink-400 hover:bg-pink-500'
              }`}
            >
              {settings.isBgmPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 mr-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-pink-800 dark:text-pink-300 block font-['Comfortaa',sans-serif]">
                {settings.isBgmPlaying ? 'BGM PLAYING' : 'BGM PAUSED'}
              </span>
              <span className="text-[10px] text-pink-500 dark:text-zinc-400 font-['Comfortaa',sans-serif]">
                Auto-saved in browser
              </span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-pink-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={settings.bgmVolume}
              onChange={(e) => {
                const vol = Number(e.target.value);
                onUpdateSettings({ ...settings, bgmVolume: vol });
              }}
              className="w-20 accent-pink-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-pink-600 dark:text-pink-300 w-7">{settings.bgmVolume}%</span>
          </div>
        </div>

        {/* Preset Tracks Selection */}
        <div className="mt-4 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 dark:text-pink-400 flex items-center gap-1.5 font-['Comfortaa',sans-serif]">
            <Music className="w-3.5 h-3.5" />
            STUDY PLAYLISTS:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {PRESET_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => handleSelectPreset(track)}
                className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col gap-0.5 ${
                  settings.youtubeUrl === track.url
                    ? 'bg-pink-100 dark:bg-zinc-800 border-pink-400 dark:border-pink-500 text-pink-800 dark:text-pink-200 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 hover:bg-pink-50/70 dark:hover:bg-zinc-800/80 border-pink-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
                }`}
              >
                <span className="font-bold flex items-center justify-between text-[11px] font-['Comfortaa',sans-serif]">
                  {track.name}
                  {settings.youtubeUrl === track.url && <span className="text-pink-500 dark:text-pink-400 font-mono text-[10px]">ACTIVE</span>}
                </span>
                <span className="text-pink-400 dark:text-zinc-400 text-[10px]">{track.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-pink-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-1.5 rounded-xl bg-pink-100 dark:bg-zinc-800 hover:bg-pink-200 dark:hover:bg-zinc-700 text-pink-700 dark:text-pink-300 font-bold text-xs transition-colors font-['Comfortaa',sans-serif]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
