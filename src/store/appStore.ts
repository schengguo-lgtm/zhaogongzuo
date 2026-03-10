/**
 * App-level store — language selection, map state, view mode.
 */

import { create } from 'zustand';
import type { Language } from '../types';

type MapViewMode = 'map' | 'list';

interface AppState {
  language: Language;
  mapViewMode: MapViewMode;
  searchQuery: string;
  selectedJobTypes: string[];
  isFirstLaunch: boolean;

  setLanguage: (lang: Language) => void;
  setMapViewMode: (mode: MapViewMode) => void;
  setSearchQuery: (q: string) => void;
  toggleJobType: (jobType: string) => void;
  clearFilters: () => void;
  setIsFirstLaunch: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'ko',
  mapViewMode: 'map',
  searchQuery: '',
  selectedJobTypes: [],
  isFirstLaunch: true,

  setLanguage: (lang) => set({ language: lang }),
  setMapViewMode: (mode) => set({ mapViewMode: mode }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  toggleJobType: (jobType) =>
    set((state) => ({
      selectedJobTypes: state.selectedJobTypes.includes(jobType)
        ? state.selectedJobTypes.filter((t) => t !== jobType)
        : [...state.selectedJobTypes, jobType],
    })),

  clearFilters: () => set({ searchQuery: '', selectedJobTypes: [] }),

  setIsFirstLaunch: (v) => set({ isFirstLaunch: v }),
}));
