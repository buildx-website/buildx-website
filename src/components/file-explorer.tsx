"use client"

import { ChevronDown, ChevronRight, File, FileCode2, FileJson2, FileText, FolderClosed } from "lucide-react"
import type { FileType } from "@/types/types"

interface FileExplorerProps {
  files: FileType[]
  onFileSelect: (file: FileType) => void
  onToggleDirectory: (fileId: string) => void
  selectedFileId: string | undefined
}

export function FileExplorer({ files, onFileSelect, onToggleDirectory, selectedFileId }: FileExplorerProps) {
  const renderFileIcon = (file: FileType) => {
    if (file.type === "directory") {
      return <FolderClosed className="h-4 w-4 text-yellow-400" />
    }

    const extension = file.name.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "tsx":
      case "ts":
        return <FileCode2 className="h-4 w-4 text-blue-400" />
      case "json":
        return <FileJson2 className="h-4 w-4 text-yellow-300" />
      case "md":
        return <FileText className="h-4 w-4 text-gray-400" />
      default:
        return <File className="h-4 w-4 text-gray-400" />
    }
  }

  const renderFileTree = (files: FileType[], level = 0) => {
    return files.map((file) => (
      <div key={file.id} style={{ paddingLeft: `${level * 10}px` }}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-[#2a2d2e] ${selectedFileId === file.id ? "bg-[#37373d]" : ""
            }`}
          onClick={() => {
            if (file.type === "directory") {
              onToggleDirectory(file.id)
            } else {
              onFileSelect(file)
            }
          }}
        >
          {file.type === "directory" && (
            <span className="mr-1">
              {file.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </span>
          )}
          <span className="mr-2">{renderFileIcon(file)}</span>
          <span className="text-sm">{file.name}</span>
        </div>

        {file.type === "directory" && file.isOpen && file.children && (
          <div>{renderFileTree(file.children, level + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-full bg-[#252526] overflow-y-auto rounded-md">
      <div className="p-2 text-sm font-medium text-gray-300">EXPLORER</div>
      <div>{renderFileTree(files)}</div>
    </div>
  )
}

