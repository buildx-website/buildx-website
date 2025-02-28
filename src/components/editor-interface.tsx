"use client"

import { useState } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileType } from "@/types/types"


// Sample file structure
const initialFiles: FileType[] = [
  {
    id: "1",
    name: "project",
    type: "directory",
    isOpen: true,
    children: [
      {
        id: "2",
        name: "src",
        type: "directory",
        isOpen: true,
        children: [
          {
            id: "3",
            name: "components",
            type: "directory",
            isOpen: false,
            children: [
              {
                id: "4",
                name: "Button.tsx",
                type: "file",
                language: "typescript",
                content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button
      className={\`px-4 py-2 rounded \${
        variant === 'primary' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }\`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};`,
              },
              {
                id: "5",
                name: "Card.tsx",
                type: "file",
                language: "typescript",
                content: `import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};`,
              },
            ],
          },
          {
            id: "6",
            name: "App.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';
import { Button } from './components/Button';
import { Card } from './components/Card';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Application</h1>
      <Card title="Welcome">
        <p className="mb-4">This is a sample application.</p>
        <Button>Click me</Button>
      </Card>
    </div>
  );
}

export default App;`,
          },
          {
            id: "7",
            name: "index.tsx",
            type: "file",
            language: "typescript",
            content: `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`,
          },
        ],
      },
      {
        id: "8",
        name: "package.json",
        type: "file",
        language: "json",
        content: `{
  "name": "my-app",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "typescript": "^5.0.4"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}`,
      },
      {
        id: "9",
        name: "README.md",
        type: "file",
        language: "markdown",
        content: `# My Application

This is a sample React application.

## Getting Started

1. Clone the repository
2. Run \`npm install\`
3. Run \`npm run dev\`

## Features

- Feature 1
- Feature 2
- Feature 3`,
      },
    ],
  },
]

export function EditorInterface() {
  const [files, setFiles] = useState<FileType[]>(initialFiles)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [openTabs, setOpenTabs] = useState<FileType[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const handleFileSelect = (file: FileType) => {
    if (file.type === "file") {
      setSelectedFile(file)

      // Add to open tabs if not already open
      if (!openTabs.find((tab) => tab.id === file.id)) {
        setOpenTabs([...openTabs, file])
      }

      setActiveTab(file.id)
    }
  }

  const handleTabClose = (fileId: string) => {
    const newTabs = openTabs.filter((tab) => tab.id !== fileId)
    setOpenTabs(newTabs)

    if (activeTab === fileId) {
      setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null)
      setSelectedFile(newTabs.length > 0 ? newTabs[newTabs.length - 1] : null)
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
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onToggleDirectory={toggleDirectory}
            selectedFileId={selectedFile?.id}
          />
        </ResizablePanel>

        <ResizablePanel defaultSize={80}>
          <div className="h-full flex flex-col">
            {openTabs.length > 0 ? (
              <>
                <Tabs value={activeTab || undefined} className="w-full">
                  <TabsList className="bg-[#252526] h-10 flex w-full justify-start rounded-none border-b border-[#3c3c3c]">
                    {openTabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="data-[state=active]:bg-[#1e1e1e] relative px-4 py-1.5 h-full"
                        onClick={() => {
                          setActiveTab(tab.id)
                          setSelectedFile(tab)
                        }}
                      >
                        <span className="mr-2">{tab.name}</span>
                        <button
                          className="ml-2 rounded-full hover:bg-[#3c3c3c] w-4 h-4 flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTabClose(tab.id)
                          }}
                        >
                          ×
                        </button>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {openTabs.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id} className="h-full p-0 m-0 border-none">
                      <CodeEditor file={tab} />
                    </TabsContent>
                  ))}
                </Tabs>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <h2 className="text-2xl font-light mb-2">Welcome to the Editor</h2>
                  <p>Select a file from the explorer to start editing</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}


