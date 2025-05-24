import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FaArrowUp, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { MinimalFileExplorer } from "./minimal-file-explorer";
import { FileContent, FileType } from "@/types/types";
import { fetchFileContent, getFileTree } from "@/lib/worker-config";

interface SendPromptProps {
    handleSubmit: () => void;
    prompt: string;
    setPrompt: (value: string) => void;
    disabled?: boolean;
    model: string | null;
    onModelChange: (modelId: string) => void;
    allModels: { id: string, name: string, displayName: string }[];
    containerId: string;
    setSelectedFileText: (value: FileContent | null) => void;
    setSelectedFile: (value: FileType | null) => void;
    selectedFile: FileType | null;
}

export function SendPrompt({
    handleSubmit,
    prompt,
    setPrompt,
    disabled,
    model,
    onModelChange,
    allModels,
    containerId,
    setSelectedFile,
    selectedFile,
    setSelectedFileText
}: SendPromptProps) {

    const [files, setFiles] = useState<FileType[]>([]);

    useEffect(() => {
        loadFileTree();
    }, [containerId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const loadFileTree = async () => {
        try {
            const response = await getFileTree(containerId, "/app");
            if (response && response.files) {
                const processedFiles = processFileStructure(response.files, "/app");
                setFiles(processedFiles);
            }
        } catch (error) {
            console.error("Error fetching file tree:", error);
        }
    };

    const processFileStructure = (fileList: string[], basePath: string): FileType[] => {
        const validFiles = fileList.filter((file) => file.trim() !== "");
        return validFiles
            .map((filename) => {
                const isDirectory = !filename.includes(".");
                const path = basePath === "/" 
                    ? `/${filename}` 
                    : `${basePath}/${filename}`.replace(/\/+/g, '/');
                return {
                    name: filename,
                    path: path,
                    type: isDirectory ? ("directory" as const) : ("file" as const),
                    isOpen: false,
                    children: isDirectory ? [] : undefined,
                };
            })
            .sort((a, b) => {
                if (a.type === "directory" && b.type === "file") return -1;
                if (a.type === "file" && b.type === "directory") return 1;
                return a.name.localeCompare(b.name);
            });
    };

    const handleFileSelect = (file: FileType) => {
        if (file.type === "file") {
            setSelectedFile(file);
            getFileText(file.path);
            setPrompt(prompt.replace(/\n@.*$/, '') + `\n@${file.path}`);
        }
    };

    async function getFileText(filePath: string) {
        const response = await fetchFileContent(containerId, filePath);
        if (response && response.fileContent) {
            setSelectedFileText(response);
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
            <div className="flex gap-2 justify-between absolute bottom-1 w-full px-4 p-2">
                <div className="w-[80px]">
                    <MinimalFileExplorer
                        files={files}
                        onFileSelect={handleFileSelect}
                        onToggleDirectory={async (file) => {
                            if (file.type === "directory" && !file.isOpen) {
                                try {
                                    const response = await getFileTree(containerId, file.path);
                                    if (response && response.files) {
                                        const children = processFileStructure(response.files, file.path);
                                        setFiles(prevFiles => {
                                            const updateFileInTree = (files: FileType[]): FileType[] => {
                                                return files.map(f => {
                                                    if (f.path === file.path) {
                                                        return { ...f, children, isOpen: true };
                                                    }
                                                    if (f.type === "directory" && f.children) {
                                                        return { ...f, children: updateFileInTree(f.children) };
                                                    }
                                                    return f;
                                                });
                                            };
                                            return updateFileInTree(prevFiles);
                                        });
                                    }
                                } catch (error) {
                                    console.error("Error fetching directory contents:", error);
                                }
                            } else {
                                setFiles(prevFiles => {
                                    const updateFileInTree = (files: FileType[]): FileType[] => {
                                        return files.map(f => {
                                            if (f.path === file.path) {
                                                return { ...f, isOpen: !f.isOpen };
                                            }
                                            if (f.type === "directory" && f.children) {
                                                return { ...f, children: updateFileInTree(f.children) };
                                            }
                                            return f;
                                        });
                                    };
                                    return updateFileInTree(prevFiles);
                                });
                            }
                        }}
                        selectedFile={selectedFile}
                        placeholder="@"
                        reloadFileTree={loadFileTree}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Select value={model || ""} onValueChange={onModelChange}>
                        <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Model" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900">
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
                        className="h-7 px-2"
                        variant="ghost"
                    >
                        <FaArrowUp className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {selectedFile && (
                <div className="absolute top-0 right-0 p-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded text-xs">
                        <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => {
                                setSelectedFile(null);
                                setPrompt(prompt.replace(`\n@${selectedFile.path}`, ''));
                            }}
                        >
                            <FaTimes className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
