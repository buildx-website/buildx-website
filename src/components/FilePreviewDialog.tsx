import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Editor, useMonaco } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface FilePreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    fileName: string;
    content: string;
    isBuilding?: boolean;
}

export function FilePreviewDialog({ isOpen, onClose, fileName, content, isBuilding = false }: FilePreviewDialogProps) {
    const [themeReady, setThemeReady] = useState(false);
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            monaco.editor.defineTheme("premium-dark", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "comment", foreground: "6A9955", fontStyle: "italic" },
                    { token: "keyword", foreground: "C586C0" },
                    { token: "string", foreground: "CE9178" },
                    { token: "number", foreground: "B5CEA8" },
                    { token: "regexp", foreground: "D16969" },
                    { token: "type", foreground: "4EC9B0" },
                    { token: "class", foreground: "4EC9B0" },
                    { token: "function", foreground: "DCDCAA" },
                    { token: "variable", foreground: "9CDCFE" },
                    { token: "variable.predefined", foreground: "4FC1FF" },
                    { token: "interface", foreground: "4EC9B0" },
                    { token: "namespace", foreground: "4EC9B0" },
                ],
                colors: {
                    "editor.background": "#101010",
                    "editor.foreground": "#D4D4D4",
                    "editorCursor.foreground": "#AEAFAD",
                    "editor.lineHighlightBackground": "#2D2D30",
                    "editorLineNumber.foreground": "#858585",
                    "editor.selectionBackground": "#264F78",
                    "editor.inactiveSelectionBackground": "#3A3D41",
                    "editorIndentGuide.background": "#404040",
                },
            });

            // Set default theme
            monaco.editor.setTheme("premium-dark");
            setThemeReady(true);
        }
    }, [monaco]);

    if (!themeReady) {
        return null;
    }

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
                        theme="premium-dark"
                        options={{
                            readOnly: true,
                            minimap: { enabled: true, scale: 0.75, showSlider: "mouseover" },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                            fontLigatures: true,
                            lineNumbers: "on",
                            automaticLayout: true,
                            bracketPairColorization: { enabled: true },
                            guides: { bracketPairs: true, indentation: true },
                            cursorBlinking: "smooth",
                            cursorSmoothCaretAnimation: "on",
                            smoothScrolling: true,
                            tabSize: 2,
                            wordWrap: "wordWrapColumn",
                            wordWrapColumn: 80,
                            wrappingIndent: "same",
                            formatOnPaste: true,
                            formatOnType: true,
                            suggestOnTriggerCharacters: true,
                            acceptSuggestionOnEnter: "on",
                            quickSuggestions: true,
                            padding: { top: 10 },
                            contextmenu: false,
                            folding: true,
                            lineDecorationsWidth: 0,
                            lineNumbersMinChars: 3,
                            overviewRulerBorder: false,
                            overviewRulerLanes: 0,
                            hideCursorInOverviewRuler: true,
                            scrollbar: {
                                vertical: 'visible',
                                horizontal: 'visible',
                                useShadows: false,
                                verticalScrollbarSize: 10,
                                horizontalScrollbarSize: 10,
                                verticalSliderSize: 6,
                                horizontalSliderSize: 6
                            },
                            renderValidationDecorations: "off",
                            renderWhitespace: "none",
                            renderControlCharacters: false,
                            renderLineHighlight: "none",
                            largeFileOptimizations: true,
                            maxTokenizationLineLength: 20000,
                            mouseWheelZoom: false,
                            scrollBeyondLastLine: false,
                            fixedOverflowWidgets: true,
                            domReadOnly: true,
                            ariaLabel: "File preview"
                        }}
                        beforeMount={(monaco) => {
                            // Configure formatter
                            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                                noSemanticValidation: true,
                                noSyntaxValidation: true,
                            });
                            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                                target: monaco.languages.typescript.ScriptTarget.ESNext,
                                allowNonTsExtensions: true,
                                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                                module: monaco.languages.typescript.ModuleKind.ESNext,
                                noEmit: true,
                                esModuleInterop: true,
                                jsx: monaco.languages.typescript.JsxEmit.React,
                                reactNamespace: "React",
                                allowJs: true,
                                typeRoots: ["node_modules/@types"],
                            });
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
} 