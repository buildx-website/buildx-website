import { Step } from "@/types/types";
import { create } from "zustand";

interface StepsState {
    steps: Step[];
    setSteps: (steps: Step[]) => void;
    addSteps: (steps: Step[]) => void;
    clearSteps: () => void;
}

export const useStepsStore = create<StepsState>((set) => ({
    steps: [],
    setSteps: (steps) => set({ steps }),
    addSteps: (steps) => set((state) => ({ steps: [...state.steps, ...steps] })),
    clearSteps: () => set({ steps: [] }),
}));