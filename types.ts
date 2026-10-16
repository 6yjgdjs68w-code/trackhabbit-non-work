export interface Habit {
  id: string;
  title: string;
  icon: string; // lucide icon identifier
  color?: string;
  category: string;
  createdAt: string;
  completedDates: string[]; // ['2026-10-16', ...]
}

export interface PetState {
  name: string;
  level: number;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  petPettedCount: number;
  treatsAvailable: number;
  treatsFed: number;
}

export type PetMood = 'happy' | 'content' | 'sad';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type TabType = 'habits' | 'pet' | 'progress' | 'share';
