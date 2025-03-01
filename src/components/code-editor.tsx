"use client"

import { useEffect, useState } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { FileType } from "@/types/types"
import { useFileStore } from "@/store/filesAtom"

interface CodeEditorProps {
  file: FileType
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [editorContent, setEditorContent] = useState<string>(file.content || "")
  const { updateFile } = useFileStore()

  // Update editor content when file changes
  useEffect(() => {
    setEditorContent(file.content || "")
  }, [file.id, file.content])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme("vs-dark-custom", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      },
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value)
      
      // Create updated file object with new content
      const updatedFile: FileType = {
        ...file,
        content: value
      }
      
      // Update the file in the store
      updateFile(updatedFile)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        key={file.id} 
        height="80vh"
        defaultLanguage={file.language}
        value={editorContent} // Use controlled component
        theme="vs-dark"
        beforeMount={handleEditorWillMount}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "all",
          automaticLayout: true,
        }}
      />
    </div>
  )
}