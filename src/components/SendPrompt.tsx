import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export function SendPrompt({
    handleSubmit,
    prompt,
    setPrompt,
    disabled
}: {
    handleSubmit: () => void;
    prompt: string;
    setPrompt: (value: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="relative w-full">
            <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-40 p-4 text-lg rounded-lg resize-none border border-gray-700 bg-black/30 backdrop-blur-sm shadow-inner shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono pr-12"
                placeholder="Write your idea here..."
                disabled={disabled}
            />
            <Button
                onClick={handleSubmit}
                size="sm"
                className="absolute bottom-3 right-3 text-sm h-8 px-3 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
            >
                Send
            </Button>
        </div>
    );
}
