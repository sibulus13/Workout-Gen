import type { WorkoutPlan } from '@/types/workout';

const WORKOUT_PLAN_KEY = 'current_workout_plan';
const WORKOUT_PLAN_TIMESTAMP_KEY = 'workout_plan_timestamp';

export const workoutPlanStorage = {
  // Save the current workout plan
  save(plan: WorkoutPlan): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WORKOUT_PLAN_KEY, JSON.stringify(plan));
      localStorage.setItem(WORKOUT_PLAN_TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving workout plan to localStorage:', error);
    }
  },

  // Get the current workout plan
  get(): WorkoutPlan | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(WORKOUT_PLAN_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading workout plan from localStorage:', error);
      return null;
    }
  },

  // Get the timestamp of when the plan was saved
  getTimestamp(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(WORKOUT_PLAN_TIMESTAMP_KEY);
  },

  // Clear the current workout plan
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(WORKOUT_PLAN_KEY);
    localStorage.removeItem(WORKOUT_PLAN_TIMESTAMP_KEY);
  },

  // Check if a workout plan exists
  exists(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(WORKOUT_PLAN_KEY) !== null;
  },
};
