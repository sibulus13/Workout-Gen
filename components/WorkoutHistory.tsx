'use client';

import { useState, useEffect } from 'react';
import { workoutHistoryStorage, type WorkoutHistoryItem } from '@/lib/workoutHistoryStorage';
import type { WorkoutPlan } from '@/types/workout';

interface WorkoutHistoryProps {
  onLoadPlan: (plan: WorkoutPlan) => void;
  currentPlanId?: string;
}

export default function WorkoutHistory({ onLoadPlan, currentPlanId }: WorkoutHistoryProps) {
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = workoutHistoryStorage.getAll();
    setHistory(items);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this workout from history?')) {
      workoutHistoryStorage.delete(id);
      loadHistory();
    }
  };

  const handleStartEdit = (item: WorkoutHistoryItem) => {
    setEditingId(item.id);
    setEditingName(item.name || '');
  };

  const handleSaveEdit = () => {
    if (editingId) {
      workoutHistoryStorage.updateName(editingId, editingName);
      setEditingId(null);
      setEditingName('');
      loadHistory();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold mb-2">No Workout History</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your saved workout plans will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Workout History
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {history.length} saved workout{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              currentPlanId === item.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {editingId === item.id ? (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Enter workout name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">
                      {item.name || item.plan.title}
                    </h4>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Rename"
                    >
                      <svg className="w-3 h-3" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {formatDate(item.createdAt)}
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {item.plan.sessions.length} session{item.plan.sessions.length !== 1 ? 's' : ''}
                  </span>
                  {item.plan.sessions.reduce((total, session) => total + session.exercises.length, 0) > 0 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {item.plan.sessions.reduce((total, session) => total + session.exercises.length, 0)} exercises
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onLoadPlan(item.plan)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="Load this workout"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Delete from history"
                >
                  <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
