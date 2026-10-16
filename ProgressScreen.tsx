import React from 'react';
import { Trophy, Flame, Sparkles, Award, Star, Zap, CheckCircle2 } from 'lucide-react';
import { PetState, Habit } from '../types';

interface ProgressScreenProps {
  petState: PetState;
  habits: Habit[];
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  petState,
  habits,
}) => {
  // XP Calculation
  const currentLvl = petState.level;
  const xpForNextLevel = currentLvl * 100;
  const currentLvlXP = petState.xp % xpForNextLevel;
  const levelProgressPercent = Math.min(
    100,
    Math.round((currentLvlXP / xpForNextLevel) * 100)
  );

  // 7-day streak progress
  const streakRemainder = petState.streak % 7;
  const daysUntilStreakLevelUp = 7 - streakRemainder;
  const streakProgressPercent = Math.round((streakRemainder / 7) * 100);

  // Calculate total habit checkmarks ever
  const totalCompletedCheckmarks = habits.reduce(
    (acc, h) => acc + h.completedDates.length,
    0
  );

  // Achievements
  const achievements = [
    {
      id: 'first-habit',
      title: 'Первая лапка',
      desc: 'Выполнить первую привычку',
      unlocked: totalCompletedCheckmarks >= 1,
      icon: '🐾',
    },
    {
      id: 'streak-3',
      title: 'Друг Мурки',
      desc: '3 дня стрика подряд',
      unlocked: petState.streak >= 3,
      icon: '🥉',
    },
    {
      id: 'streak-7',
      title: 'Недельный триумф',
      desc: '7 дней подряд (+1 Уровень)',
      unlocked: petState.streak >= 7 || petState.longestStreak >= 7,
      icon: '🏆',
    },
    {
      id: 'pet-care',
      title: 'Заботливое сердце',
      desc: 'Погладить кошечку 10 раз',
      unlocked: petState.petPettedCount >= 10,
      icon: '💖',
    },
    {
      id: 'xp-master',
      title: 'Коллекционер опыта',
      desc: 'Набрать 200+ XP',
      unlocked: petState.xp >= 200,
      icon: '⭐',
    },
    {
      id: 'streak-14',
      title: 'Супер-стрик',
      desc: '14 дней непрерывной заботы',
      unlocked: petState.streak >= 14 || petState.longestStreak >= 14,
      icon: '👑',
    },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div className="px-1">
        <h1 className="text-lg font-bold text-[#FDFBF7]">Прогресс и награды</h1>
        <p className="text-xs text-[#C5B3A3]">
          Твоя регулярность делает Мурку сильнее и счастливее
        </p>
      </div>

      {/* Main Level & XP Card (White Card) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#EDE4D8] text-[#2A1C14] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3E2C23] text-[#F4E4A6] flex items-center justify-center font-extrabold text-xl shadow-sm">
              {currentLvl}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold block">
                Текущий статус
              </span>
              <h2 className="text-base font-bold text-[#3E2C23]">
                {currentLvl <= 2
                  ? 'Юный воспитатель'
                  : currentLvl <= 4
                  ? 'Преданный компаньон'
                  : currentLvl <= 6
                  ? 'Мастер гармонии'
                  : 'Королевский хранитель'}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-[#3E2C23] tabular-nums block">
              {petState.xp} XP
            </span>
            <span className="text-[11px] text-[#967425] font-semibold">
              +10 XP за отметку
            </span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span>Прогресс уровня</span>
            <span className="tabular-nums font-semibold">
              {currentLvlXP} / {xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full h-3 bg-[#F2EDE4] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F4E4A6] to-[#E7BF5A] rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak 7-Day Card (Prompt requirement: "За 7 дней подряд — уровень повышается") */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#EDE4D8] text-[#2A1C14] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF5EA] text-[#E76F51] flex items-center justify-center">
              <Flame className="w-5 h-5 fill-[#E76F51]" />
            </div>
            <div>
              <span className="text-xs text-stone-400 font-medium">Серия привычек</span>
              <h3 className="text-base font-bold text-[#3E2C23]">
                {petState.streak} {petState.streak === 1 ? 'день' : petState.streak < 5 ? 'дня' : 'дней'} подряд
              </h3>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-stone-400">Рекорд: </span>
            <span className="font-bold text-[#3E2C23] tabular-nums">
              {petState.longestStreak} дн
            </span>
          </div>
        </div>

        {/* 7-day milestone indicator */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <span className="font-medium">
              До повышения уровня по стрику:
            </span>
            <span className="font-bold text-[#E76F51]">
              {daysUntilStreakLevelUp === 7 ? 'Уровень повышен сегодня! 🌟' : `Ещё ${daysUntilStreakLevelUp} дн.`}
            </span>
          </div>

          {/* 7 step dots */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {Array.from({ length: 7 }, (_, i) => {
              const stepDone = i < (streakRemainder === 0 && petState.streak > 0 ? 7 : streakRemainder);
              return (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all ${
                    stepDone
                      ? 'bg-[#E76F51]'
                      : 'bg-[#F2EDE4]'
                  }`}
                  title={`День ${i + 1}`}
                />
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-stone-400">
          💡 Не пропускайте привычки 7 дней подряд — и уровень вашей кошечки вырастет автоматически!
        </p>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#4B362B] border border-[#5F4537] rounded-3xl p-3.5 text-center text-[#FDFBF7]">
          <span className="text-lg font-black text-[#F4E4A6] tabular-nums block">
            {totalCompletedCheckmarks}
          </span>
          <span className="text-[11px] text-[#C5B3A3] mt-0.5 block leading-tight">
            Выполнено привычек
          </span>
        </div>

        <div className="bg-[#4B362B] border border-[#5F4537] rounded-3xl p-3.5 text-center text-[#FDFBF7]">
          <span className="text-lg font-black text-[#F4E4A6] tabular-nums block">
            {petState.xp}
          </span>
          <span className="text-[11px] text-[#C5B3A3] mt-0.5 block leading-tight">
            Очков опыта
          </span>
        </div>

        <div className="bg-[#4B362B] border border-[#5F4537] rounded-3xl p-3.5 text-center text-[#FDFBF7]">
          <span className="text-lg font-black text-[#F4E4A6] tabular-nums block">
            {petState.petPettedCount}
          </span>
          <span className="text-[11px] text-[#C5B3A3] mt-0.5 block leading-tight">
            Поглаживаний
          </span>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#EDE4D8] text-[#2A1C14] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#3E2C23] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#F4A261]" />
            <span>Достижения</span>
          </h3>
          <span className="text-xs text-stone-400">
            {achievements.filter((a) => a.unlocked).length} из {achievements.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl flex items-center gap-3 border transition-all ${
                ach.unlocked
                  ? 'bg-[#FDFBF2] border-[#F4E4A6]'
                  : 'bg-[#F9F7F2] border-stone-200 opacity-60'
              }`}
            >
              <div className="text-2xl shrink-0">{ach.icon}</div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#3E2C23] truncate">
                  {ach.title}
                </h4>
                <p className="text-[10px] text-stone-500 leading-tight">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
