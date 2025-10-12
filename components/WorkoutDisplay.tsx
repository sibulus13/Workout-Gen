'use client';

import { useState, useRef } from 'react';
import type { WorkoutPlan } from '@/types/workout';
import { jsPDF } from 'jspdf';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
}

export default function WorkoutDisplay({ plan }: WorkoutDisplayProps) {
  const [collapsedSessions, setCollapsedSessions] = useState<Set<number>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const toggleSession = (sessionIndex: number) => {
    const newCollapsed = new Set(collapsedSessions);
    if (newCollapsed.has(sessionIndex)) {
      newCollapsed.delete(sessionIndex);
    } else {
      newCollapsed.add(sessionIndex);
    }
    setCollapsedSessions(newCollapsed);
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
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

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

  const exportAsPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let y = margin;

    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > pageHeight - margin) {
        doc.addPage();
        y = margin;
        return true;
      }
      return false;
    };

    const wrapText = (text: string, maxWidth: number) => {
      return doc.splitTextToSize(text, maxWidth);
    };

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(plan.title, margin, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = wrapText(plan.description, pageWidth - 2 * margin);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 10;

    plan.sessions.forEach((session) => {
      checkPageBreak(30);

      doc.setFillColor(59, 130, 246);
      doc.rect(margin, y - 5, pageWidth - 2 * margin, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${session.dayNumber}: ${session.dayName}`, margin + 2, y + 2);
      y += 12;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      let sessionInfo = '';
      if (session.totalDurationMinutes) {
        sessionInfo += `Duration: ~${session.totalDurationMinutes} min`;
      }
      if (session.intensity) {
        if (sessionInfo) sessionInfo += ' | ';
        sessionInfo += `Intensity: ${session.intensity.replace('_', ' ').toUpperCase()}`;
      }
      if (sessionInfo) {
        doc.text(sessionInfo, margin, y);
        y += 5;
      }

      if (session.targetMuscleGroups && session.targetMuscleGroups.length > 0) {
        doc.text(`Target Muscles: ${session.targetMuscleGroups.join(', ')}`, margin, y);
        y += 7;
      }

      y += 3;

      session.exercises.forEach((exercise, exIdx) => {
        checkPageBreak(25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exIdx + 1}. ${exercise.name}`, margin + 5, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let details = `Sets: ${exercise.sets} | Reps: ${exercise.reps} | Rest: ${exercise.rest}`;
        if (exercise.durationMinutes) {
          details += ` | Duration: ~${exercise.durationMinutes} min`;
        }
        doc.text(details, margin + 7, y);
        y += 5;

        if (exercise.executionInstructions) {
          doc.setFont('helvetica', 'italic');
          const execLines = wrapText(`Execution: ${exercise.executionInstructions}`, pageWidth - 2 * margin - 10);
          execLines.forEach((line: string) => {
            checkPageBreak(5);
            doc.text(line, margin + 7, y);
            y += 4;
          });
          y += 1;
        }

        if (exercise.notes) {
          doc.setFont('helvetica', 'normal');
          const noteLines = wrapText(`Note: ${exercise.notes}`, pageWidth - 2 * margin - 10);
          noteLines.forEach((line: string) => {
            checkPageBreak(5);
            doc.text(line, margin + 7, y);
            y += 4;
          });
        }

        y += 3;
      });

      y += 5;
    });

    if (plan.tips && plan.tips.length > 0) {
      checkPageBreak(20);

      doc.setFillColor(239, 246, 255);
      doc.rect(margin, y - 3, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Tips for Success', margin + 2, y + 2);
      y += 12;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      plan.tips.forEach((tip, idx) => {
        checkPageBreak(10);
        const tipLines = wrapText(`${idx + 1}. ${tip}`, pageWidth - 2 * margin - 5);
        tipLines.forEach((line: string) => {
          doc.text(line, margin + 2, y);
          y += 5;
        });
        y += 2;
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated by Ascension.AI - Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`workout-plan-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate total workout plan duration
  const totalPlanDuration = plan.sessions.reduce(
    (acc, session) => acc + (session.totalDurationMinutes || 0),
    0
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-3 md:p-6 rounded-lg shadow-lg space-y-4 md:space-y-6">
      {/* Header Section - Stack on mobile */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-2xl md:text-3xl font-bold">{plan.title}</h2>

          {/* Duration Badge - Full width on mobile */}
          {totalPlanDuration > 0 && (
            <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg w-full md:w-auto justify-center md:justify-start">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                Total: ~{totalPlanDuration} min
              </span>
            </div>
          )}
        </div>

        {/* Export Buttons - Full width row on mobile */}
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
          <button
            onClick={exportAsPDF}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            title="Export as PDF"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            PDF
          </button>
          <button
            onClick={exportAsJSON}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            title="Export as JSON"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            JSON
          </button>
          <button
            onClick={exportAsCSV}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            title="Export as CSV"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            CSV
          </button>
          <button
            onClick={exportAsTXT}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
            title="Export as TXT"
          >
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            TXT
          </button>
        </div>

        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{plan.description}</p>
      </div>

      {/* Workout Sessions - Vertical stack on mobile, horizontal scroll on desktop */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg md:text-xl font-semibold">Your Workout Sessions</h3>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Drag to scroll
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="md:hidden space-y-3">
          {plan.sessions.map((session, idx) => {
            const isCollapsed = collapsedSessions.has(idx);
            return (
              <div
                key={idx}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850"
              >
                {/* Collapsible Header */}
                <button
                  onClick={() => toggleSession(idx)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-200 active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 mb-2">
                        Day {session.dayNumber}: {session.dayName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {session.totalDurationMinutes && (
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded transition-colors">
                            ⏱ ~{session.totalDurationMinutes} min
                          </span>
                        )}
                        {session.intensity && (
                          <span className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                            session.intensity === 'low' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            session.intensity === 'moderate' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            session.intensity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                            {session.intensity === 'low' ? '🔥' :
                             session.intensity === 'moderate' ? '🔥🔥' :
                             session.intensity === 'high' ? '🔥🔥🔥' : '🔥🔥🔥🔥'}{' '}
                            {session.intensity.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Collapsible Content with Animation */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                }`}>
                  <div className="px-4 pb-4 space-y-3">
                    {session.targetMuscleGroups && session.targetMuscleGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {session.targetMuscleGroups.map((muscle, muscleIdx) => (
                          <span key={muscleIdx} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Exercises */}
                    {session.exercises.map((exercise, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-white dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                      >
                        <h5 className="font-semibold text-sm mb-2">{exercise.name}</h5>

                        {exercise.executionInstructions && (
                          <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-400 dark:border-amber-600 rounded text-xs">
                            <span className="font-semibold">Execution: </span>
                            {exercise.executionInstructions}
                          </div>
                        )}

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

                        {exercise.durationMinutes && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            ⏱ ~{exercise.durationMinutes} min
                          </div>
                        )}

                        {exercise.notes && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 italic border-t border-gray-200 dark:border-gray-600 pt-2">
                            💡 {exercise.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: Horizontal Scroll - Hidden on mobile */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`hidden md:block overflow-x-auto pb-4 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          style={{ scrollbarWidth: 'thin' }}
        >
          <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
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
                      {session.targetMuscleGroups.map((muscle, muscleIdx) => (
                        <span key={muscleIdx} className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
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
                      className="bg-white dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                      <h5 className="font-semibold text-base mb-2">{exercise.name}</h5>

                      {exercise.executionInstructions && (
                        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/20 border-l-3 border-amber-400 dark:border-amber-600 rounded">
                          <p className="text-xs text-amber-900 dark:text-amber-200">
                            <span className="font-semibold">Execution: </span>
                            {exercise.executionInstructions}
                          </p>
                        </div>
                      )}

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

                      {exercise.durationMinutes && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          ⏱ ~{exercise.durationMinutes} min
                        </div>
                      )}

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
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-base md:text-lg font-semibold mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Tips for Success
          </h3>
          <ul className="space-y-2">
            {plan.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2 font-bold">•</span>
                <span className="text-gray-700 dark:text-gray-300 text-xs md:text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
