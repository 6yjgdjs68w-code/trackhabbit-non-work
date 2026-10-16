/**
 * Telegram CloudStorage & LocalStorage Sync Layer
 * Conforms to Telegram Mini Apps CloudStorage specification with seamless local fallback
 * and API version detection to prevent "CloudStorage is not supported in version X" errors.
 */

import { Habit, PetState } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isVersionAtLeast?: (version: string) => boolean;
        CloudStorage?: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success?: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success?: boolean) => void) => void;
          removeItems: (keys: string[], callback?: (error: Error | null, success?: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        openTelegramLink: (url: string) => void;
        openLink: (url: string) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        showPopup: (params: { title?: string; message: string; buttons?: Array<{ type: string; text?: string; id?: string }> }, callback?: (buttonId: string) => void) => void;
      };
    };
  }
}

const HABITS_STORAGE_KEY = 'murka_habits_v1';
const PET_STORAGE_KEY = 'murka_pet_v1';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if the active Telegram WebApp version supports a specific feature
 */
export function isTelegramVersionAtLeast(minVersion: string): boolean {
  try {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return false;
    if (typeof webApp.isVersionAtLeast === 'function') {
      return webApp.isVersionAtLeast(minVersion);
    }
    const current = parseFloat(webApp.version || '0');
    const target = parseFloat(minVersion);
    return current >= target;
  } catch {
    return false;
  }
}

/**
 * CloudStorage was introduced in Telegram Mini Apps API 6.9.
 * Checking this prevents "[Telegram.WebApp] CloudStorage is not supported in version 6.0" errors.
 */
export function isCloudStorageSupported(): boolean {
  try {
    const webApp = window.Telegram?.WebApp;
    if (!webApp || !webApp.CloudStorage) return false;
    return isTelegramVersionAtLeast('6.9');
  } catch {
    return false;
  }
}

// Initial Starter Habits
export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit-water',
    title: 'Выпить 2л чистой воды',
    icon: 'droplet',
    category: 'Здоровье',
    createdAt: getTodayDateString(),
    completedDates: [],
  },
  {
    id: 'habit-exercise',
    title: 'Утренняя зарядка 15 мин',
    icon: 'zap',
    category: 'Тело',
    createdAt: getTodayDateString(),
    completedDates: [],
  },
  {
    id: 'habit-read',
    title: 'Чтение книги 20 мин',
    icon: 'book-open',
    category: 'Развитие',
    createdAt: getTodayDateString(),
    completedDates: [],
  },
  {
    id: 'habit-walk',
    title: 'Прогулка на свежем воздухе',
    icon: 'footprints',
    category: 'Энергия',
    createdAt: getTodayDateString(),
    completedDates: [],
  },
];

export const DEFAULT_PET_STATE: PetState = {
  name: 'Мурка',
  level: 1,
  xp: 0,
  streak: 1,
  longestStreak: 1,
  lastActiveDate: getTodayDateString(),
  petPettedCount: 0,
  treatsAvailable: 2,
  treatsFed: 0,
};

/**
 * CloudStorage Promise wrapper with safe version check and localStorage fallback
 */
export async function getCloudItem(key: string): Promise<string | null> {
  const localValue = localStorage.getItem(key);

  if (!isCloudStorageSupported()) {
    return localValue;
  }

  const cloud = window.Telegram?.WebApp?.CloudStorage;
  if (!cloud || typeof cloud.getItem !== 'function') {
    return localValue;
  }

  return new Promise((resolve) => {
    try {
      cloud.getItem(key, (error, value) => {
        if (error || value === undefined || value === null || value === '') {
          resolve(localValue);
        } else {
          try {
            localStorage.setItem(key, value);
          } catch {
            // ignore quota errors
          }
          resolve(value);
        }
      });
    } catch {
      resolve(localValue);
    }
  });
}

export async function setCloudItem(key: string, value: string): Promise<void> {
  // Always write to localStorage first for instant zero-latency UI response
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota errors
  }

  if (!isCloudStorageSupported()) {
    return;
  }

  const cloud = window.Telegram?.WebApp?.CloudStorage;
  if (!cloud || typeof cloud.setItem !== 'function') {
    return;
  }

  return new Promise((resolve) => {
    try {
      cloud.setItem(key, value, (_error, _success) => {
        resolve();
      });
    } catch {
      resolve();
    }
  });
}

/**
 * Load habits with synchronous local cache and asynchronous CloudStorage sync
 */
export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await getCloudItem(HABITS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load habits from storage:', err);
  }
  return DEFAULT_HABITS;
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  try {
    await setCloudItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to storage:', err);
  }
}

/**
 * Load pet state with synchronous local cache and asynchronous CloudStorage sync
 */
export async function loadPetState(): Promise<PetState> {
  try {
    const raw = await getCloudItem(PET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          ...DEFAULT_PET_STATE,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load pet state from storage:', err);
  }
  return DEFAULT_PET_STATE;
}

export async function savePetState(petState: PetState): Promise<void> {
  try {
    await setCloudItem(PET_STORAGE_KEY, JSON.stringify(petState));
  } catch (err) {
    console.error('Failed to save pet state to storage:', err);
  }
}

/**
 * Telegram Haptic Feedback Helper with version checking
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg || !isTelegramVersionAtLeast('6.1') || !tg.HapticFeedback) return;

    if (type === 'success' || type === 'warning' || type === 'error') {
      tg.HapticFeedback.notificationOccurred(type);
    } else {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch {
    // Non-fatal if unsupported
  }
}

/**
 * Initialize Telegram WebApp settings safely
 */
export function initTelegramApp() {
  try {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    if (typeof tg.ready === 'function') {
      tg.ready();
    }
    if (typeof tg.expand === 'function') {
      tg.expand();
    }

    if (isTelegramVersionAtLeast('6.1')) {
      if (typeof tg.setHeaderColor === 'function') {
        tg.setHeaderColor('#3E2C23');
      }
      if (typeof tg.setBackgroundColor === 'function') {
        tg.setBackgroundColor('#3E2C23');
      }
    }
  } catch (err) {
    console.warn('Telegram WebApp init error:', err);
  }
}
