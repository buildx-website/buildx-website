"use client"

import type React from "react"

import { type Step, StepType } from "@/types/types"
import { FaCheckSquare, FaChevronDown, FaChevronUp, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { Button } from "./ui/button"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ActionList } from "./ActionList"
import { FilePreviewDialog } from "./FilePreviewDialog"

interface StepsListProps {
    StepTitle: string | null
    steps: Step[]
    building?: boolean
    maxHeight?: string
    prompt?: string
    setPrompt: React.Dispatch<React.SetStateAction<string>>
    currentActionContent?: string | null
}

export function StepList({ StepTitle, steps, building = false, maxHeight = "400px", setPrompt, currentActionContent }: StepsListProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [actionOpen, setActionOpen] = useState(true)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [actionHistory, setActionHistory] = useState<Array<{ title: string; isComplete: boolean }>>([])
    const prevBuildingRef = useRef(building)
    const prevStepTitleRef = useRef(StepTitle)
    const [showFilePreview, setShowFilePreview] = useState(false)

    useEffect(() => {
        if (isOpen) setActionOpen(false)
    }, [isOpen])

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
    }, [steps])

    useEffect(() => {
        const failedStep = steps.find((step) => step.status === "failed")
        if (failedStep) {
            toast.error("Build Step Failed", {
                description: failedStep.title,
                action: {
                    label: "Ask AI for help",
                    onClick: () => {
                        setPrompt(
                            `Hey I'm having an issue with my build step: ${failedStep.title}\n\nCan you help me fix it?\nOnly fix this step and don't change anything else.\n\nHere is the code:\n ${failedStep.code}\n\nHere is the error:\n${failedStep.error}`,
                        )
                    },
                },
            })
        }
    }, [steps, setPrompt])

    useEffect(() => {
        if (building && !prevBuildingRef.current) {
            setActionHistory([])
        }

        if (StepTitle && building && StepTitle !== prevStepTitleRef.current) {
            setActionHistory((prev) => {
                const updatedHistory = prev.map((action) => {
                    if (action.title === prevStepTitleRef.current) {
                        return { ...action, isComplete: true }
                    }
                    return action
                })
                return updatedHistory
            })
            setActionHistory((prev) => [...prev, { title: StepTitle, isComplete: false }])
        }

        if (!building && prevBuildingRef.current) {
            setActionHistory((prev) => prev.map((action) => ({ ...action, isComplete: true })))
        }

        prevBuildingRef.current = building
        prevStepTitleRef.current = StepTitle
    }, [building, StepTitle])

    return (
        <div className="w-full p-3 font-heading">
            <div className="w-full p-4 rounded-lg border border-zinc-800 bg-black/30 shadow-lg">
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-200">{"Build Steps"}</h3>
                        <div className="flex items-center gap-2">
                            {building ? (
                                <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
                                    <FaSpinner size={18} className="animate-spin" />
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
                                    {isOpen ? <FaChevronUp size={20} /> : <FaChevronDown size={20} />}
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>

                    <CollapsibleContent>
                        <div
                            ref={scrollContainerRef}
                            className={cn(
                                "mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-1",
                                maxHeight && `max-h-[${maxHeight}]`,
                            )}
                            style={{ maxHeight }}
                        >
                            <ul className="flex flex-col gap-2 scrollbar-hide">
                                {steps.map((step) => (
                                    <li key={step.id + Math.random()} className="w-full scrollbar-hide">
                                        <div
                                            className={cn(
                                                "w-full p-3 rounded-md transition-colors duration-200 scrollbar-hide",
                                                step.type === StepType.RunScript
                                                    ? "bg-gray-800/30 hover:bg-gray-800/50"
                                                    : "hover:bg-gray-800/20",
                                            )}
                                        >
                                            <div className="flex items-start gap-3 w-full">
                                                {step.type !== 1 && (
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        {step.status === "completed" && <FaCheckSquare size={22} className="text-green-300" />}
                                                        {step.status === "pending" && <FaCheckSquare size={22} className="text-gray-400" />}
                                                        {step.status === "failed" && (
                                                            <div className="flex items-center gap-2">
                                                                <FaExclamationTriangle size={22} className="text-red-400" />
                                                            </div>
                                                        )}
                                                        {step.status === "in-progress" && (
                                                            <div className="relative">
                                                                <FaSpinner size={22} className="text-blue-400 animate-spin" />
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1 w-full overflow-hidden my-auto">
                                                    {step.type === 1 ? (
                                                        <h4 className="text-gray-100 font-bold text-base border-b border-gray-700/50 pb-1 mx-auto">
                                                            {step.title}
                                                        </h4>
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

                                                    {step.status === "failed" && (
                                                        <>
                                                            {step.error && (
                                                                <div className="bg-red-950/30 text-red-200 p-2 rounded-md mt-2 w-full border border-red-500/30 text-xs">
                                                                    <div className="max-h-[100px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-700 scrollbar-track-transparent">
                                                                        <pre className="whitespace-pre-wrap break-all">
                                                                            <code>{step.error}</code>
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-end gap-2 mt-2 items-end">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-gray-200 hover:bg-gray-800/50 border-red-500/30 hover:border-red-500/50 bg-red-500/10"
                                                                    onClick={() => {
                                                                        setPrompt(
                                                                            `Hey I'm having an issue with my build step: ${step.title}\n\nCan you help me fix it?\nOnly fix this step and don't change anything else.\n\nHere is the code:\n ${step.code}\n\nHere is the error:\n${step.error}`,
                                                                        )
                                                                    }}
                                                                >
                                                                    Fix using AI
                                                                </Button>
                                                            </div>
                                                        </>
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
                <ActionList 
                    actionHistory={actionHistory} 
                    actionOpen={actionOpen} 
                    setActionOpen={setActionOpen}
                    onActionClick={() => {
                        if (!building) return;
                        setShowFilePreview(true);
                    }}
                />
            </div>
            <FilePreviewDialog
                isOpen={showFilePreview}
                onClose={() => setShowFilePreview(false)}
                fileName={actionHistory[actionHistory.length - 1]?.title}
                content={currentActionContent || ""}
                isBuilding={building}
            />
        </div>
    )
}
