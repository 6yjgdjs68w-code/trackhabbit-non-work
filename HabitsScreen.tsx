import React, { useState } from 'react';
import {
  Check,
  Plus,
  Trash2,
  Droplet,
  Zap,
  BookOpen,
  Footprints,
  Heart,
  Moon,
  Apple,
  Smile,
  Sparkles,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit, PetMood } from '../types';
import { triggerHaptic } from '../services/storage';
import { sound } from '../services/sound';

interface HabitsScreenProps {
  habits: Habit[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
  onAddHabit: (title: string, icon: string, category: string) => void;
  onDeleteHabit: (habitId: string) => void;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  petMood: PetMood;
  petName: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  droplet: Droplet,
  zap: Zap,
  'book-open': BookOpen,
  footprints: Footprints,
  heart: Heart,
  moon: Moon,
  apple: Apple,
  smile: Smile,
  sparkles: Sparkles,
};

const SUGGESTED_HABITS = [
  { title: 'Вода 2л', icon: 'droplet', category: 'Здоровье' },
  { title: 'Зарядка 15 мин', icon: 'zap', category: 'Тело' },
  { title: 'Чтение 20 мин', icon: 'book-open', category: 'Развитие' },
  { title: 'Прогулка 30 мин', icon: 'footprints', category: 'Энергия' },
  { title: 'Медитация', icon: 'sparkles', category: 'Баланс' },
  { title: 'Сон до 23:00', icon: 'moon', category: 'Отдых' },
];

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  selectedDate,
  onSelectDate,
  petMood,
  petName,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('sparkles');
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  // Generate 7-day strip (3 days before, today, 3 days after)
  const today = new Date();
  const dayStrip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - 3 + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = d.toLocaleDateString('ru-RU', { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr, dayName, dayNum };
  });

  const completedTodayCount = habits.filter((h) =>
    h.completedDates.includes(selectedDate)
  ).length;

  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;

  const handleToggle = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const isAlreadyCompleted = habit.completedDates.includes(selectedDate);
    
    if (!isAlreadyCompleted) {
      triggerHaptic('success');
      sound.playCheckSound();
      setJustCompletedId(habitId);
      setTimeout(() => setJustCompletedId(null), 1000);

      // If completing the last remaining habit
      if (completedTodayCount + 1 === totalCount && totalCount > 0) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#F4E4A6', '#D4A373', '#FFFFFF', '#FFB4A2'],
          });
        } catch {
          // ignore
        }
      }
    } else {
      triggerHaptic('light');
    }

    onToggleHabit(habitId, selectedDate);
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    triggerHaptic('medium');
    onAddHabit(newTitle.trim(), selectedIcon, 'Мои цели');
    setNewTitle('');
    setIsAddingOpen(false);
  };

  const handleQuickAdd = (item: typeof SUGGESTED_HABITS[0]) => {
    triggerHaptic('light');
    onAddHabit(item.title, item.icon, item.category);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Mini Pet Status Card */}
      <div className="bg-[#4B362B] border border-[#5F4537] rounded-3xl p-4 text-[#FDFBF7] shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#3E2C23] border border-[#5F4537] flex items-center justify-center text-2xl shrink-0">
            {petMood === 'happy' ? '😸' : petMood === 'content' ? '😺' : '😿'}
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F4E4A6]">
              {petMood === 'happy'
                ? `${petName} сыта и абсолютно счастлива!`
                : petMood === 'content'
                ? `${petName} довольно жмурится`
                : `${petName} загрустила, не забудь про привычки`}
            </h2>
            <p className="text-xs text-[#E6D5C7]/80 mt-0.5">
              {completedTodayCount === totalCount && totalCount > 0
                ? 'Все цели закрыты на сегодня! ✨'
                : `Выполнено ${completedTodayCount} из ${totalCount} привычек (+10 XP за каждую)`}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-lg font-extrabold text-[#F4E4A6] tabular-nums">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Week Day Carousel */}
      <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
        {dayStrip.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday =
            item.dateStr ===
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const dayCompleted = habits.filter((h) =>
            h.completedDates.includes(item.dateStr)
          ).length;
          const isDayAllDone = totalCount > 0 && dayCompleted === totalCount;

          return (
            <button
              key={item.dateStr}
              onClick={() => {
                triggerHaptic('light');
                onSelectDate(item.dateStr);
              }}
              className={`flex-1 min-w-[42px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#F4E4A6] text-[#3E2C23] font-bold shadow-md scale-105'
                  : 'bg-[#4B362B]/80 text-[#D8C7B8] hover:bg-[#583F32]'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-80">
                {item.dayName}
              </span>
              <span className="text-sm font-extrabold tabular-nums mt-0.5">
                {item.dayNum}
              </span>
              <div className="mt-1 flex items-center justify-center h-2">
                {isDayAllDone ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ) : dayCompleted > 0 ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#3E2C23]' : 'bg-[#F4E4A6]'}`} />
                ) : isToday ? (
                  <span className="w-1 h-1 rounded-full bg-[#D4A373]" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Habits Header & Quick Stats */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-lg font-bold text-[#FDFBF7]">Привычки на сегодня</h1>
          <p className="text-xs text-[#C5B3A3]">
            {completedTodayCount} из {totalCount} завершено · {progressPercent}%
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('medium');
            setIsAddingOpen(!isAddingOpen);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#F4E4A6] hover:bg-[#F0DE9B] text-[#3E2C23] text-xs font-bold shadow-sm transition-all active:scale-95 min-h-[44px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Добавить</span>
        </button>
      </div>

      {/* Add Habit Expandable Drawer / Form */}
      {isAddingOpen && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-white rounded-3xl p-5 shadow-lg border border-[#EDE4D8] space-y-4 animate-in fade-in slide-in-from-top-3 duration-200 text-[#2A1C14]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#3E2C23]">
              Новая полезная привычка
            </span>
            <button
              type="button"
              onClick={() => setIsAddingOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-700 p-1"
            >
              Отмена
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">
              Название привычки
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Например: Зарядка, Чтение, Вода..."
              className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE] border border-[#E8DFC8] text-sm text-[#2A1C14] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#F4E4A6]"
              autoFocus
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">
              Иконка
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const IconComp = ICON_MAP[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedIcon(iconKey);
                    }}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#3E2C23] text-[#F4E4A6] scale-105 shadow-sm'
                        : 'bg-[#F7F4EE] text-stone-600 hover:bg-[#EFEAE0]'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="w-full py-3 px-4 rounded-2xl bg-[#3E2C23] hover:bg-[#4E372C] disabled:opacity-50 text-[#F4E4A6] font-bold text-sm shadow-md transition-all active:scale-[0.98] min-h-[44px]"
            >
              Создать привычку (+10 XP при выполнении)
            </button>
          </div>
        </form>
      )}

      {/* Habits List (White Cards with Warm Brown Text and Soft Yellow Accents) */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-[#EDE4D8] text-[#2A1C14] space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FDFBF2] flex items-center justify-center text-2xl">
              🌱
            </div>
            <h3 className="text-base font-bold text-[#3E2C23]">
              Список привычек пуст
            </h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Добавьте свои первые цели или выберите готовые варианты ниже, чтобы порадовать кошечку!
            </p>
          </div>
        ) : (
          habits.map((habit) => {
            const isCompleted = habit.completedDates.includes(selectedDate);
            const IconComp = ICON_MAP[habit.icon] || Sparkles;

            return (
              <div
                key={habit.id}
                className={`relative group rounded-3xl p-4 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#FBF8EF] border-2 border-[#F4E4A6] shadow-[0_4px_16px_rgba(244,228,166,0.2)]'
                    : 'bg-white border border-[#EDE4D8] shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Category Icon & Title */}
                  <div
                    onClick={() => handleToggle(habit.id)}
                    className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-[#F4E4A6] text-[#3E2C23]'
                          : 'bg-[#F7F4EE] text-[#6E5747]'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`text-sm font-semibold text-[#2A1C14] leading-snug transition-all ${
                          isCompleted
                            ? 'line-through text-stone-500 font-medium'
                            : ''
                        }`}
                      >
                        {habit.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                        <span>{habit.category}</span>
                        {isCompleted && (
                          <>
                            <span>·</span>
                            <span className="text-[#967425] font-semibold flex items-center gap-1">
                              +10 XP
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Round Checkbox and Delete Button */}
                  <div className="flex items-center gap-2">
                    {/* Delete action (subtle) */}
                    <button
                      onClick={() => {
                        triggerHaptic('warning');
                        onDeleteHabit(habit.id);
                      }}
                      className="w-8 h-8 rounded-full text-stone-300 hover:text-rose-500 hover:bg-stone-100 flex items-center justify-center transition-colors opacity-60 hover:opacity-100"
                      title="Удалить привычку"
                      aria-label="Удалить привычку"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Round Checkbox (Prompt: "У каждой привычки — круглая галочка. Нажал — отметил на сегодня. Выполненные — подсвечиваются жёлтым.") */}
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 min-h-[44px] min-w-[44px] active:scale-90 ${
                        isCompleted
                          ? 'bg-[#F4E4A6] text-[#3E2C23] shadow-[0_2px_10px_rgba(244,228,166,0.6)] scale-105'
                          : 'bg-[#F7F4EE] border-2 border-[#D9CEBC] text-transparent hover:border-[#F4E4A6]'
                      }`}
                      aria-label={isCompleted ? 'Отменить отметку' : 'Отметить привычку'}
                    >
                      <Check
                        className={`w-5 h-5 stroke-[3] transition-transform ${
                          isCompleted ? 'scale-100' : 'scale-50 opacity-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Just completed XP bubble */}
                {justCompletedId === habit.id && (
                  <div className="absolute right-4 -top-3 bg-[#F4E4A6] text-[#3E2C23] font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-md animate-bounce pointer-events-none">
                    +10 XP ✨
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick Suggested Habit Chips */}
      <div className="pt-2">
        <span className="text-xs text-[#C5B3A3] font-medium block mb-2 px-1">
          Быстрые идеи для привычек:
        </span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_HABITS.map((item) => {
            const alreadyExists = habits.some((h) => h.title.toLowerCase() === item.title.toLowerCase());
            if (alreadyExists) return null;

            return (
              <button
                key={item.title}
                onClick={() => handleQuickAdd(item)}
                className="text-xs bg-[#4B362B] hover:bg-[#5D4336] text-[#E6D5C7] hover:text-[#F4E4A6] px-3 py-1.5 rounded-full border border-[#614739] transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>+</span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
