"use client"

import { useEffect, useState } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { FileType } from "@/types/types"

interface CodeEditorProps {
  file: FileType
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) {
    return null
  }

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="90vh"
        defaultLanguage={file.language}
        defaultValue={file.content}
        theme="vs-dark"
        beforeMount={handleEditorWillMount}
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

