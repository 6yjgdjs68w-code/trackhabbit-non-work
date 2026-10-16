import React, { useState } from 'react';
import { Sparkles, Heart, Fish, Edit2, Check, RefreshCw } from 'lucide-react';
import { PetState, PetMood } from '../types';
import { CatVisual } from './CatVisual';
import { triggerHaptic } from '../services/storage';
import { sound } from '../services/sound';

interface PetScreenProps {
  petState: PetState;
  petMood: PetMood;
  completedTodayCount: number;
  totalHabitsCount: number;
  onPet: () => void;
  onFeedTreat: () => void;
  onRename: (newName: string) => void;
}

export const PetScreen: React.FC<PetScreenProps> = ({
  petState,
  petMood,
  completedTodayCount,
  totalHabitsCount,
  onPet,
  onFeedTreat,
  onRename,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(petState.name);
  const [feedAnimation, setFeedAnimation] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(false);

  const satietyPercent =
    totalHabitsCount > 0
      ? Math.round((completedTodayCount / totalHabitsCount) * 100)
      : 50;

  const happinessPercent = Math.min(
    100,
    Math.round(satietyPercent * 0.7 + Math.min(petState.petPettedCount * 2, 30))
  );

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onRename(nameInput.trim());
      setIsEditingName(false);
      triggerHaptic('light');
    }
  };

  const handleFeed = () => {
    if (petState.treatsAvailable <= 0) {
      triggerHaptic('warning');
      return;
    }
    triggerHaptic('success');
    sound.playPurrSound();
    setFeedAnimation(true);
    setTimeout(() => setFeedAnimation(false), 1500);
    onFeedTreat();
  };

  const handlePlay = () => {
    triggerHaptic('medium');
    sound.playPurrSound();
    setPlayAnimation(true);
    setTimeout(() => setPlayAnimation(false), 1200);
    onPet();
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Name & Stage Ribbon */}
      <div className="flex items-center justify-between px-2">
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="flex items-center gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="px-3 py-1 text-sm bg-white text-[#2A1C14] rounded-xl border border-[#F4E4A6] focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-[#F4E4A6] text-[#3E2C23]"
            >
              <Check className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#FDFBF7] tracking-tight">
              {petState.name}
            </h1>
            <button
              onClick={() => {
                setNameInput(petState.name);
                setIsEditingName(true);
              }}
              className="text-[#C5B3A3] hover:text-[#F4E4A6] p-1 transition-colors"
              title="Переименовать кошечку"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-[#4E372C] text-[#F4E4A6] px-3 py-1 rounded-full border border-[#65483A] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Уровень {petState.level}</span>
        </div>
      </div>

      {/* Speech / Mood Bubble (Prompt exact messages) */}
      <div className="relative mx-auto max-w-sm">
        <div className="bg-white rounded-3xl p-4 shadow-md border border-[#EDE4D8] text-center relative z-10">
          <p className="text-sm font-semibold text-[#2A1C14] leading-relaxed">
            {petMood === 'happy' ? (
              <span>
                «{petState.name} сыта и счастлива! Мур-мур, спасибо за выполненные привычки! ✨🐾»
              </span>
            ) : petMood === 'content' ? (
              <span>
                «{petState.name} довольно жмурится и ждёт ещё заботы! Ты молодец!»
              </span>
            ) : (
              <span>
                «{petState.name} загрустила, не забудь про привычки 😿»
              </span>
            )}
          </p>

          <div className="text-[11px] text-stone-400 mt-1">
            {satietyPercent === 100
              ? 'Сытость на максимуме · Кошечка полна энергии'
              : `Выполни еще ${totalHabitsCount - completedTodayCount} привычек сегодня для 100% сытости`}
          </div>
        </div>

        {/* Speech bubble pointer */}
        <div className="w-4 h-4 bg-white border-b border-r border-[#EDE4D8] transform rotate-45 mx-auto -mt-2 relative z-0" />
      </div>

      {/* Cat Sanctuary Viewport */}
      <div className="relative py-6 flex flex-col items-center justify-center min-h-[240px]">
        {/* Soft background aura glow */}
        <div
          className={`absolute w-60 h-60 rounded-full blur-3xl opacity-30 transition-colors duration-700 pointer-events-none ${
            petMood === 'happy'
              ? 'bg-[#F4E4A6]'
              : petMood === 'content'
              ? 'bg-[#D4A373]'
              : 'bg-[#5A453A]'
          }`}
        />

        {/* Yarn Ball animation when playing */}
        {playAnimation && (
          <div className="absolute top-1/2 left-8 -translate-y-1/2 text-3xl animate-bounce z-20">
            🧶
          </div>
        )}

        {/* Fish Treat animation when feeding */}
        {feedAnimation && (
          <div className="absolute top-1/3 text-3xl animate-bounce z-20">
            🐟
          </div>
        )}

        <CatVisual
          mood={petMood}
          level={petState.level}
          name={petState.name}
          onPet={onPet}
          interactive={true}
        />

        <p className="text-xs text-[#C5B3A3]/80 mt-3 flex items-center gap-1 font-medium">
          <span>Нажмите на кошечку, чтобы погладить ее</span>
          <Heart className="w-3 h-3 text-[#FFB4A2] fill-[#FFB4A2]" />
        </p>
      </div>

      {/* Vital Metrics Cards (White Cards) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Satiety Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#EDE4D8] text-[#2A1C14]">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold">Сытость</span>
            <span className="tabular-nums font-bold text-[#3E2C23]">
              {satietyPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F2EDE4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F4E4A6] rounded-full transition-all duration-500"
              style={{ width: `${satietyPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-400 mt-1.5 block">
            Зависит от привычек за день
          </span>
        </div>

        {/* Happiness Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#EDE4D8] text-[#2A1C14]">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-semibold">Счастье</span>
            <span className="tabular-nums font-bold text-[#3E2C23]">
              {happinessPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#F2EDE4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E76F51] rounded-full transition-all duration-500"
              style={{ width: `${happinessPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-400 mt-1.5 block">
            Ласка и угощения
          </span>
        </div>
      </div>

      {/* Interactive Care Actions */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-[#EDE4D8] text-[#2A1C14] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Забота о питомце
          </span>
          <span className="text-xs text-stone-500">
            Поглаживаний: <b className="text-[#3E2C23] tabular-nums">{petState.petPettedCount}</b>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Pet Button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              sound.playPurrSound();
              onPet();
            }}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F4EE] hover:bg-[#EFEAE0] text-[#3E2C23] transition-all active:scale-95 min-h-[56px] border border-[#E8DFC8]"
          >
            <Heart className="w-5 h-5 text-[#E76F51] fill-[#E76F51] mb-1" />
            <span className="text-xs font-semibold">Погладить</span>
          </button>

          {/* Treat Button */}
          <button
            onClick={handleFeed}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F4EE] hover:bg-[#EFEAE0] text-[#3E2C23] transition-all active:scale-95 min-h-[56px] border border-[#E8DFC8] relative"
          >
            <Fish className="w-5 h-5 text-[#3A86FF] mb-1" />
            <span className="text-xs font-semibold">Рыбка</span>
            <span className="text-[9px] text-stone-500">
              {petState.treatsAvailable} шт.
            </span>
          </button>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#F7F4EE] hover:bg-[#EFEAE0] text-[#3E2C23] transition-all active:scale-95 min-h-[56px] border border-[#E8DFC8]"
          >
            <span className="text-lg leading-none mb-1">🧶</span>
            <span className="text-xs font-semibold">Поиграть</span>
          </button>
        </div>
      </div>
    </div>
  );
};
