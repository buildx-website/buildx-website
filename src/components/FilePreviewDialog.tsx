import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Editor } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

interface FilePreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    content: string;
    isBuilding?: boolean;
}

export function FilePreviewDialog({ isOpen, onClose, fileName, content, isBuilding = false }: FilePreviewDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="text-sm font-medium text-primary/70 flex items-center gap-2">
                        {fileName}
                        {isBuilding && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                    <Editor
                        height="100%"
                        defaultLanguage="typescript"
                        value={content || "Loading..."}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            lineNumbers: "on",
                            wordWrap: "on",
                            automaticLayout: true,
                        }}
                        theme="vs-dark"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
} 