import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Persistent store to keep UI state in memory across navigation.
// This makes the app feel "instant" as filters and search terms are preserved.
export const useMemoryStore = create(
    persist(
        (set) => ({
            // Exercises Page State
            exercisesSearch: '',
            exercisesCategory: null,
            exercisesBodyPart: null,
            exercisesEquipment: null,
            exercisesPage: 1,
            
            setExercisesSearch: (val) => set({ exercisesSearch: val }),
            setExercisesCategory: (val) => set({ exercisesCategory: val }),
            setExercisesBodyPart: (val) => set({ exercisesBodyPart: val }),
            setExercisesEquipment: (val) => set({ exercisesEquipment: val }),
            setExercisesPage: (val) => set({ exercisesPage: val }),
            
            resetExercisesFilters: () => set({ 
                exercisesSearch: '', 
                exercisesCategory: null, 
                exercisesBodyPart: null, 
                exercisesEquipment: null,
                exercisesPage: 1
            }),

            // Progress Page State
            progressScrollPos: 0,
            progressIsMeasurementsOpen: false,
            progressSelectedUploadPose: 'front',
            
            setProgressScrollPos: (val) => set({ progressScrollPos: val }),
            setProgressIsMeasurementsOpen: (val) => set({ progressIsMeasurementsOpen: val }),
            setProgressSelectedUploadPose: (val) => set({ progressSelectedUploadPose: val }),
        }),
        {
            name: 'musclo-memory-store', // stored in localStorage
            partialize: (state) => ({
                exercisesSearch: state.exercisesSearch,
                exercisesCategory: state.exercisesCategory,
                exercisesBodyPart: state.exercisesBodyPart,
                exercisesEquipment: state.exercisesEquipment,
            }),
        }
    )
);
