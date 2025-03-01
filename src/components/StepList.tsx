"use client"

import { type Step, StepType } from "@/types/types"
import { SquareCheck, ChevronDown, ChevronUp, Loader2, } from "lucide-react"
import { Button } from "./ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface StepsListProps {
    StepTitle: string
    steps: Step[]
    building?: boolean
    maxHeight?: string
}

export function StepList({ StepTitle, steps, building, maxHeight = "400px" }: StepsListProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="w-full p-3">
            <div className="w-full p-4 rounded-lg border border-zinc-800 bg-black/30 shadow-lg">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-200">{StepTitle}</h3>
                        <div className="flex items-center gap-2"> {building ? (
                            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
                                <Loader2 size={18} className="animate-spin" />
                                <span className="text-sm font-medium">Building...</span>
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-md shadow-primary/20"></span>
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-black/40 text-zinc-500">
                                <span className="text-sm font-medium">Completed</span>
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-md shadow-green-500/20"></span>
                            </div>
                        )}
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-200 hover:bg-gray-800/50">
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                    <CollapsibleContent>
                        <div className={cn(
                            "mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1",
                            maxHeight && `max-h-[${maxHeight}]`,
                        )}
                            style={{ maxHeight }}
                        >
                            <ul className="flex flex-col gap-2 scrollbar-hide"> {steps.map((step) => (
                                <li key={step.id + Math.random()} className="w-full scrollbar-hide">
                                    <div
                                        className={cn(
                                            "w-full p-3 rounded-md transition-colors duration-200 scrollbar-hide",
                                            step.type === StepType.RunScript
                                                ? "bg-gray-800/30 hover:bg-gray-800/50"
                                                : "hover:bg-gray-800/20",
                                        )}
                                    >
                                        <div className="flex items-start gap-3 w-full"> {step.type !== 1 && (
                                            <div className="flex-shrink-0 mt-0.5">
                                                {step.status === "completed" && <SquareCheck size={22} className="text-green-300" />}
                                                {step.status === "pending" && <SquareCheck size={22} className="text-gray-400" />}
                                                {step.status === "in-progress" && (
                                                    <div className="relative">
                                                        <Loader2 size={22} className="text-blue-400 animate-spin" />
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                            <div className="flex flex-col gap-1 w-full overflow-hidden my-auto">
                                                {step.type === 1 ? (
                                                    <h4 className="text-gray-100 font-bold text-base border-b mx-auto">{step.title}</h4>
                                                ) : (
                                                    <span className="text-sm text-gray-400 my-auto">{step.title}</span>
                                                )}

                                                {step.type === StepType.RunScript && step.code && (
                                                    <div className="bg-gray-900 text-white p-2 rounded-md mt-2 w-full border border-gray-700">
                                                        <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                                            <pre className="overflow-x-auto text-xs whitespace-pre-wrap break-all">
                                                                <code>{step.code}</code>
                                                            </pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>
    )
}

