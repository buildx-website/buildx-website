"use client"
import { useEffect, useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { MdDashboard } from "react-icons/md"
import { getFileTree } from "@/lib/worker-config"
import { StepType, type FileType } from "@/types/types"
import TerminalComponent from "@/components/terminal"
import { useStepsStore } from "@/store/initialStepsAtom"
import { useStepHandler } from "@/hooks/useStepHandler"
import { RenderComponent } from "./RenderComponent"

interface EditorInterfaceProps {
  containerId: string;
  framework: string;
}

export function EditorInterface({ containerId, framework }: EditorInterfaceProps) {
  const { steps, updateStep } = useStepsStore();
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [startCmd, setStartCmd] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { handleStep } = useStepHandler(containerId, reloadFileTree);


  useEffect(() => {
    const processSteps = async () => {
      if (isProcessing) return;

      const pendingSteps = steps.filter(step => step.status === "pending");
      console.log("pendingSteps", pendingSteps);
      if (pendingSteps.length === 0) return;

      setIsProcessing(true);

      try {
        for (const step of pendingSteps) {
          console.log("running step", step);
          updateStep({ ...step, status: "in-progress" });
          try {
            const result = await handleStep(step);
            if (step.type === StepType.RunScript &&
              (result === "npm run dev" || result === "npm start")) {
              setStartCmd(result);
            }
            updateStep({ ...step, status: "completed" });
          } catch (err) {
            console.error("Error processing step:", err);
            updateStep({ ...step, status: "failed" });
          }
        }
      } catch (error) {
        console.error("Error processing steps:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    if (containerId && steps.some(step => step.status === "pending")) {
      processSteps();
    }
  }, [steps, containerId, isProcessing]);

  async function reloadFileTree() {
    if (!containerId) return
    try {
      const response = await getFileTree(containerId, "/app")

      if (response && response.files) {
        const processedFiles = processFileStructure(response.files, "/app")
        setFiles(processedFiles)
      }
    } catch (error) {
      console.error("Error fetching file tree:", error)
    }
  }

  useEffect(() => {
    async function fetchFileTree() {
      if (!containerId) return
      try {
        const response = await getFileTree(containerId, "/app")

        if (response && response.files) {
          const processedFiles = processFileStructure(response.files, "/app")
          setFiles(processedFiles)
        }
      } catch (error) {
        console.error("Error fetching file tree:", error)
      }
    }
    fetchFileTree()
  }, [containerId])

  const processFileStructure = (fileList: string[], basePath: string): FileType[] => {
    const validFiles = fileList.filter((file) => file.trim() !== "")

    return validFiles
      .map((filename) => {
        const isDirectory = !filename.includes(".")
        const path = `${basePath}/${filename}`

        return {
          name: filename,
          path: path,
          type: isDirectory ? ("directory" as const) : ("file" as const),
          isOpen: false,
          children: isDirectory ? [] : undefined,
        }
      })
      .sort((a, b) => {
        if (a.type === "directory" && b.type === "file") return -1
        if (a.type === "file" && b.type === "directory") return 1
        return a.name.localeCompare(b.name)
      })
  }

  const handleFileSelect = (file: FileType) => {
    if (file.type === "file") {
      setSelectedFile(file)
    }
  }

  const handleDirectoryToggle = async (file: FileType) => {
    if (file.type !== "directory") return
    if (!file.isOpen && (!file.children || file.children.length === 0)) {
      try {
        const response = await getFileTree(containerId, file.path)

        if (response && response.files) {
          const children = processFileStructure(response.files, file.path)
          setFiles((prevFiles) => {
            return updateFileTreeWithChildren(prevFiles, file.path, children)
          })
        }
      } catch (error) {
        console.error("Error fetching directory contents:", error)
      }
    }
    setFiles((prevFiles) => {
      return updateFileTreeOpenState(prevFiles, file.path)
    })
  }

  const updateFileTreeOpenState = (files: FileType[], targetPath: string): FileType[] => {
    return files.map((file) => {
      if (file.path === targetPath) {
        return { ...file, isOpen: !file.isOpen }
      }

      if (file.type === "directory" && file.children) {
        return {
          ...file,
          children: updateFileTreeOpenState(file.children, targetPath),
        }
      }

      return file
    })
  }

  const updateFileTreeWithChildren = (files: FileType[], targetPath: string, children: FileType[]): FileType[] => {
    return files.map((file) => {
      if (file.path === targetPath) {
        return { ...file, children }
      }

      if (file.type === "directory" && file.children) {
        return {
          ...file,
          children: updateFileTreeWithChildren(file.children, targetPath, children),
        }
      }

      return file
    })
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Main content area */}
      <div className="flex-1 pb-4">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70} minSize={5} maxSize={80}>

            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={20} minSize={5} maxSize={40}>
                <FileExplorer
                  files={files}
                  onFileSelect={handleFileSelect}
                  onToggleDirectory={handleDirectoryToggle}
                  selectedFile={selectedFile}
                  reloadFileTree={reloadFileTree}
                />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={80}>
                {selectedFile ? (
                  <CodeEditor file={selectedFile} containerId={containerId} />
                ) : (
                  <div className="flex items-center justify-center h-full bg-black/40 text-gray-300">
                    <div className="text-center p-6">
                      <MdDashboard size={64} className="mx-auto mb-4 text-gray-400" />
                      <h2 className="text-2xl font-light mb-2 text-gray-200">Welcome to the Editor</h2>
                      <p className="text-gray-400">Select a file from the explorer to start editing</p>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={35} minSize={20} maxSize={90}>
            {(framework === "MANIM") ? (
              <RenderComponent
                containerId={containerId}
                activeFile={selectedFile}
              />
            ) : (
              <TerminalComponent containerId={containerId} startCmd={startCmd} framework={framework} />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}
