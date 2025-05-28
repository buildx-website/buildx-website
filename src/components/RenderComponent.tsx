import { useEffect, useState, useRef } from "react";
import { FileType } from "@/types/types";
import { fetchFileContent, streamExac } from "@/lib/worker-config";
import { Button } from "./ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Loader2 } from "lucide-react";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface RenderComponentProps {
    containerId: string;
    activeFile: FileType | null;
    setVideoPath: (path: string) => void;
}

export function RenderComponent({ containerId, activeFile, setVideoPath }: RenderComponentProps) {
    const [availableScenes, setAvailableScenes] = useState<string[]>([]);
    const [selectedSceneName, setSelectedSceneName] = useState<string>("");
    const [isLoadingScenes, setIsLoadingScenes] = useState(false);
    const [isRendering, setIsRendering] = useState(false);
    const [cmdOutput, setCmdOutput] = useState<string>("");
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const fitAddon = useRef<FitAddon | null>(null);

    const renderCmd = (activeFile: FileType, selectedSceneName: string) => {
        return `manim -p ${activeFile.path} ${selectedSceneName} -q m --fps 60 --progress_bar display`;
    };

    async function getDataFromOutput() {
        if (cmdOutput.includes("Process exited with code 0")) {
            let filePath = cmdOutput.split("Previewed File at: ")[1].split("'")[1];
            filePath = filePath.replace(/\s+/g, "");
            const match = filePath.match(/\/app.*$/);
            const cleanPath = match ? match[0] : null;
            console.log("cleanPath", cleanPath);
            setVideoPath(cleanPath!);
        }
    }

    useEffect(() => {
        getDataFromOutput();
    }, [cmdOutput]);

    useEffect(() => {
        if (!terminalRef.current || terminalInstance.current) return;

        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            theme: {
                background: '#1a1a1a',
                foreground: '#d4d4d4'
            },
            rows: 24,
            cols: 80,
            scrollback: 1000,
            convertEol: true
        });

        const fit = new FitAddon();
        terminal.loadAddon(fit);
        terminal.open(terminalRef.current);
        
        terminalInstance.current = terminal;
        fitAddon.current = fit;

        const fitTimeoutId = setTimeout(() => {
            fit.fit();
        }, 100);

        return () => {
            clearTimeout(fitTimeoutId);
            terminal.dispose();
            terminalInstance.current = null;
            fitAddon.current = null;
        };
    }, [activeFile]);

    useEffect(() => {
        const handleResize = () => {
            if (fitAddon.current) {
                setTimeout(() => {
                    fitAddon.current?.fit();
                }, 100);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!activeFile || !activeFile.name.endsWith(".py") || !containerId) {
            setAvailableScenes([]);
            setSelectedSceneName("");
            return;
        }

        const loadScenes = async () => {
            setIsLoadingScenes(true);
            try {
                const fileContentData = await fetchFileContent(containerId, activeFile.path);
                if (fileContentData?.success && fileContentData.fileContent) {
                    const sceneRegex = /class\s+(\w+)\(Scene\):/g;
                    const matches = [...fileContentData.fileContent.matchAll(sceneRegex)];
                    const scenes = matches.map(match => match[1]);
                    
                    setAvailableScenes(scenes);
                    setSelectedSceneName(scenes.length > 0 ? scenes[0] : "");
                } else {
                    setAvailableScenes([]);
                    setSelectedSceneName("");
                }
            } catch (error) {
                console.error("Error loading scenes:", error);
                setAvailableScenes([]);
                setSelectedSceneName("");
            } finally {
                setIsLoadingScenes(false);
            }
        };

        loadScenes();
    }, [activeFile, containerId]);

    const handleRender = async () => {
        if (!activeFile || !selectedSceneName || !terminalInstance.current) return;

        setIsRendering(true);
        const cmd = renderCmd(activeFile, selectedSceneName);
        
        terminalInstance.current.clear();
        terminalInstance.current.write('\r\n$ ' + cmd + '\r\n');

        try {
            await streamExac(containerId, cmd, "/app", (data) => {
                setCmdOutput(prev => prev + data);
                terminalInstance.current?.write(data);
            });
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            terminalInstance.current.write('\r\nError: ' + errorMsg + '\r\n');
            console.error("Render error:", error);
        } finally {
            setIsRendering(false);
            getDataFromOutput();
        }
        getDataFromOutput();
    };

    if (!activeFile || !activeFile.name.endsWith(".py")) {
        return (
            <div className="p-4 text-sm text-gray-400">
                Select a Python (.py) file to see Manim render options.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full border-t border-zinc-800">
            <div className="flex items-center space-x-2 p-2 border-b border-gray-700">
                {isLoadingScenes ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                ) : availableScenes.length > 0 ? (
                    <Select value={selectedSceneName} onValueChange={setSelectedSceneName}>
                        <SelectTrigger className="w-full text-xs bg-[#3C3C3C] text-white">
                            <SelectValue placeholder="Select a scene" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#3C3C3C] text-white">
                            {availableScenes.map(scene => (
                                <SelectItem key={scene} value={scene} className="text-xs">
                                    {scene}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <span className="text-xs text-gray-400">
                        No scenes found in {activeFile.name}
                    </span>
                )}
                <Button
                    size="sm"
                    onClick={handleRender}
                    disabled={!selectedSceneName || isRendering || isLoadingScenes}
                    className="flex items-center"
                >
                    {isRendering ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Rendering...
                        </>
                    ) : (
                        'Render'
                    )}
                </Button>
            </div>

            <div className="flex-1 bg-black/20 rounded p-2 min-h-0">
                <div ref={terminalRef} className="h-full w-full" />
            </div>
        </div>
    );
}