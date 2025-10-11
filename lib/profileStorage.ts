import type { UserProfile } from '@/types/workout';

export interface SavedProfile {
  id: string;
  name: string;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'workout_profiles';
const ACTIVE_PROFILE_KEY = 'active_workout_profile';

export const profileStorage = {
  // Get all saved profiles
  getAll(): SavedProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading profiles from localStorage:', error);
      return [];
    }
  },

  // Get a profile by ID
  getById(id: string): SavedProfile | null {
    const profiles = this.getAll();
    return profiles.find(p => p.id === id) || null;
  },

  // Save a new profile or update existing
  save(name: string, profile: UserProfile, id?: string): SavedProfile {
    const profiles = this.getAll();
    const now = new Date().toISOString();

    if (id) {
      // Update existing profile
      const index = profiles.findIndex(p => p.id === id);
      if (index !== -1) {
        profiles[index] = {
          ...profiles[index],
          name,
          profile,
          updatedAt: now,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        return profiles[index];
      }
    }

    // Create new profile
    const newProfile: SavedProfile = {
      id: id || crypto.randomUUID(),
      name,
      profile,
      createdAt: now,
      updatedAt: now,
    };

    profiles.push(newProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return newProfile;
  },

  // Delete a profile
  delete(id: string): boolean {
    const profiles = this.getAll();
    const filtered = profiles.filter(p => p.id !== id);

    if (filtered.length === profiles.length) {
      return false; // Profile not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // Clear active profile if it was deleted
    if (this.getActiveProfileId() === id) {
      this.setActiveProfileId(null);
    }

    return true;
  },

  // Get active profile ID
  getActiveProfileId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  },

  // Set active profile ID
  setActiveProfileId(id: string | null): void {
    if (typeof window === 'undefined') return;
    if (id) {
      localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_PROFILE_KEY);
    }
  },

  // Get active profile
  getActiveProfile(): SavedProfile | null {
    const id = this.getActiveProfileId();
    return id ? this.getById(id) : null;
  },

  // Check if profile name exists (case-insensitive)
  nameExists(name: string, excludeId?: string): boolean {
    const profiles = this.getAll();
    return profiles.some(
      p => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId
    );
  },
};
