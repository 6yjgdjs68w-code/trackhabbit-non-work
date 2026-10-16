import React, { useState, useEffect, useMemo } from 'react';
import {
  Habit,
  PetState,
  PetMood,
  TabType,
} from './types';
import {
  loadHabits,
  saveHabits,
  loadPetState,
  savePetState,
  getTodayDateString,
  getRelativeDateString,
  initTelegramApp,
  triggerHaptic,
} from './services/storage';
import { sound } from './services/sound';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HabitsScreen } from './components/HabitsScreen';
import { PetScreen } from './components/PetScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ShareScreen } from './components/ShareScreen';

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [petState, setPetState] = useState<PetState | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [activeTab, setActiveTab] = useState<TabType>('habits');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(sound.getMuted());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize Telegram WebApp and load data from CloudStorage
  useEffect(() => {
    initTelegramApp();

    async function loadData() {
      const [storedHabits, storedPet] = await Promise.all([
        loadHabits(),
        loadPetState(),
      ]);

      // Streak check on load
      const today = getTodayDateString();
      const yesterday = getRelativeDateString(-1);

      let updatedStreak = storedPet.streak;
      let updatedLongest = storedPet.longestStreak;

      // Check if last active was earlier than yesterday (missed days)
      if (storedPet.lastActiveDate && storedPet.lastActiveDate !== today && storedPet.lastActiveDate !== yesterday) {
        // Missed at least 1 full day
        updatedStreak = 1;
      }

      const freshPet: PetState = {
        ...storedPet,
        streak: updatedStreak,
        longestStreak: Math.max(updatedStreak, updatedLongest),
        lastActiveDate: today,
      };

      setHabits(storedHabits);
      setPetState(freshPet);
      setIsLoaded(true);
      savePetState(freshPet);
    }

    loadData();
  }, []);

  // Calculate today's completed habits
  const todayStr = useMemo(() => getTodayDateString(), []);
  
  const completedTodayCount = useMemo(() => {
    return habits.filter((h) => h.completedDates.includes(todayStr)).length;
  }, [habits, todayStr]);

  const totalHabitsCount = habits.length;

  // Determine Pet Mood:
  // "Она растёт и радуется, если пользователь выполняет все привычки за день. Если пропускает — кошечка грустная и 'болеет'."
  const petMood: PetMood = useMemo(() => {
    if (totalHabitsCount === 0) return 'content';
    if (completedTodayCount === totalHabitsCount) return 'happy';
    if (completedTodayCount > 0) return 'content';
    return 'sad';
  }, [completedTodayCount, totalHabitsCount]);

  // Handle habit checkmark toggle
  const handleToggleHabit = (habitId: string, dateStr: string) => {
    if (!petState) return;

    let xpDelta = 0;
    let newlyCompletedAllToday = false;

    const nextHabits = habits.map((habit) => {
      if (habit.id !== habitId) return habit;

      const isCompleted = habit.completedDates.includes(dateStr);
      let updatedDates: string[];

      if (isCompleted) {
        // Unmarking
        updatedDates = habit.completedDates.filter((d) => d !== dateStr);
        xpDelta -= 10;
      } else {
        // Marking as completed (+10 XP)
        updatedDates = [...habit.completedDates, dateStr];
        xpDelta += 10;
      }

      return {
        ...habit,
        completedDates: updatedDates,
      };
    });

    // Check if this action completed all habits for today
    if (dateStr === todayStr) {
      const willBeDoneCount = nextHabits.filter((h) => h.completedDates.includes(todayStr)).length;
      if (willBeDoneCount === nextHabits.length && nextHabits.length > 0) {
        newlyCompletedAllToday = true;
      }
    }

    // Calculate new pet XP & Level
    const newXP = Math.max(0, petState.xp + xpDelta);
    let newLevel = petState.level;
    let newStreak = petState.streak;
    let newTreats = petState.treatsAvailable;

    // Check level up from XP: 100 XP * level
    const xpRequiredForNext = newLevel * 100;
    if (newXP >= xpRequiredForNext && xpDelta > 0) {
      newLevel += 1;
      sound.playLevelUpSound();
    }

    // Check 7-day streak level promotion rule from prompt:
    // "За 7 дней подряд — уровень повышается."
    if (newlyCompletedAllToday) {
      newTreats += 1;
      // If today wasn't recorded yet in streak
      if (petState.lastActiveDate !== todayStr || petState.streak === 0) {
        newStreak += 1;
        if (newStreak % 7 === 0) {
          newLevel += 1;
          sound.playLevelUpSound();
        }
      }
    }

    const nextPet: PetState = {
      ...petState,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      longestStreak: Math.max(newStreak, petState.longestStreak),
      treatsAvailable: newTreats,
      lastActiveDate: todayStr,
    };

    setHabits(nextHabits);
    setPetState(nextPet);

    // Save to CloudStorage & LocalStorage
    saveHabits(nextHabits);
    savePetState(nextPet);
  };

  // Add new habit
  const handleAddHabit = (title: string, icon: string, category: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title,
      icon,
      category,
      createdAt: getTodayDateString(),
      completedDates: [],
    };

    const nextHabits = [...habits, newHabit];
    setHabits(nextHabits);
    saveHabits(nextHabits);
  };

  // Delete habit
  const handleDeleteHabit = (habitId: string) => {
    const nextHabits = habits.filter((h) => h.id !== habitId);
    setHabits(nextHabits);
    saveHabits(nextHabits);
  };

  // Petting interaction
  const handlePet = () => {
    if (!petState) return;
    const nextPet: PetState = {
      ...petState,
      petPettedCount: petState.petPettedCount + 1,
      xp: petState.xp + 2, // mini bonus for petting
    };
    setPetState(nextPet);
    savePetState(nextPet);
  };

  // Treat feeding interaction
  const handleFeedTreat = () => {
    if (!petState || petState.treatsAvailable <= 0) return;
    const nextPet: PetState = {
      ...petState,
      treatsAvailable: Math.max(0, petState.treatsAvailable - 1),
      treatsFed: petState.treatsFed + 1,
      xp: petState.xp + 5,
    };
    setPetState(nextPet);
    savePetState(nextPet);
  };

  // Rename cat
  const handleRename = (newName: string) => {
    if (!petState) return;
    const nextPet: PetState = {
      ...petState,
      name: newName,
    };
    setPetState(nextPet);
    savePetState(nextPet);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  if (!isLoaded || !petState) {
    return (
      <div className="min-h-screen bg-[#3E2C23] flex flex-col items-center justify-center text-[#F4E4A6] gap-3">
        <div className="text-4xl animate-bounce">🐾</div>
        <p className="text-sm font-semibold tracking-wide">Мурка просыпается...</p>
      </div>
    );
  }

  const pendingTodayCount = totalHabitsCount - completedTodayCount;

  return (
    <div className="min-h-screen bg-[#3E2C23] text-[#FDFBF7] flex flex-col selection:bg-[#F4E4A6] selection:text-[#3E2C23]">
      {/* Top App Bar */}
      <Header
        streak={petState.streak}
        level={petState.level}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main Container constrained for mobile ergonomics */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4">
        {activeTab === 'habits' && (
          <HabitsScreen
            habits={habits}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            petMood={petMood}
            petName={petState.name}
          />
        )}

        {activeTab === 'pet' && (
          <PetScreen
            petState={petState}
            petMood={petMood}
            completedTodayCount={completedTodayCount}
            totalHabitsCount={totalHabitsCount}
            onPet={handlePet}
            onFeedTreat={handleFeedTreat}
            onRename={handleRename}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressScreen
            petState={petState}
            habits={habits}
          />
        )}

        {activeTab === 'share' && (
          <ShareScreen
            petState={petState}
            petMood={petMood}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingTodayCount > 0 ? pendingTodayCount : 0}
      />
    </div>
  );
}
