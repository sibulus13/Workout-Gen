export type Gender = 'male' | 'female' | 'other';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutGoal = 'strength' | 'cardio' | 'weight_loss' | 'muscle_gain' | 'flexibility' | 'general_fitness';
export type EquipmentType = 'full_gym' | 'dumbbells' | 'barbell' | 'pull_up_bar' | 'resistance_bands' | 'weighted_vest' | 'jump_rope' | 'kettlebell' | 'medicine_ball' | 'foam_roller' | 'yoga_mat' | 'bodyweight';
export type WorkoutTechnique = 'hiit' | 'circuit_training' | 'supersets' | 'dropsets' | 'pyramid_sets' | 'tempo_training' | 'none';
export type WorkoutPreferenceMode = 'sessions_per_week' | 'total_hours';

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  fitnessLevel: FitnessLevel;
  goal: WorkoutGoal;
  secondaryGoal?: WorkoutGoal; // Optional secondary fitness goal
  equipment: EquipmentType[];
  workoutPreferenceMode: WorkoutPreferenceMode;
  sessionsPerWeek?: number;
  timePerSession?: number; // in minutes
  totalHoursPerWeek?: number;
  limitations?: string;
  preferredTechniques?: WorkoutTechnique[];
  favoriteExercises?: string[]; // List of favorite exercises to prioritize
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // Can be "10-12" or "30 seconds" etc
  rest: string; // e.g., "60 seconds"
  notes?: string;
  executionInstructions?: string; // How to perform the exercise, e.g., "Push up as fast as possible, lower for 2 seconds"
  durationMinutes?: number; // Estimated duration for this exercise
  demoMedia?: {
    type: 'image' | 'video' | 'link';
    url: string;
    thumbnail?: string; // For videos
  };
}

export type IntensityLevel = 'low' | 'moderate' | 'high' | 'very_high';

export interface WorkoutSession {
  dayNumber: number;
  dayName: string;
  exercises: Exercise[];
  totalDurationMinutes?: number; // Estimated total duration for this session
  intensity?: IntensityLevel; // Session intensity level
  targetMuscleGroups?: string[]; // Primary muscle groups targeted
}

export interface WorkoutPlan {
  title: string;
  description: string;
  sessions: WorkoutSession[];
  tips?: string[];
}
