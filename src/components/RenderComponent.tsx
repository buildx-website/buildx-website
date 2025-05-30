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
import { FileCode, Loader2, Play } from "lucide-react";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { toast } from "sonner";

interface RenderComponentProps {
  containerId: string;
  activeFile: FileType | null;
  setVideoPath: (path: string) => void;
  setPrompt: (prompt: string) => void;
}

export function RenderComponent({ containerId, activeFile, setVideoPath, setPrompt }: RenderComponentProps) {
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
      const parts = cmdOutput.split("Previewed File at: ");
      if (parts.length > 1) {
        const pathParts = parts[1].split("'");
        if (pathParts.length > 1) {
          let filePath = pathParts[1];
          filePath = filePath.replace(/\s+/g, "");
          const match = filePath.match(/\/app.*$/);
          const cleanPath = match ? match[0] : null;
          console.log("cleanPath", cleanPath);
          if (cleanPath) {
            setVideoPath(cleanPath);
          }
        } else {
          console.warn("Could not extract file path: single quote delimiter not found.");
        }
      } else {
        console.warn("Could not extract file path: 'Previewed File at: ' not found.");
      }
    } else if (cmdOutput.includes("Process exited with code 1")) {
      toast.error("Could not render scene: 'Process exited with code 1' not found.", {
        duration: 30000,
        action: {
          label: "Fix using AI",
          onClick: () => {
            setPrompt(`Hey I'm having an issue with my render step.\nCan you help me fix it?\nHere is the error:\n${cmdOutput}`)
          }
        }
      });
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
    setCmdOutput("");
    console.log("[handleRender] Clicked. States:", {
      activeFile: !!activeFile,
      selectedSceneName,
      isRendering,
      isLoadingScenes,
      terminalInstance: !!terminalInstance.current
    });

    if (!activeFile || !selectedSceneName || !terminalInstance.current) {
      console.warn("[handleRender] Aborting due to missing prereqs.", {
        activeFile: !!activeFile,
        selectedSceneName,
        terminalInstance: !!terminalInstance.current
      });
      return;
    }

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
      terminalInstance.current?.write('\r\nError: ' + errorMsg + '\r\n');
      console.error("Render error:", error);
    } finally {
      setIsRendering(false);
    }
  };


  if (!activeFile || !activeFile.name.endsWith(".py")) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400 bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 rounded-md">
        <FileCode className="w-10 h-10 mb-4 opacity-60 text-white" />
        <p className="text-center text-md font-medium">Select a Python (.py) file to see Manim render options.</p>
      </div>
    )
  }

  const hasOutput = cmdOutput.length > 0

  return (
    <div className="flex flex-col h-full border-t border-zinc-800 bg-zinc-950">
      {/* Main Controls Section */}
      <div className={`transition-all duration-500 ${hasOutput ? 'p-3' : 'p-8'}`}>
        <div className={`${hasOutput ? 'bg-zinc-900 border border-zinc-800 rounded-lg p-4' : 'bg-gradient-to-r from-zinc-900/40 via-zinc-800/60 to-zinc-900/40 border border-zinc-700/50 rounded-xl p-6 shadow-2xl'}`}>
          {!hasOutput && (
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Manim Scene Renderer</h2>
              <p className="text-zinc-400 text-sm">Select a scene and render your mathematical animation</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className={`text-sm font-medium ${hasOutput ? 'text-zinc-400' : 'text-white'}`}>
                Scene:
              </div>
              {isLoadingScenes ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                    <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-white/20"></div>
                  </div>
                  <span className="text-sm text-zinc-400">Discovering scenes...</span>
                </div>
              ) : availableScenes.length > 0 ? (
                <Select value={selectedSceneName} onValueChange={setSelectedSceneName}>
                  <SelectTrigger className={`${hasOutput ? 'h-9 min-w-[200px]' : 'h-12 min-w-[280px]'} text-sm bg-zinc-800/80 border-zinc-600 focus:ring-2 focus:ring-white/20 focus:border-white/40 transition-all duration-200 backdrop-blur-sm`}>
                    <SelectValue placeholder="Choose your scene" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800/95 border-zinc-600 backdrop-blur-md">
                    {availableScenes.map((scene) => (
                      <SelectItem
                        key={scene}
                        value={scene}
                        className="text-sm focus:bg-white/10 focus:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                          {scene}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
                  <span className="text-sm italic">No scenes found in {activeFile.name}</span>
                </div>
              )}
            </div>

            <Button
              size={hasOutput ? "sm" : "lg"}
              onClick={handleRender}
              disabled={!selectedSceneName || isRendering || isLoadingScenes}
              className={`${hasOutput ? 'h-9 px-4' : 'h-14 px-8 text-lg'} ${isRendering
                  ? "bg-zinc-700 hover:bg-zinc-600 shadow-lg shadow-black/25"
                  : "bg-white text-black hover:bg-zinc-200 shadow-lg shadow-black/25"
                } transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:bg-zinc-800 disabled:text-zinc-500`}
            >
              {isRendering ? (
                <>
                  <div className="relative mr-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                  Rendering...
                </>
              ) : (
                <>
                  <Play className={`${hasOutput ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                  {hasOutput ? 'Render' : 'Render Scene'}
                </>
              )}
            </Button>
          </div>

          {!hasOutput && selectedSceneName && (
            <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
              <div className="text-xs text-zinc-400 mb-1">Ready to render:</div>
              <div className="text-sm text-white font-mono">{selectedSceneName}</div>
            </div>
          )}
        </div>
      </div>

      {/* Terminal Output - Compact when present */}
      {true && (
        <div className="px-3 pb-3">
          <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="px-3 py-2 bg-zinc-800/80 border-b border-zinc-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-zinc-500"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                  <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                </div>
              </div>
            </div>
            <div className="h-48">
              <div ref={terminalRef} className="h-full w-full" />
            </div>
          </div>
        </div>
      )}

      {/* Status Footer */}
      <div className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-800 bg-zinc-900/80 mt-auto">
        {isRendering ? (
          <div className="flex items-center">
            <div className="relative mr-2">
              <Loader2 className="h-3 w-3 animate-spin text-white" />
              <div className="absolute inset-0 h-3 w-3 animate-ping rounded-full bg-white/20"></div>
            </div>
            <span>Rendering animation with Manim...</span>
          </div>
        ) : cmdOutput.includes("Process exited with code 0") ? (
          <div className="flex items-center text-white">
            <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
            Render completed successfully
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-white mr-2"></div>
            Ready to render {selectedSceneName || "scene"}
          </div>
        )}
      </div>
    </div>
  )
}
