"use client"

import { useEffect, useState, useRef } from "react"
import Editor, { useMonaco } from "@monaco-editor/react"
import type { FileType } from "@/types/types"
import { useFileStore } from "@/store/filesAtom"
import { Loader2, Save, Copy, FileTypeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { editor } from 'monaco-editor'

interface CodeEditorProps {
  file: FileType
}

export function CodeEditor({ file }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [editorContent, setEditorContent] = useState<string>(file.content || "")
  const [isSaving, setIsSaving] = useState(false)
  const [language, setLanguage] = useState("")
  const [lineCount, setLineCount] = useState(0)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()
  const { updateFile } = useFileStore()

  // Update content when file changes
  useEffect(() => {
    setEditorContent(file.content || "")
  }, [file.id, file.content])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Configure Monaco editor
  useEffect(() => {
    if (monaco) {
      // Configure TypeScript/JavaScript compiler options
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.ESNext,
        noEmit: true,
        esModuleInterop: true,
        jsx: monaco.languages.typescript.JsxEmit.React,
        reactNamespace: "React",
        allowJs: true,
        typeRoots: ["node_modules/@types"],
      })

      // Add React types
      fetch("https://unpkg.com/@types/react@18.2.0/index.d.ts")
        .then((response) => response.text())
        .then((types) => {
          monaco.languages.typescript.typescriptDefaults.addExtraLib(
            types,
            "file:///node_modules/@types/react/index.d.ts",
          )
        })
        .catch((error) => console.error("Failed to fetch React types", error))

      // Define custom theme with better syntax highlighting
      monaco.editor.defineTheme("premium-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "keyword", foreground: "C586C0" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "regexp", foreground: "D16969" },
          { token: "type", foreground: "4EC9B0" },
          { token: "class", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
          { token: "variable", foreground: "9CDCFE" },
          { token: "variable.predefined", foreground: "4FC1FF" },
          { token: "interface", foreground: "4EC9B0" },
          { token: "namespace", foreground: "4EC9B0" },
        ],
        colors: {
          "editor.background": "#1E1E1E",
          "editor.foreground": "#D4D4D4",
          "editorCursor.foreground": "#AEAFAD",
          "editor.lineHighlightBackground": "#2D2D30",
          "editorLineNumber.foreground": "#858585",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#3A3D41",
          "editorIndentGuide.background": "#404040",
        },
      })
    }
  }, [monaco])


  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    const model = editor.getModel()
    if (!model) return
    
    // Count lines
    setLineCount(model.getLineCount())

    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })
    })

    // Update line count when content changes
    model.onDidChangeContent(() => {
      setLineCount(model.getLineCount())
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorContent(value)
    }
  }

  const saveChanges = () => {
    if (editorContent !== file.content) {
      setIsSaving(true)

      // Simulate save delay
      setTimeout(() => {
        const updatedFile: FileType = {
          ...file,
          content: editorContent,
        }
        updateFile(updatedFile)
        setIsSaving(false)
      }, 300)
    }
  }

  const copyContent = () => {
    navigator.clipboard
      .writeText(editorContent)
      .then(() => {
        // Could add a toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
      })
  }

  // Determine language based on file extension
  useEffect(() => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "plaintext"

    const languageMap: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      jsx: "javascript",
      tsx: "typescript",
      py: "python",
      java: "java",
      json: "json",
      xml: "xml",
      html: "html",
      css: "css",
      scss: "scss",
      less: "less",
      md: "markdown",
      yaml: "yaml",
      yml: "yaml",
      php: "php",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      go: "go",
      rs: "rust",
      rb: "ruby",
      sh: "shell",
      sql: "sql",
      swift: "swift",
      dart: "dart",
      vue: "html",
      svelte: "html",
    }

    setLanguage(languageMap[extension] || "plaintext")
  }, [file.name])

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1E1E1E]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3C3C3C]">
        <div className="flex items-center">
          <FileTypeIcon className="h-4 w-4 mr-2 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">{file.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyContent}
            className="p-1.5 rounded-sm hover:bg-[#3C3C3C] transition-colors"
            title="Copy content"
          >
            <Copy className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={saveChanges}
            className={cn(
              "p-1.5 rounded-sm transition-colors flex items-center",
              editorContent !== file.content
                ? "text-white bg-blue-600 hover:bg-blue-700"
                : "text-gray-400 hover:bg-[#3C3C3C]",
            )}
            disabled={isSaving}
            title="Save changes"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          key={file.id}
          height="90%"
          defaultLanguage={language}
          language={language}
          value={editorContent}
          theme="premium-dark"
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: true, scale: 0.75, showSlider: "mouseover" },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
            fontLigatures: true,
            lineNumbers: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            tabSize: 2,
            wordWrap: "on",
            wrappingIndent: "same",
            renderWhitespace: "selection",
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: "on",
            quickSuggestions: true,
            padding: { top: 10 },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#007ACC] text-white text-xs">
        <div className="flex items-center space-x-4">
          <span>{language.charAt(0).toUpperCase() + language.slice(1)}</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          <span>{lineCount} lines</span>
        </div>
      </div>
    </div>
  )
}

