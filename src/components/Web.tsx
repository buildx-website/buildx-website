"use client"
import { useWebContainer } from '@/hooks/useWebContainer';
import { FileType } from '@/types/types';
import { FileSystemTree } from '@webcontainer/api';
import { useEffect, useRef, useState } from 'react';

export function Web() {
    const [files, setFiles] = useState<FileType[]>([{
        "id": "/eslint.config.js",
        "name": "eslint.config.js",
        "type": "file",
        "path": "/eslint.config.js",
        "content": "import js from '@eslint/js';\nimport globals from 'globals';\nimport reactHooks from 'eslint-plugin-react-hooks';\nimport reactRefresh from 'eslint-plugin-react-refresh';\nimport tseslint from 'typescript-eslint';\n\nexport default tseslint.config(\n  { ignores: ['dist'] },\n  {\n    extends: [js.configs.recommended, ...tseslint.configs.recommended],\n    files: ['**/*.{ts,tsx}'],\n    languageOptions: {\n      ecmaVersion: 2020,\n      globals: globals.browser,\n    },\n    plugins: {\n      'react-hooks': reactHooks,\n      'react-refresh': reactRefresh,\n    },\n    rules: {\n      ...reactHooks.configs.recommended.rules,\n      'react-refresh/only-export-components': [\n        'warn',\n        { allowConstantExport: true },\n      ],\n    },\n  }\n);"
    }, {
        "id": "/index.html",
        "name": "index.html",
        "type": "file",
        "path": "/index.html",
        "content": "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <link rel=\"icon\" type=\"image/svg+xml\" href=\"/vite.svg\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React + TS</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>"
    }, {
        "id": "/package.json",
        "name": "package.json",
        "type": "file",
        "path": "/package.json",
        "content": "{\n  \"name\": \"vite-react-typescript-starter\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"lint\": \"eslint .\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"lucide-react\": \"^0.344.0\",\n    \"react\": \"^18.3.1\",\n    \"react-dom\": \"^18.3.1\"\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^9.9.1\",\n    \"@types/react\": \"^18.3.5\",\n    \"@types/react-dom\": \"^18.3.0\",\n    \"@vitejs/plugin-react\": \"^4.3.1\",\n    \"autoprefixer\": \"^10.4.18\",\n    \"eslint\": \"^9.9.1\",\n    \"eslint-plugin-react-hooks\": \"^5.1.0-rc.0\",\n    \"eslint-plugin-react-refresh\": \"^0.4.11\",\n    \"globals\": \"^15.9.0\",\n    \"postcss\": \"^8.4.35\",\n    \"tailwindcss\": \"^3.4.1\",\n    \"typescript\": \"^5.5.3\",\n    \"typescript-eslint\": \"^8.3.0\",\n    \"vite\": \"^5.4.2\"\n  }\n}"
    }, {
        "id": "/postcss.config.js",
        "name": "postcss.config.js",
        "type": "file",
        "path": "/postcss.config.js",
        "content": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};"
    }, {
        "id": "/tailwind.config.js",
        "name": "tailwind.config.js",
        "type": "file",
        "path": "/tailwind.config.js",
        "content": "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};"
    }, {
        "id": "/tsconfig.app.json",
        "name": "tsconfig.app.json",
        "type": "file",
        "path": "/tsconfig.app.json",
        "content": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"useDefineForClassFields\": true,\n    \"lib\": [\"ES2020\", \"DOM\", \"DOM.Iterable\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n    \"jsx\": \"react-jsx\",\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"src\"]\n}"
    }, {
        "id": "/tsconfig.json",
        "name": "tsconfig.json",
        "type": "file",
        "path": "/tsconfig.json",
        "content": "{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./tsconfig.app.json\" },\n    { \"path\": \"./tsconfig.node.json\" }\n  ]\n}"
    }, {
        "id": "/tsconfig.node.json",
        "name": "tsconfig.node.json",
        "type": "file",
        "path": "/tsconfig.node.json",
        "content": "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"lib\": [\"ES2023\"],\n    \"module\": \"ESNext\",\n    \"skipLibCheck\": true,\n\n    /* Bundler mode */\n    \"moduleResolution\": \"bundler\",\n    \"allowImportingTsExtensions\": true,\n    \"isolatedModules\": true,\n    \"moduleDetection\": \"force\",\n    \"noEmit\": true,\n\n    /* Linting */\n    \"strict\": true,\n    \"noUnusedLocals\": true,\n    \"noUnusedParameters\": true,\n    \"noFallthroughCasesInSwitch\": true\n  },\n  \"include\": [\"vite.config.ts\"]\n}"
    }, {
        "id": "/vite.config.ts",
        "name": "vite.config.ts",
        "type": "file",
        "path": "/vite.config.ts",
        "content": "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\n// https://vitejs.dev/config/\nexport default defineConfig({\n  plugins: [react()],\n  optimizeDeps: {\n    exclude: ['lucide-react'],\n  },\n});"
    }, {
        "id": "/src",
        "name": "src",
        "type": "directory",
        "path": "/src",
        "children": [
            {
                "id": "/src/App.tsx",
                "name": "App.tsx",
                "type": "file",
                "path": "/src/App.tsx",
                "content": "import React from 'react';\n\nfunction App() {\n  return (\n    <div className=\"min-h-screen bg-gray-100 flex items-center justify-center\">\n      <p>Start prompting (or editing) to see magic happen :)</p>\n    </div>\n  );\n}\n\nexport default App;"
            },
            {
                "id": "/src/index.css",
                "name": "index.css",
                "type": "file",
                "path": "/src/index.css",
                "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;"
            },
            {
                "id": "/src/main.tsx",
                "name": "main.tsx",
                "type": "file",
                "path": "/src/main.tsx",
                "content": "import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.tsx';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);"
            },
            {
                "id": "/src/vite-env.d.ts",
                "name": "vite-env.d.ts",
                "type": "file",
                "path": "/src/vite-env.d.ts",
                "content": "/// <reference types=\"vite/client\" />"
            }
        ]
    }]);

    const wc = useWebContainer();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    async function mountFiles() {
        if (!wc) return
        const createFileSystemTree = (files: FileType[]): FileSystemTree => {
            const result: FileSystemTree = {};
            for (const file of files) {
                if (file.type === "file") {
                    result[file.name] = {
                        file: {
                            contents: file.content || ''
                        }
                    };
                } else if (file.type === "directory") {
                    result[file.name] = {
                        directory: file.children ? createFileSystemTree(file.children) : {}
                    };
                }
            }
            return result;
        };
        const mountFiles = await createFileSystemTree(files);
        console.log(mountFiles);
        await wc.mount(mountFiles);
    }
    async function startDevServer() {
        if (!wc) return
        const installProcess = await wc.spawn('npm', ['install']);
        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
            throw new Error('Unable to run npm install');
        }
        // `npm run dev`
        await wc.spawn('npm', ['run', 'dev']);
    }

    async function start() {
        await mountFiles();
        await startDevServer();
    }

    useEffect(() => {
        if (wc && iframeRef.current) {
            start();
            wc.on('server-ready', (port, url) => {
                console.log(`Server ready on port ${port}`);
                console.log(`Server ready at ${url}`);
                if (iframeRef.current) {
                    iframeRef.current.src = url;
                }
            });
        }
    }, [wc]);

    // handle file changes
    useEffect(() => {
        if (wc) {
            mountFiles();
        }
    }, [files]);

    return (
        <>
            <iframe
                ref={iframeRef}
                className="w-full h-screen border-none"
                title="WebContainer Output"
            />
        </>
    )
}