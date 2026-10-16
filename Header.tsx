import React from 'react';
import { Volume2, VolumeX, Flame, Sparkles } from 'lucide-react';
import { sound } from '../services/sound';
import { triggerHaptic } from '../services/storage';

interface HeaderProps {
  streak: number;
  level: number;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  level,
  isSoundMuted,
  onToggleSound,
}) => {
  const handleSoundClick = () => {
    triggerHaptic('light');
    onToggleSound();
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#3E2C23]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#523C30]/50 flex items-center justify-between">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-[#FDFBF7] flex items-center gap-1.5">
          <span>🐾</span>
          <span>Мурка</span>
        </span>
        <span className="text-xs text-[#E6D5C7]/70 font-medium hidden xs:inline">
          трекер привычек
        </span>
      </div>

      {/* Zone 2: Streak & Level Indicators */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
        <div
          title={`${streak} дней подряд`}
          className="flex items-center gap-1 bg-[#4E372C] text-[#F4E4A6] px-2.5 py-1 rounded-full border border-[#65483A]"
        >
          <Flame className="w-3.5 h-3.5 text-[#F4A261] fill-[#F4A261]" />
          <span className="tabular-nums">{streak} дн</span>
        </div>

        <div
          title={`Уровень ${level}`}
          className="flex items-center gap-1 bg-[#4E372C] text-[#FDFBF7] px-2.5 py-1 rounded-full border border-[#65483A]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F4E4A6]" />
          <span>Ур. {level}</span>
        </div>
      </div>

      {/* Zone 3: Quiet Sound Mute/Unmute */}
      <button
        onClick={handleSoundClick}
        title={isSoundMuted ? 'Включить звук' : 'Выключить звук'}
        className="w-9 h-9 rounded-full bg-[#4E372C] hover:bg-[#5D4235] text-[#E6D5C7] flex items-center justify-center transition-colors active:scale-95 border border-[#65483A]"
        aria-label="Звук"
      >
        {isSoundMuted ? (
          <VolumeX className="w-4 h-4 text-stone-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-[#F4E4A6]" />
        )}
      </button>
    </header>
  );
};
