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
  const { updateFile } = useFileStore();
  const [language, setLanguage] = useState("")

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
    
      const updatedFile: FileType = {
        ...file,
        content: value
      }
      
      updateFile(updatedFile)
    }
  }

  useEffect(() => {
    const extension = file.name.split(".").pop() || "plaintext"
    if(extension === "js" || extension === "jsx" || extension === "tsx") {
      setLanguage("javascript")
    } else if(extension === "ts") {
      setLanguage("typescript")
    } else if(extension === "py") {
      setLanguage("python")
    } else if(extension === "java") {
      setLanguage("java")
    } else if(extension === "json") {
      setLanguage("json")
    } else if(extension === "xml") {
      setLanguage("xml")
    } else if(extension === "html") {
      setLanguage("html")
    } else if(extension === "css") {
      setLanguage("css")
    }
  }, [file.name])

  if (!mounted) {
    return null
  }
  

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        key={file.id} 
        height="80vh"
        defaultLanguage={language}
        value={editorContent}
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