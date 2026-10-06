import React from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { AppSettings } from '../types';
import { sound } from '../utils/audio';
import { CHIBI_MASCOT } from '../utils/storage';

interface MiniMusicWidgetProps {
  settings: AppSettings;
  onTogglePlay: () => void;
  onOpenModal: () => void;
}

export const MiniMusicWidget: React.FC<MiniMusicWidgetProps> = ({
  settings,
  onTogglePlay,
  onOpenModal,
}) => {
  return (
    <div 
      className="bg-white/90 dark:bg-black/90 backdrop-blur-md border border-pink-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex items-center gap-3 transition-all hover:shadow-sm group"
      style={{ direction: 'rtl' }}
    >
      {/* Artwork with cute spinning or pulsing glow */}
      <div 
        onClick={onOpenModal}
        className="w-11 h-11 rounded-xl overflow-hidden relative cursor-pointer border border-pink-300 dark:border-zinc-700 shadow-xs shrink-0"
      >
        <img 
          src={CHIBI_MASCOT} 
          alt="BGM Artwork" 
          className={`w-full h-full object-cover transition-transform duration-700 ${settings.isBgmPlaying ? 'scale-105 rotate-2' : ''}`}
        />
        <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-3.5 h-3.5 text-white drop-shadow" />
        </div>
      </div>

      {/* Info & Animated Sound Wave */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onOpenModal}>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-pink-500 dark:text-pink-400 bg-pink-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full font-['Comfortaa',sans-serif]">
            BGM
          </span>
          <span className="text-xs font-bold text-pink-800 dark:text-pink-300 truncate block font-['Comfortaa',sans-serif]">
            {settings.bgmPreset === 'cozy_music_box' ? 'Music Box Chimes' : 'Anime Study Beats'}
          </span>
        </div>

        {/* Sound Wave bars */}
        <div className="flex items-center gap-1 mt-1 h-3">
          {settings.isBgmPlaying ? (
            <>
              <span className="w-1 bg-pink-400 rounded-full animate-wave-1" />
              <span className="w-1 bg-pink-500 rounded-full animate-wave-2" />
              <span className="w-1 bg-pink-400 rounded-full animate-wave-3" />
              <span className="w-1 bg-pink-300 rounded-full animate-wave-4" />
              <span className="text-[10px] text-pink-400 dark:text-pink-300 font-medium ml-1 font-['Comfortaa',sans-serif]">PLAYING</span>
            </>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium font-['Comfortaa',sans-serif]">Click to configure</span>
          )}
        </div>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          sound.playClick();
          onTogglePlay();
        }}
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform active:scale-90 ${
          settings.isBgmPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-pink-400 hover:bg-pink-500'
        }`}
        title={settings.isBgmPlaying ? 'Pause' : 'Play'}
      >
        {settings.isBgmPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 mr-0.5" />}
      </button>
    </div>
  );
};
