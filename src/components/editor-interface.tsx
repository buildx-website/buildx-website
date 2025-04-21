"use client"
import { useEffect, useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { BlocksIcon } from "lucide-react"
import { getFileTree, saveOrCreateFileContent } from "@/lib/worker-config"
import { StepType, type FileType, type Step } from "@/types/types"
import TerminalComponent from "@/components/terminal"
import { useStepsStore } from "@/store/initialStepsAtom"

export function EditorInterface({ containerId }: { containerId: string }) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const { steps, updateStep } = useStepsStore();

async function executeFileCreateStep(step: Step) {
  if (!step.path && !step.code) return;
  if (step.status === "in-progress" || step.status === "completed") return;

  updateStep({ ...step, status: "in-progress" });
  try {
    if (step.status !== "pending") return;
    const split = step.path?.split("/");
    const fileName = split ? split[split.length - 1] : step.path;
    let filePath = "/app";
    if (split && split.length > 1) {
      filePath = split.slice(0, split.length - 1).join("/") + "/";
    }

    const response = await saveOrCreateFileContent(
      containerId,
      filePath,
      fileName || "Undefined.txt",
      step.code || ""
    );

    if (response.success) {
      console.log("File created successfully:", fileName);
      updateStep({ ...step, status: "completed" });
    }

  } catch (error) {
    console.error("Error creating file:", error);
    updateStep({ ...step, status: "failed" });
  }
}

useEffect(() => {
  const executeSteps = async () => {
    for (const step of steps) {
      if (step.status === "pending" && step.type === StepType.CreateFile) {
        await executeFileCreateStep(step);
      }
    }
    await reloadFileTree();
  };
  executeSteps();
}, [containerId]);




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
      <div className="flex-1">
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
                  <div className="flex items-center justify-center h-full bg-zinc-900 text-gray-300">
                    <div className="text-center p-6">
                      <BlocksIcon size={64} className="mx-auto mb-4 text-gray-400" />
                      <h2 className="text-2xl font-light mb-2 text-gray-200">Welcome to the Editor</h2>
                      <p className="text-gray-400">Select a file from the explorer to start editing</p>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>

          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize={30} minSize={5} maxSize={90}>
            <TerminalComponent containerId={containerId} />
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </div>
  )
}