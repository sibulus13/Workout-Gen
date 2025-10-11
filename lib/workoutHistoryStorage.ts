import type { WorkoutPlan } from '@/types/workout';

export interface WorkoutHistoryItem {
  id: string;
  plan: WorkoutPlan;
  createdAt: string;
  name?: string; // Optional custom name for the workout
}

const STORAGE_KEY = 'workout_history';
const MAX_HISTORY_ITEMS = 20; // Keep last 20 workout plans

export const workoutHistoryStorage = {
  getAll(): WorkoutHistoryItem[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const history = JSON.parse(stored);
      return Array.isArray(history) ? history : [];
    } catch (error) {
      console.error('Failed to load workout history:', error);
      return [];
    }
  },

  save(plan: WorkoutPlan, name?: string): WorkoutHistoryItem {
    const newItem: WorkoutHistoryItem = {
      id: Date.now().toString(),
      plan,
      createdAt: new Date().toISOString(),
      name: name || undefined
    };

    try {
      const history = this.getAll();

      // Add new item at the be ginning
      const updatedHistory = [newItem, ...history];

      // Keep only the most recent items
      const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
      return newItem;
    } catch (error) {
      console.error('Failed to save workout to history:', error);
      return newItem;
    }
  },

  get(id: string): WorkoutHistoryItem | null {
    const history = this.getAll();
    return history.find(item => item.id === id) || null;
  },

  delete(id: string): void {
    try {
      const history = this.getAll();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to delete workout from history:', error);
    }
  },

  updateName(id: string, name: string): void {
    try {
      const history = this.getAll();
      const updatedHistory = history.map(item =>
        item.id === id ? { ...item, name } : item
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to update workout name:', error);
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear workout history:', error);
    }
  }
};
