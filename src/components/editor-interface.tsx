"use client"

import type React from "react"
import { useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import type { FileType } from "@/types/types"
import { useFileStore } from "@/store/filesAtom"
import { BlocksIcon } from "lucide-react"

export function EditorInterface() {
  const { files, setFiles } = useFileStore()
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)

  const handleFileSelect = (file: FileType) => {
    if (file.type === "file") {
      setSelectedFile(file)
    }
  }

  const toggleDirectory = (fileId: string) => {
    const updateFiles = (files: FileType[]): FileType[] => {
      return files.map((file) => {
        if (file.id === fileId) {
          return { ...file, isOpen: !file.isOpen }
        }
        if (file.children) {
          return { ...file, children: updateFiles(file.children) }
        }
        return file
      })
    }

    setFiles(updateFiles(files))
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onToggleDirectory={toggleDirectory}
            selectedFileId={selectedFile?.id}
          />
        </ResizablePanel>

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col overflow-hidden">
            {selectedFile ? (
              <div className="h-full">
                <CodeEditor file={selectedFile} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-zinc-900 text-gray-300">
                <div className="text-center p-6">
                  <BlocksIcon size={64} className="mx-auto mb-4 text-gray-400" />
                  <h2 className="text-2xl font-light mb-2 text-gray-200">Welcome to the Editor</h2>
                  <p className="text-gray-400">Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

