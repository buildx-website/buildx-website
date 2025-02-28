import { Step } from "@/types/types";
import { BadgeCheck, CheckCheck } from "lucide-react";
import { Button } from "./ui/button";

interface StepsListProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
}

export function StepList({ steps, currentStep, onStepClick }: StepsListProps) {
    return (
        <div className="w-full p-3 min-w-full">
            <div className="w-full p-4 text-lg rounded-lg resize-none border border-gray-900 bg-[#1e1e1e] backdrop-blur-sm shadow-primary/10  font-mono">

                <h3 className="text-lg font-bold text-primary">Build Steps</h3>
                <ul className="flex flex-col gap-2 mt-2">
                    {steps.map((step) => (
                        <Button key={step.id} className="gap-2 text-left my-auto justify-start" variant={'ghost'} size={'lg'} onClick={() => onStepClick(step.id)}>
                            {step.type === 0 ? <BadgeCheck size={32} className="text-primary" /> : null}
                            {step.type === 1 ?
                                <span className="text-sm text-white font-bold">{step.title}</span>
                                : <span className="text-sm text-gray-300">{step.title}</span>}
                        </Button>
                    ))}
                </ul>
            </div>
        </div>
    )
}