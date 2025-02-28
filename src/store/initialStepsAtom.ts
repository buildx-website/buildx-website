import { StepsState } from "@/types/types";
import { create } from "zustand";

export const useStepsStore = create<StepsState>((set) => ({
    steps: [],
    setSteps: (steps) => set({ steps }),
    addStep: (step) => set((state) => ({
        steps: [...state.steps, step]
    })),
    clearSteps: () => set({ steps: [] }),
}));