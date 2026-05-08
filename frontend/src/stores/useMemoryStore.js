/**
 * Persistent store for maintaining UI state across navigation.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


export const useMemoryStore = create(
    persist(
        (set) => ({

            exercisesSearch: '',
            exercisesCategory: null,
            exercisesBodyPart: null,
            exercisesEquipment: null,
            exercisesPage: 1,
            
            setExercisesSearch: (val) => set({ exercisesSearch: val }),
            setExercisesCategory: (val) => set({ exercisesCategory: val }),
            setExercisesBodyPart: (val) => set({ exercisesBodyPart: val }),
            setExercisesEquipment: (val) => set({ exercisesEquipment: val }),
            setExercisesPage: (val) => set((state) => ({
                exercisesPage: typeof val === 'function' ? val(state.exercisesPage) : val
            })),
            
            resetExercisesFilters: () => set({ 
                exercisesSearch: '', 
                exercisesCategory: null, 
                exercisesBodyPart: null, 
                exercisesEquipment: null,
                exercisesPage: 1
            }),


            progressScrollPos: 0,
            progressIsMeasurementsOpen: false,
            progressSelectedUploadPose: 'front',
            
            setProgressScrollPos: (val) => set({ progressScrollPos: val }),
            setProgressIsMeasurementsOpen: (val) => set({ progressIsMeasurementsOpen: val }),
            setProgressSelectedUploadPose: (val) => set({ progressSelectedUploadPose: val }),
        }),
        {
            name: 'musclo-memory-store',
            partialize: (state) => ({
                exercisesSearch: state.exercisesSearch,
                exercisesCategory: state.exercisesCategory,
                exercisesBodyPart: state.exercisesBodyPart,
                exercisesEquipment: state.exercisesEquipment,
            }),
        }
    )
);
