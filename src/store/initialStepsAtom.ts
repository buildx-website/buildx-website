import { Step } from "@/types/types";
import { atom } from "recoil";

export const initialStepsAtom = atom<Step[]>({
    key: "initialStepsAtom",
    default: [],
})