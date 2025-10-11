'use client';

import { useRef, useState, useEffect } from 'react';
import type { WorkoutPlan } from '@/types/workout';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
}

export default function WorkoutDisplay({ plan }: WorkoutDisplayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-plan-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    let csv = 'Day,Exercise,Sets,Reps,Rest,Duration (min),Execution Instructions,Notes\n';

    plan.sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const row = [
          `Day ${session.dayNumber}: ${session.dayName}`,
          exercise.name,
          exercise.sets,
          exercise.reps,
          exercise.rest,
          exercise.durationMinutes || '',
          `"${exercise.executionInstructions || ''}"`,
          `"${exercise.notes || ''}"`
        ].join(',');
        csv += row + '\n';
      });
    });

    const dataBlob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-plan-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsTXT = () => {
    let txt = `${plan.title}\n${'='.repeat(plan.title.length)}\n\n`;
    txt += `${plan.description}\n\n`;

    plan.sessions.forEach(session => {
      txt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      txt += `Day ${session.dayNumber}: ${session.dayName}\n`;
      if (session.totalDurationMinutes) {
        txt += `Duration: ~${session.totalDurationMinutes} min`;
      }
      if (session.intensity) {
        txt += ` | Intensity: ${session.intensity.replace('_', ' ').toUpperCase()}`;
      }
      txt += '\n';
      if (session.targetMuscleGroups && session.targetMuscleGroups.length > 0) {
        txt += `Target Muscles: ${session.targetMuscleGroups.join(', ')}\n`;
      }
      txt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      session.exercises.forEach((exercise, idx) => {
        txt += `${idx + 1}. ${exercise.name}\n`;
        txt += `   Sets: ${exercise.sets} | Reps: ${exercise.reps} | Rest: ${exercise.rest}`;
        if (exercise.durationMinutes) {
          txt += ` | Duration: ~${exercise.durationMinutes} min`;
        }
        txt += '\n';

        if (exercise.executionInstructions) {
          txt += `   → Execution: ${exercise.executionInstructions}\n`;
        }

        if (exercise.notes) {
          txt += `   💡 ${exercise.notes}\n`;
        }

        txt += '\n';
      });
    });

    if (plan.tips && plan.tips.length > 0) {
      txt += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
      txt += 'TIPS FOR SUCCESS\n';
      txt += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
      plan.tips.forEach((tip, idx) => {
        txt += `${idx + 1}. ${tip}\n`;
      });
    }

    const dataBlob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workout-plan-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Calculate total workout plan duration
  const totalPlanDuration = plan.sessions.reduce(
    (acc, session) => acc + (session.totalDurationMinutes || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold">{plan.title}</h2>
          <div className="flex items-center gap-2">
            {totalPlanDuration > 0 && (
              <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Total: ~{totalPlanDuration} min
                </span>
              </div>
            )}
            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportAsJSON}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                title="Export as JSON"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                JSON
              </button>
              <button
                onClick={exportAsCSV}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                title="Export as CSV"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                CSV
              </button>
              <button
                onClick={exportAsTXT}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                title="Export as TXT"
              >
                <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                TXT
              </button>
            </div>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{plan.description}</p>
      </div>

      {/* Workout Sessions - Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Your Workout Sessions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag or scroll horizontally →
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`overflow-x-auto overflow-y-visible pb-4 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-6" style={{ minWidth: 'min-content' }}>
            {plan.sessions.map((session, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-80 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850"
              >
                {/* Session Header */}
                <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    Day {session.dayNumber}: {session.dayName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {session.totalDurationMinutes && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        ⏱ ~{session.totalDurationMinutes} min
                      </span>
                    )}
                    {session.intensity && (
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        session.intensity === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        session.intensity === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        session.intensity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {session.intensity === 'low' ? '🔥' :
                         session.intensity === 'moderate' ? '🔥🔥' :
                         session.intensity === 'high' ? '🔥🔥🔥' : '🔥🔥🔥🔥'}{' '}
                        {session.intensity.replace('_', ' ').toUpperCase()} INTENSITY
                      </span>
                    )}
                  </div>
                  {session.targetMuscleGroups && session.targetMuscleGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.targetMuscleGroups.map((muscle, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exercises */}
                <div className="space-y-3">
                  {session.exercises.map((exercise, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-white dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                    >
                      {/* Exercise Name */}
                      <h5 className="font-semibold text-base mb-2">{exercise.name}</h5>

                      {/* Execution Instructions */}
                      {exercise.executionInstructions && (
                        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border-l-3 border-amber-400 dark:border-amber-600 rounded">
                          <p className="text-xs text-amber-900 dark:text-amber-200">
                            <span className="font-semibold">Execution: </span>
                            {exercise.executionInstructions}
                          </p>
                        </div>
                      )}

                      {/* Exercise Details Grid */}
                      <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Sets</span>
                          <span className="font-medium">{exercise.sets}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Reps</span>
                          <span className="font-medium">{exercise.reps}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400 block">Rest</span>
                          <span className="font-medium">{exercise.rest}</span>
                        </div>
                      </div>

                      {/* Duration */}
                      {exercise.durationMinutes && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          ⏱ ~{exercise.durationMinutes} min
                        </div>
                      )}

                      {/* Demo Media */}
                      {exercise.demoMedia && (
                        <div className="mt-3 mb-2">
                          {exercise.demoMedia.type === 'image' && (
                            <img
                              src={exercise.demoMedia.url}
                              alt={`${exercise.name} demo`}
                              className="w-full h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                            />
                          )}
                          {exercise.demoMedia.type === 'video' && (
                            <div className="relative">
                              {exercise.demoMedia.thumbnail ? (
                                <a
                                  href={exercise.demoMedia.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block relative group"
                                >
                                  <img
                                    src={exercise.demoMedia.thumbnail}
                                    alt={`${exercise.name} demo`}
                                    className="w-full h-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 rounded transition-colors">
                                    <svg
                                      className="w-12 h-12 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </a>
                              ) : (
                                <video
                                  src={exercise.demoMedia.url}
                                  controls
                                  className="w-full h-32 rounded border border-gray-300 dark:border-gray-600"
                                />
                              )}
                            </div>
                          )}
                          {exercise.demoMedia.type === 'link' && (
                            <a
                              href={exercise.demoMedia.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              View Exercise Demo
                            </a>
                          )}
                        </div>
                      )}

                      {/* Notes */}
                      {exercise.notes && (
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 italic border-t border-gray-200 dark:border-gray-600 pt-2">
                          💡 {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tips for Success
          </h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
