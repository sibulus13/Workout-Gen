'use client';

import { useState, useEffect } from 'react';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutDisplay from '@/components/WorkoutDisplay';
import WorkoutChat from '@/components/WorkoutChat';
import WorkoutHistory from '@/components/WorkoutHistory';
import type { UserProfile, WorkoutPlan } from '@/types/workout';
import { workoutPlanStorage } from '@/lib/workoutPlanStorage';
import { workoutHistoryStorage } from '@/lib/workoutHistoryStorage';

type ViewMode = 'plan' | 'chat' | 'history';

export default function Home() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planTimestamp, setPlanTimestamp] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('plan');
  const [isChatOpen, setIsChatOpen] = useState(false);

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

      // Save to localStorage and history
      workoutPlanStorage.save(plan);
      workoutHistoryStorage.save(plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearPlan = () => {
    setWorkoutPlan(null);
    setPlanTimestamp(null);
    setViewMode('plan');
    workoutPlanStorage.clear();
  };

  const handlePlanUpdate = (updatedPlan: WorkoutPlan) => {
    setWorkoutPlan(updatedPlan);
    setPlanTimestamp(new Date().toISOString());
    workoutPlanStorage.save(updatedPlan);
    workoutHistoryStorage.save(updatedPlan);
  };

  const handleLoadFromHistory = (plan: WorkoutPlan) => {
    setWorkoutPlan(plan);
    setPlanTimestamp(new Date().toISOString());
    workoutPlanStorage.save(plan);
    setViewMode('plan');
    setIsChatOpen(false);
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
          <div className="mx-auto h-full flex flex-col" style={{ maxWidth: isChatOpen ? '100%' : '1280px' }}>
            {/* Plan timestamp and controls */}
            <div className="mb-4 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                {planTimestamp && (
                  <div className="text-xs text-[--muted]">
                    Generated {new Date(planTimestamp).toLocaleDateString()} at {new Date(planTimestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* History Button */}
                <button
                  onClick={() => {
                    setViewMode(viewMode === 'history' ? 'plan' : 'history');
                    setIsChatOpen(false);
                  }}
                  className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    viewMode === 'history'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="View workout history"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  History
                </button>

                {/* Chat Toggle Button */}
                {viewMode === 'plan' && (
                  <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm ${
                      isChatOpen
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                    }`}
                    title={isChatOpen ? 'Close chat' : 'Open chat to modify plan'}
                  >
                    <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {isChatOpen ? 'Close Chat' : 'Modify Plan'}
                  </button>
                )}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex px-4">
              {viewMode === 'history' ? (
                <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 overflow-hidden">
                  <WorkoutHistory onLoadPlan={handleLoadFromHistory} />
                </div>
              ) : (
                <>
                  {/* Workout Plan Display */}
                  <div className="flex-1 transition-all duration-300 overflow-hidden">
                    <div className="h-full overflow-y-auto">
                      <WorkoutDisplay plan={workoutPlan} />
                    </div>
                  </div>

                  {/* Chat Panel - Slides in from right */}
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      isChatOpen ? 'w-96 opacity-100 pl-4' : 'w-0 opacity-0'
                    }`}
                  >
                    {isChatOpen && (
                      <div className="h-full">
                        <WorkoutChat plan={workoutPlan} onPlanUpdate={handlePlanUpdate} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-6 px-4">
              <button
                onClick={handleClearPlan}
                className="w-full btn btn-primary font-medium py-3 px-4 rounded transition-colors duration-150"
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
