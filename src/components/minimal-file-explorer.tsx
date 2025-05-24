"use client"

import { useState } from "react"
import {
  FaChevronRight,
  FaFileAlt,
  FaFileCode,
  FaFileImage,
  FaFolder,
  FaFolderOpen,
  FaCogs,
  FaFileArchive,
  FaFileAudio,
  FaFileVideo,
  FaFileExcel,
  FaChartPie,
  FaChartBar,
  FaSpinner
} from "react-icons/fa";
import { VscJson } from "react-icons/vsc";
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { FileType } from "@/types/types"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

interface MinimalFileExplorerProps {
  files: FileType[]
  onFileSelect: (file: FileType) => void
  onToggleDirectory: (file: FileType) => void
  selectedFile: FileType | null
  reloadFileTree: () => void
  placeholder?: string
}

export function MinimalFileExplorer({ 
  files, 
  onFileSelect, 
  onToggleDirectory, 
  selectedFile, 
  placeholder = "Select a file...",
  reloadFileTree
}: MinimalFileExplorerProps) {
  const [loadingPaths, setLoadingPaths] = useState<Set<string>>(new Set())

  const renderFileIcon = (file: FileType) => {
    if (file.type === "directory") {
      return file.isOpen ? (
        <FaFolderOpen className="h-4 w-4 text-zinc-200" />
      ) : (
        <FaFolder className="h-4 w-4 text-zinc-200" />
      )
    }

    const extension = file.name.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "tsx":
      case "ts":
      case "jsx":
      case "js":
        return <FaFileCode className="h-4 w-4 text-zinc-500" />
      case "json":
        return <VscJson className="h-4 w-4 text-zinc-500" />
      case "md":
        return <FaFileAlt className="h-4 w-4 text-zinc-500" />
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
        return <FaFileImage className="h-4 w-4 text-zinc-500" />
      case "config":
      case "conf":
      case "env":
        return <FaCogs className="h-4 w-4 text-zinc-500" />
      case "zip":
      case "rar":
      case "tar":
      case "gz":
        return <FaFileArchive className="h-4 w-4 text-zinc-500" />
      case "mp3":
      case "wav":
      case "ogg":
        return <FaFileAudio className="h-4 w-4 text-zinc-500" />
      case "mp4":
      case "webm":
      case "mov":
        return <FaFileVideo className="h-4 w-4 text-zinc-500" />
      case "csv":
      case "xls":
      case "xlsx":
        return <FaFileExcel className="h-4 w-4 text-zinc-500" />
      case "html":
      case "css":
        return <FaFileCode className="h-4 w-4 text-zinc-500" />
      case "pdf":
        return <FaChartPie className="h-4 w-4 text-zinc-500" />
      case "py":
      case "rb":
      case "php":
        return <FaChartBar className="h-4 w-4 text-zinc-500" />
      default:
        return <FaFileAlt className="h-4 w-4 text-zinc-500" />
    }
  }

  const handleToggleDirectory = (file: FileType) => {
    if (file.type === "directory" && !file.isOpen && (!file.children || file.children.length === 0)) {
      setLoadingPaths(prev => {
        const newSet = new Set(prev);
        newSet.add(file.path);
        return newSet;
      });

      onToggleDirectory(file);

      setTimeout(() => {
        setLoadingPaths(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.path);
          return newSet;
        });
      }, 1000);
    } else {
      onToggleDirectory(file);
    }
  };

  const renderFileTree = (files: FileType[], level = 0) => {
    return files.map((file) => (
      <div key={file.path} className="relative">
        <div
          className={cn(
            "flex items-center py-1.5 px-2 cursor-pointer rounded-sm transition-all duration-100",
            selectedFile?.path === file.path ? "bg-[#37373d]" : "hover:bg-[#2a2d2e]",
            level === 0 ? "mt-0.5" : "",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            if (file.type === "directory") {
              handleToggleDirectory(file)
            } else {
              onFileSelect(file)
            }
          }}
        >
          {file.type === "directory" && (
            <motion.span
              className="mr-1 flex items-center justify-center"
              initial={{ rotate: file.isOpen ? 90 : 0 }}
              animate={{ rotate: file.isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {loadingPaths.has(file.path) ? (
                <FaSpinner className="h-3.5 w-3.5 text-gray-400 animate-spin" />
              ) : (
                <FaChevronRight className="h-3.5 w-3.5 text-gray-400" />
              )}
            </motion.span>
          )}
          <span className="mr-2 flex items-center">{renderFileIcon(file)}</span>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              file.type === "directory" ? "text-gray-200" : "text-gray-300",
            )}
          >
            {file.name}
          </span>
        </div>

        <AnimatePresence>
          {file.type === "directory" && file.isOpen && file.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {renderFileTree(file.children, level + 1)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    ))
  }

  return (
    <Select onOpenChange={(open) => {
      if (open) {
        reloadFileTree();
      }
    }}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] overflow-y-auto">
        <div className="bg-black/40">
          {files.length > 0 ? (
            renderFileTree(files)
          ) : (
            <div className="flex justify-center items-center p-4 text-gray-400">
              <FaSpinner className="h-4 w-4 mr-2 animate-spin" />
              <span className="text-sm">Loading files...</span>
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )
}