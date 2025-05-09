import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ArrowUp } from "lucide-react";

export function SendPrompt({
    handleSubmit,
    prompt,
    setPrompt,
    disabled,
    model,
    onModelChange,
    allModels
}: {
    handleSubmit: () => void;
    prompt: string;
    setPrompt: (value: string) => void;
    disabled?: boolean;
    model: string | null;
    onModelChange: (modelId: string) => void;
    allModels: { id: string, name: string, displayName: string }[];
}) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="relative w-full">
            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-40 p-4 text-lg rounded-lg resize-none border border-zinc-900 bg-black/30 backdrop-blur-sm shadow-inner shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono pr-32"
                placeholder="Write your idea here..."
                disabled={disabled}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Select value={model || ""} onValueChange={onModelChange}>
                    <SelectTrigger className="h-8 w-[120px] bg-black/50 border-zinc-800 text-xs">
                        <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        {allModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {model.displayName}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button
                    onClick={handleSubmit}
                    size="sm"
                >
                    <ArrowUp className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
