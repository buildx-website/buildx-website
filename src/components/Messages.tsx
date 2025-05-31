"use client"

import type { Content, Message } from "@/types/types"
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import { BsChatSquareQuoteFill } from "react-icons/bs";
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { useState } from "react"
import { FilePreviewDialog } from "./FilePreviewDialog"
import { Button } from "./ui/button"

export function MessageComponent({ message, loading }: { message: Message, loading: boolean }) {
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    fileName: string;
    fileDir: string;
    fileType: string;
    fileContent: string;
  } | null>(null);

  if (!message || message.ignoreInUI) return null

  const isUser = message.role === "user"

  const extractFileInfo = (text: string) => {
    const fileRegex = /<userSelectedFile>([\s\S]*?)<\/userSelectedFile>/;
    const match = text.match(fileRegex);

    if (match) {
      const content = match[1];
      const fileNameMatch = content.match(/<fileName>([\s\S]*?)<\/fileName>/);
      const fileDirMatch = content.match(/<fileDir>([\s\S]*?)<\/fileDir>/);
      const fileTypeMatch = content.match(/<fileType>([\s\S]*?)<\/fileType>/);
      const fileContentMatch = content.match(/<fileContent>([\s\S]*?)<\/fileContent>/);

      if (fileNameMatch && fileDirMatch && fileTypeMatch && fileContentMatch) {
        return {
          fileName: fileNameMatch[1] as string,
          fileDir: fileDirMatch[1] as string,
          fileType: fileTypeMatch[1] as string,
          fileContent: fileContentMatch[1] as string
        };
      }
    }
    return null;
  };

  const removeFileTag = (text: string) => {
    return text.replace(/<userSelectedFile>[\s\S]*?<\/userSelectedFile>/, '')
      .replace(/Reference file:/, '')
      .trim();
  };

  const renderContent = (content: Content) => {
    if (content.type === "text" && content.text) {
      const fileInfo = extractFileInfo(content.text);
      const displayText = removeFileTag(content.text);

      return (
        <div className="markdown-body">
          {isUser && fileInfo && (
            <div className="mb-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedFile(fileInfo);
                  setShowFilePreview(true);
                }}
              >
                {fileInfo.fileName}
              </Button>
            </div>
          )}
          {displayText && (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {displayText}
            </ReactMarkdown>
          )}
        </div>
      )
    }
    else if (content.type === "image_url") {
      return (
        <img
          src={content.image_url?.url}
          alt="Input Image"
          className="rounded-lg shadow-lg mt-5"
        />
      )
    }
    return null
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full p-5 rounded-xl border shadow-lg my-6 transition-all",
          "bg-black/40 border-zinc-800",
        )}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/70">
          <div className="flex items-center gap-3">
            {isUser ? <FaUserCircle className="" size={18} /> : <BsChatSquareQuoteFill className="" size={18} />}
            <div className="flex items-center gap-2">
              <span className={cn("font-semibold")}>
                {isUser ? "You" : "Assistant"}
              </span>
              {!isUser && loading && <FaSpinner className="w-3 h-3 animate-spin" />}
            </div>
          </div>
        </div>

        <div className="message-content">
          {message.loading ? (
            <div className="flex items-center gap-2">
              <FaSpinner className="w-4 h-4 animate-spin" />
              <span className="italic">Thinking...</span>
            </div>
          ) : (
            <div className="text-white/90">
              {message.content.map((content, index) => (
                <div key={index}>
                  {renderContent(content)}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {selectedFile && (
        <FilePreviewDialog
          isOpen={showFilePreview}
          onClose={() => setShowFilePreview(false)}
          fileName={selectedFile.fileName}
          content={selectedFile.fileContent}
        />
      )}
    </>
  )
}