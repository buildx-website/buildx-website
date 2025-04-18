
import { Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

export function ActionList({
    actionHistory,
    actionOpen,
    setActionOpen,
}: {
    actionHistory: { title: string; isComplete: boolean }[];
    actionOpen: boolean;
    setActionOpen: (open: boolean) => void;
}) {
    return <>
        <div className="mt-4 pt-4 border-t border-zinc-800/70">
            <Collapsible open={actionOpen} onOpenChange={setActionOpen}>
                <div className="flex items-center justify-between">
                    <CollapsibleTrigger asChild>
                        <Button size={'sm'} variant={'ghost'} className="font-heading text-sm  hover:underline">
                            Action History
                            {actionOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                    <div className="space-y-2">
                        {actionHistory.map((action, index) => (
                            <div key={index} className="flex items-center justify-between text-sm text-primary/50">
                                <div className="flex items-center gap-2">
                                    {action.isComplete ?
                                        <Check className="text-green-500" size={16} /> :
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                    }
                                    <span>{action.title}</span>
                                </div>
                                <span className="text-zinc-500 text-xs">
                                    {action.isComplete ? "Done" : "In progress"}
                                </span>
                            </div>
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    </>
}