'use client';

import { useState, useEffect } from 'react';
import type { UserProfile, Gender, FitnessLevel, WorkoutGoal, EquipmentType, WorkoutTechnique, WorkoutPreferenceMode } from '@/types/workout';
import { profileStorage, type SavedProfile } from '@/lib/profileStorage';

interface WorkoutFormProps {
  onGenerate: (profile: UserProfile) => void;
  isLoading: boolean;
}

export default function WorkoutForm({ onGenerate, isLoading }: WorkoutFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    gender: 'male',
    age: 30,
    height: 170,
    weight: 70,
    fitnessLevel: 'intermediate',
    goal: 'general_fitness',
    equipment: ['bodyweight'],
    workoutPreferenceMode: 'sessions_per_week',
    sessionsPerWeek: 3,
    timePerSession: 60,
    limitations: '',
    preferredTechniques: [],
    favoriteExercises: [],
  });

  // Profile management state
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [currentProfileName, setCurrentProfileName] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [saveProfileName, setSaveProfileName] = useState('');
  const [saveError, setSaveError] = useState('');

  const totalSteps = 5;

  // Favorite exercises state
  const [favoriteExerciseInput, setFavoriteExerciseInput] = useState('');

  // Loading state for animated ellipses and AI messages
  const [loadingDots, setLoadingDots] = useState('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const loadingMessages = [
    'Analyzing your profile',
    'Contemplating exercise combinations',
    'Designing your workout structure',
    'Thinking about optimal progressions',
    'Crafting personalized recommendations',
    'Calculating intensity levels',
    'Optimizing rest periods',
  ];

  // Load profiles and active profile on mount
  useEffect(() => {
    const profiles = profileStorage.getAll();
    setSavedProfiles(profiles);

    const activeProfile = profileStorage.getActiveProfile();
    if (activeProfile) {
      setFormData(activeProfile.profile);
      setCurrentProfileId(activeProfile.id);
      setCurrentProfileName(activeProfile.name);
    }
  }, []);

  // Animated ellipses when loading (tracks which dots to show)
  useEffect(() => {
    if (isLoading && currentStep === 5) {
      const dotsInterval = setInterval(() => {
        setLoadingDots(prev => {
          if (prev === '3') return '1';
          if (prev === '2') return '3';
          return '2';
        });
      }, 1000);

      return () => clearInterval(dotsInterval);
    } else {
      setLoadingDots('1');
    }
  }, [isLoading, currentStep]);

  // Rotate loading messages
  useEffect(() => {
    if (isLoading && currentStep === 5) {
      const messageInterval = setInterval(() => {
        setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
      }, 5500);

      return () => clearInterval(messageInterval);
    } else {
      setLoadingMessageIndex(0);
    }
  }, [isLoading, currentStep, loadingMessages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 4) {
      // Move to step 5 (loading) and trigger generation
      setCurrentStep(5);
      // Show save dialog before generating if profile not saved
      if (!currentProfileId) {
        setShowSaveDialog(true);
      } else {
        onGenerate(formData);
      }
    }
  };

  const handlePrevious = () => {
    // Prevent going back from loading screen
    if (currentStep > 1 && currentStep < 5) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEquipment = (equipment: EquipmentType) => {
    const current = formData.equipment || [];

    // If selecting full_gym, only keep full_gym
    if (equipment === 'full_gym') {
      updateField('equipment', ['full_gym']);
    } else {
      // Remove full_gym if present and toggle the selected equipment
      let updated = current.filter(e => e !== 'full_gym');
      if (updated.includes(equipment)) {
        updated = updated.filter(e => e !== equipment);
      } else {
        updated = [...updated, equipment];
      }
      updateField('equipment', updated.length > 0 ? updated : ['bodyweight']);
    }
  };

  const toggleTechnique = (technique: WorkoutTechnique) => {
    const current = formData.preferredTechniques || [];
    if (current.includes(technique)) {
      updateField('preferredTechniques', current.filter(t => t !== technique));
    } else {
      updateField('preferredTechniques', [...current, technique]);
    }
  };

  // Profile management functions
  const handleSaveProfile = () => {
    setSaveError('');
    const trimmedName = saveProfileName.trim();

    if (!trimmedName) {
      setSaveError('Please enter a profile name');
      return;
    }

    if (profileStorage.nameExists(trimmedName, currentProfileId || undefined)) {
      setSaveError('A profile with this name already exists');
      return;
    }

    const savedProfile = profileStorage.save(trimmedName, formData, currentProfileId || undefined);
    profileStorage.setActiveProfileId(savedProfile.id);

    setCurrentProfileId(savedProfile.id);
    setCurrentProfileName(savedProfile.name);
    setSavedProfiles(profileStorage.getAll());
    setShowSaveDialog(false);
    setSaveProfileName('');

    // Move to step 5 and generate workout after saving
    setCurrentStep(5);
    onGenerate(formData);
  };

  const handleLoadProfile = (profile: SavedProfile) => {
    setFormData(profile.profile);
    setCurrentProfileId(profile.id);
    setCurrentProfileName(profile.name);
    profileStorage.setActiveProfileId(profile.id);
    setShowProfileMenu(false);
    setCurrentStep(1);
  };

  const handleNewProfile = () => {
    setFormData({
      gender: 'male',
      age: 30,
      height: 170,
      weight: 70,
      fitnessLevel: 'intermediate',
      goal: 'general_fitness',
      equipment: ['bodyweight'],
      workoutPreferenceMode: 'sessions_per_week',
      sessionsPerWeek: 3,
      timePerSession: 60,
      limitations: '',
      preferredTechniques: [],
      favoriteExercises: [],
    });
    setCurrentProfileId(null);
    setCurrentProfileName('');
    profileStorage.setActiveProfileId(null);
    setShowProfileMenu(false);
    setCurrentStep(1);
  };

  const addFavoriteExercise = () => {
    const trimmed = favoriteExerciseInput.trim();
    if (trimmed && !(formData.favoriteExercises || []).includes(trimmed)) {
      updateField('favoriteExercises', [...(formData.favoriteExercises || []), trimmed]);
      setFavoriteExerciseInput('');
    }
  };

  const removeFavoriteExercise = (exercise: string) => {
    updateField('favoriteExercises', (formData.favoriteExercises || []).filter(e => e !== exercise));
  };

  const handleDeleteProfile = (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this profile?')) {
      profileStorage.delete(profileId);
      setSavedProfiles(profileStorage.getAll());

      if (currentProfileId === profileId) {
        handleNewProfile();
      }
    }
  };

  const handleUpdateProfile = () => {
    if (currentProfileId && currentProfileName) {
      profileStorage.save(currentProfileName, formData, currentProfileId);
      setSavedProfiles(profileStorage.getAll());
    }
  };

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner', description: "Haven't exercised regularly or just starting out" },
    { value: 'intermediate', label: 'Intermediate', description: 'Exercise 2-3 times per week with basic knowledge' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training with excellent form and technique' },
  ];

  const equipmentOptions = [
    { value: 'full_gym', label: 'Full Gym Access', description: 'Everything included' },
    { value: 'dumbbells', label: 'Dumbbells', description: 'Various weights' },
    { value: 'barbell', label: 'Barbell', description: 'With weight plates' },
    { value: 'pull_up_bar', label: 'Pull-up Bar', description: 'Wall or door mounted' },
    { value: 'resistance_bands', label: 'Resistance Bands', description: 'Various resistance levels' },
    { value: 'weighted_vest', label: 'Weighted Vest', description: 'Add resistance to bodyweight' },
    { value: 'jump_rope', label: 'Jump Rope', description: 'For cardio' },
    { value: 'kettlebell', label: 'Kettlebell', description: 'For dynamic movements' },
    { value: 'medicine_ball', label: 'Medicine Ball', description: 'For core and power' },
    { value: 'foam_roller', label: 'Foam Roller', description: 'For recovery' },
    { value: 'yoga_mat', label: 'Yoga Mat', description: 'For floor exercises' },
    { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => updateField('gender', e.target.value as Gender)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', parseInt(e.target.value))}
                  min="13"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateField('height', parseInt(e.target.value))}
                  min="100"
                  max="250"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateField('weight', parseInt(e.target.value))}
                  min="30"
                  max="300"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Fitness Profile</h2>

            {/* Fitness Level */}
            <div>
              <label className="block text-sm font-medium mb-3">Fitness Level</label>
              <div className="space-y-3">
                {fitnessLevels.map((level) => (
                  <div
                    key={level.value}
                    onClick={() => updateField('fitnessLevel', level.value as FitnessLevel)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.fitnessLevel === level.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        formData.fitnessLevel === level.value
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.fitnessLevel === level.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{level.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-medium mb-2">Primary Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => updateField('goal', e.target.value as WorkoutGoal)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="strength">Build Strength</option>
                <option value="cardio">Improve Cardio</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="flexibility">Flexibility</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            {/* Secondary Goal */}
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Goal (Optional)</label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Select an additional goal to balance your workout plan
              </p>
              <select
                value={formData.secondaryGoal || ''}
                onChange={(e) => updateField('secondaryGoal', e.target.value ? e.target.value as WorkoutGoal : undefined)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">None</option>
                <option value="strength" disabled={formData.goal === 'strength'}>Build Strength</option>
                <option value="cardio" disabled={formData.goal === 'cardio'}>Improve Cardio</option>
                <option value="weight_loss" disabled={formData.goal === 'weight_loss'}>Weight Loss</option>
                <option value="muscle_gain" disabled={formData.goal === 'muscle_gain'}>Muscle Gain</option>
                <option value="flexibility" disabled={formData.goal === 'flexibility'}>Flexibility</option>
                <option value="general_fitness" disabled={formData.goal === 'general_fitness'}>General Fitness</option>
              </select>
            </div>

            {/* Available Equipment */}
            <div>
              <label className="block text-sm font-medium mb-3">Available Equipment (Select all that apply)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                {equipmentOptions.map((equipment) => (
                  <div
                    key={equipment.value}
                    onClick={() => toggleEquipment(equipment.value as EquipmentType)}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.equipment?.includes(equipment.value as EquipmentType)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        formData.equipment?.includes(equipment.value as EquipmentType)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.equipment?.includes(equipment.value as EquipmentType) && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{equipment.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{equipment.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Physical Limitations or Injuries (Optional)
              </label>
              <textarea
                value={formData.limitations}
                onChange={(e) => updateField('limitations', e.target.value)}
                placeholder="e.g., Lower back pain, knee issues..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Workout Preferences</h2>

            {/* Preference Mode Selector */}
            <div>
              <label className="block text-sm font-medium mb-3">How would you like to plan your workouts?</label>
              <div className="space-y-3">
                <div
                  onClick={() => updateField('workoutPreferenceMode', 'sessions_per_week')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.workoutPreferenceMode === 'sessions_per_week'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                      formData.workoutPreferenceMode === 'sessions_per_week'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {formData.workoutPreferenceMode === 'sessions_per_week' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Sessions Per Week</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Specify number of sessions and max duration per session</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => updateField('workoutPreferenceMode', 'total_hours')}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.workoutPreferenceMode === 'total_hours'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                      formData.workoutPreferenceMode === 'total_hours'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-400'
                    }`}>
                      {formData.workoutPreferenceMode === 'total_hours' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">Total Hours Per Week</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Specify total weekly hours and let AI distribute them</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditional Fields Based on Mode */}
            {formData.workoutPreferenceMode === 'sessions_per_week' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Sessions Per Week</label>
                  <input
                    type="number"
                    value={formData.sessionsPerWeek || 3}
                    onChange={(e) => updateField('sessionsPerWeek', parseInt(e.target.value))}
                    min="1"
                    max="7"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Maximum Duration Per Session (minutes)</label>
                  <input
                    type="number"
                    value={formData.timePerSession || 60}
                    onChange={(e) => updateField('timePerSession', parseInt(e.target.value))}
                    min="15"
                    max="180"
                    step="15"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Total Hours Per Week</label>
                <input
                  type="number"
                  value={formData.totalHoursPerWeek || 3}
                  onChange={(e) => updateField('totalHoursPerWeek', parseFloat(e.target.value))}
                  min="0.5"
                  max="20"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI will distribute this time optimally throughout the week</p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Preferences</h2>

            {/* Favorite Exercises */}
            <div>
              <label className="block text-sm font-medium mb-3">Favorite Exercises (Optional)</label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Add exercises you enjoy and want to prioritize in your workout plan
              </p>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={favoriteExerciseInput}
                  onChange={(e) => setFavoriteExerciseInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFavoriteExercise();
                    }
                  }}
                  placeholder="e.g., Bench Press, Squats, Pull-ups"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={addFavoriteExercise}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>

              {formData.favoriteExercises && formData.favoriteExercises.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.favoriteExercises.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-sm"
                    >
                      <span className="text-green-800 dark:text-green-200">{exercise}</span>
                      <button
                        type="button"
                        onClick={() => removeFavoriteExercise(exercise)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Training Techniques */}
            <div>
              <label className="block text-sm font-medium mb-3">Training Techniques (Optional)</label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Select any specific training techniques you'd like to include
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { value: 'hiit', label: 'HIIT (High-Intensity Interval Training)', description: 'Short bursts of intense exercise' },
                  { value: 'circuit_training', label: 'Circuit Training', description: 'Series of exercises with minimal rest' },
                  { value: 'supersets', label: 'Supersets', description: 'Two exercises back-to-back' },
                  { value: 'dropsets', label: 'Drop Sets', description: 'Reduce weight and continue sets' },
                  { value: 'pyramid_sets', label: 'Pyramid Sets', description: 'Gradually increase/decrease weight' },
                  { value: 'tempo_training', label: 'Tempo Training', description: 'Controlled movement speed' },
                ].map((technique) => (
                  <div
                    key={technique.value}
                    onClick={() => toggleTechnique(technique.value as WorkoutTechnique)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.preferredTechniques?.includes(technique.value as WorkoutTechnique)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 ${
                        formData.preferredTechniques?.includes(technique.value as WorkoutTechnique)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.preferredTechniques?.includes(technique.value as WorkoutTechnique) && (
                          <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{technique.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{technique.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            {/* Spinner */}
            <div className="relative">
              <div className="w-24 h-24 border-8 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>

            {/* AI-themed message with animated ellipses */}
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                {loadingMessages[loadingMessageIndex]}
                <span className="inline-block w-[1.5em] text-left">
                  .<span className={loadingDots === '1' ? 'invisible' : ''}>.</span><span className={loadingDots !== '3' ? 'invisible' : ''}>.</span>
                </span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your personalized workout plan is being crafted
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[--card] border border-[--card-border] rounded h-full flex flex-col">
      {/* Profile Header */}
      <div className="px-6 pt-4 pb-3 border-b border-[--card-border]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentProfileName || 'New Profile'}
            </span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7" />
              </svg>
              Profiles
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 z-50 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <button
                    type="button"
                    onClick={handleNewProfile}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Profile
                  </button>

                  {currentProfileId && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveDialog(true);
                          setShowProfileMenu(false);
                          setSaveProfileName(currentProfileName);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveDialog(true);
                          setShowProfileMenu(false);
                          setSaveProfileName('');
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Save As New Profile
                      </button>
                    </>
                  )}

                  {savedProfiles.length > 0 && (
                    <>
                      <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1 font-medium">
                        Saved Profiles ({savedProfiles.length})
                      </div>
                      {savedProfiles.map(profile => (
                        <div
                          key={profile.id}
                          className={`flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            profile.id === currentProfileId ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleLoadProfile(profile)}
                            className="flex-1 text-left"
                          >
                            {profile.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteProfile(profile.id, e)}
                            className="ml-2 p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete profile"
                          >
                            <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="px-8 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${
                step === currentStep
                  ? 'bg-blue-600 text-white'
                  : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-1.5 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
          <span className="text-center" style={{width: '25%'}}>Basic</span>
          <span className="text-center" style={{width: '25%'}}>Fitness</span>
          <span className="text-center" style={{width: '25%'}}>Schedule</span>
          <span className="text-center" style={{width: '25%'}}>Preferences</span>
        </div>
      </div>

      {/* Form content - scrollable if needed */}
      <div className="px-8 flex-1 overflow-y-auto">
        {renderStepContent()}
      </div>

      {/* Navigation buttons - hide on step 5 (loading) */}
      {currentStep < 5 && (
        <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 btn btn-primary font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {currentStep === 4
                ? 'Craft My Workout Plan'
                : 'Next'}
            </button>
          </div>
        </div>
      )}

      {/* Save Profile Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {currentProfileId && saveProfileName === currentProfileName ? 'Save Changes' : 'Save Profile'}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Profile Name</label>
              <input
                type="text"
                value={saveProfileName}
                onChange={(e) => {
                  setSaveProfileName(e.target.value);
                  setSaveError('');
                }}
                placeholder="e.g., My Workout Profile"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                autoFocus
              />
              {saveError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{saveError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveProfileName('');
                  setSaveError('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {currentProfileId ? 'Cancel' : 'Skip'}
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save & Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
// Test