import { Step } from "@/types/types";
import { create } from "zustand";

interface StepsState {
    steps: Step[];
    setSteps: (steps: Step[]) => void;
    addSteps: (steps: Step[]) => void;
    updateStep: (step: Step) => void;
    clearSteps: () => void;
}

export const useStepsStore = create<StepsState>((set) => ({
    steps: [],
    setSteps: (steps) => set({ steps }),
    addSteps: (steps) => set((state) => ({ steps: [...state.steps, ...steps] })),
    updateStep: (step) => set((state) => ({
        steps: state.steps.map((s) => (s.id === step.id ? { ...s, ...step } : s)),
    })),
    clearSteps: () => set({ steps: [] }),
}));