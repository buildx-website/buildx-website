import { Step, StepType } from "@/types/types";
import { CircleCheckBig, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { useState } from "react";

interface StepsListProps {
    StepTitle: string;
    steps: Step[];
    currentStep: number;
}

export function StepList({ StepTitle, steps, currentStep }: StepsListProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="w-full p-3">
            <div className="w-full p-4 rounded-lg border border-zinc-800 bg-black/30 shadow-lg">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-200">{StepTitle}</h3>
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-200"
                            >
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent>
                        <ul className="flex flex-col gap-2 mt-2">
                            {steps.map((step) => (
                                <li key={step.id} className="w-full">
                                    <Button
                                        className="w-full text-left justify-start hover:bg-gray-800 transition-colors duration-200 h-auto py-3"
                                        variant="ghost"
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {step.status === "completed" && <CircleCheckBig size={22} className="text-green-300" />}
                                                {step.status === "pending" && <CircleCheckBig size={22} className="text-gray-400" />}
                                                {step.status === "in-progress" && <Loader size={22} className="text-gray-400 animate-spin" />}
                                            </div>

                                            <div className="flex flex-col gap-1 w-full overflow-hidden">
                                                <span className={`text-sm ${(step.type === 1) || (step.id === currentStep) ? "text-gray-200 font-semibold" : "text-gray-400"}`}>
                                                    {step.title}
                                                </span>
                                                {step.type === StepType.RunScript && step.code && (
                                                    <div className="bg-gray-900 text-white p-2 rounded-md mt-1 w-full">
                                                        <pre className="overflow-x-auto text-xs whitespace-pre-wrap break-all">
                                                            <code>{step.code}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    );
}