'use client';

import { useState, useEffect } from 'react';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutDisplay from '@/components/WorkoutDisplay';
import type { UserProfile, WorkoutPlan } from '@/types/workout';
import { workoutPlanStorage } from '@/lib/workoutPlanStorage';

export default function Home() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planTimestamp, setPlanTimestamp] = useState<string | null>(null);

  // Load saved workout plan on mount
  useEffect(() => {
    const savedPlan = workoutPlanStorage.get();
    const timestamp = workoutPlanStorage.getTimestamp();
    if (savedPlan) {
      setWorkoutPlan(savedPlan);
      setPlanTimestamp(timestamp);
    }
  }, []);

  const handleGenerate = async (profile: UserProfile) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to generate workout plan');
      }

      const plan: WorkoutPlan = await response.json();

      // Console log the response to debug
      console.log('=== AI Response ===');
      console.log('Title:', plan.title);
      console.log('Description:', plan.description);
      console.log('Number of sessions:', plan.sessions.length);
      console.log('Full response:', JSON.stringify(plan, null, 2));
      console.log('==================');

      setWorkoutPlan(plan);
      setPlanTimestamp(new Date().toISOString());

      // Save to localStorage
      workoutPlanStorage.save(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlan = () => {
    setWorkoutPlan(null);
    setPlanTimestamp(null);
    workoutPlanStorage.clear();
  };

  return (
    <main className="h-screen overflow-hidden bg-[--background] flex flex-col">
      {/* Header */}
      <div className="border-b border-[--card-border] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 tracking-tight">
            Workout Plan Generator
          </h1>
          <p className="text-base text-[--muted]">
            AI-powered personalized training plans
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto w-full px-4 mt-4">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-900 dark:text-red-200 px-4 py-3 rounded text-sm">
            <p className="font-medium mb-1">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-4 py-6">
        {!workoutPlan ? (
          <div className="max-w-3xl mx-auto h-full">
            <WorkoutForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            {/* Plan timestamp indicator */}
            {planTimestamp && (
              <div className="mb-4 text-xs text-[--muted] text-center">
                Generated {new Date(planTimestamp).toLocaleDateString()} at {new Date(planTimestamp).toLocaleTimeString()}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <WorkoutDisplay plan={workoutPlan} />
            </div>

            <div className="pt-6">
              <button
                onClick={handleClearPlan}
                className="w-full bg-[--accent] hover:bg-[--accent-hover] text-white font-medium py-3 px-4 rounded transition-colors duration-150"
              >
                Generate New Plan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-4 px-4 text-xs text-[--muted] border-t border-[--card-border]">
        <p>
          Powered by AI • Consult a healthcare professional before starting any workout routine
        </p>
      </div>
    </main>
  );
}
