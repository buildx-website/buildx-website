export const baseReactFiles = `<boltArtifact id="project-import" title="React + ShadCN + Framer Motion Project"><boltAction type="file" filePath="components.json">{
    "$schema": "https://ui.shadcn.com/schema.json",
    "style": "new-york",
    "rsc": false,
    "tsx": true,
    "tailwind": {
      "config": "tailwind.config.js",
      "css": "src/index.css",
      "baseColor": "neutral",
      "cssVariables": true,
      "prefix": ""
    },
    "aliases": {
      "components": "@/components",
      "utils": "@/lib/utils",
      "ui": "@/components/ui",
      "lib": "@/lib",
      "hooks": "@/hooks"
    },
    "iconLibrary": "lucide"
  }</boltAction>
  <boltAction type="file" filePath="eslint.config.js">import js from '@eslint/js'
  import globals from 'globals'
  import reactHooks from 'eslint-plugin-react-hooks'
  import reactRefresh from 'eslint-plugin-react-refresh'
  import tseslint from 'typescript-eslint'
  
  export default tseslint.config(
    { ignores: ['dist'] },
    {
      extends: [js.configs.recommended, ...tseslint.configs.recommended],
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        ecmaVersion: 2020,
        globals: globals.browser,
      },
      plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
      },
    },
  )
  </boltAction>
  <boltAction type="file" filePath="index.html"><!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vite + React + TS</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  </boltAction>
  <boltAction type="file" filePath="package.json">{
    "name": "reactjs",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite",
      "build": "tsc -b && vite build",
      "lint": "eslint .",
      "preview": "vite preview"
    },
    "dependencies": {
      "@radix-ui/react-slot": "^1.1.2",
      "class-variance-authority": "^0.7.1",
      "clsx": "^2.1.1",
      "framer-motion": "^12.6.3",
      "lucide-react": "^0.487.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "react-router-dom": "^7.5.0",
      "tailwind-merge": "^3.2.0",
      "tailwindcss-animate": "^1.0.7"
    },
    "devDependencies": {
      "@eslint/js": "^9.21.0",
      "@types/node": "^22.14.0",
      "@types/react": "^19.0.10",
      "@types/react-dom": "^19.0.4",
      "@vitejs/plugin-react": "^4.3.4",
      "autoprefixer": "^10.4.21",
      "eslint": "^9.21.0",
      "eslint-plugin-react-hooks": "^5.1.0",
      "eslint-plugin-react-refresh": "^0.4.19",
      "globals": "^15.15.0",
      "postcss": "^8.5.3",
      "tailwindcss": "^3.4.17",
      "typescript": "~5.7.2",
      "typescript-eslint": "^8.24.1",
      "vite": "^6.2.0"
    }
  }
  </boltAction>
  <boltAction type="file" filePath="postcss.config.js">export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  </boltAction>
  <boltAction type="file" filePath="src/App.tsx">import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { ArrowRight } from "lucide-react";
  export default function Home() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-zinc-800">
        <Card className="w-full max-w-3xl rounded-2xl shadow-lg border border-zinc-700 bg-zinc-900 p-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome to Our React.js Template
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              Start building your app with clean UI and solid foundations.
            </p>
          </div>
  
          <div className="flex justify-center">
            <Button size="lg" className="gap-2" variant={'secondary'}>
              Get Started <ArrowRight size={20} />
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  </boltAction>
  <boltAction type="file" filePath="src/components/ui/button.tsx">import * as React from "react"
  import { Slot } from "@radix-ui/react-slot"
  import { cva, type VariantProps } from "class-variance-authority"
  
  import { cn } from "@/lib/utils"
  
  const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
      variants: {
        variant: {
          default:
            "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          destructive:
            "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          outline:
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          secondary:
            "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
          default: "h-9 px-4 py-2",
          sm: "h-8 rounded-md px-3 text-xs",
          lg: "h-10 rounded-md px-8",
          icon: "h-9 w-9",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )
  
  export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
      VariantProps<typeof buttonVariants> {
    asChild?: boolean
  }
  
  const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
      const Comp = asChild ? Slot : "button"
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      )
    }
  )
  Button.displayName = "Button"
  
  export { Button, buttonVariants }
  </boltAction>
  <boltAction type="file" filePath="src/index.css">@tailwind base;
  @tailwind components;
  @tailwind utilities;
  
  @layer base {
    :root {
      --background: 0 0% 100%;
      --foreground: 0 0% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 0 0% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 0 0% 3.9%;
      --primary: 0 0% 9%;
      --primary-foreground: 0 0% 98%;
      --secondary: 0 0% 96.1%;
      --secondary-foreground: 0 0% 9%;
      --muted: 0 0% 96.1%;
      --muted-foreground: 0 0% 45.1%;
      --accent: 0 0% 96.1%;
      --accent-foreground: 0 0% 9%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 0 0% 89.8%;
      --input: 0 0% 89.8%;
      --ring: 0 0% 3.9%;
      --chart-1: 12 76% 61%;
      --chart-2: 173 58% 39%;
      --chart-3: 197 37% 24%;
      --chart-4: 43 74% 66%;
      --chart-5: 27 87% 67%;
      --radius: 0.5rem
    }
    .dark {
      --background: 0 0% 3.9%;
      --foreground: 0 0% 98%;
      --card: 0 0% 3.9%;
      --card-foreground: 0 0% 98%;
      --popover: 0 0% 3.9%;
      --popover-foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --primary-foreground: 0 0% 9%;
      --secondary: 0 0% 14.9%;
      --secondary-foreground: 0 0% 98%;
      --muted: 0 0% 14.9%;
      --muted-foreground: 0 0% 63.9%;
      --accent: 0 0% 14.9%;
      --accent-foreground: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 0% 98%;
      --border: 0 0% 14.9%;
      --input: 0 0% 14.9%;
      --ring: 0 0% 83.1%;
      --chart-1: 220 70% 50%;
      --chart-2: 160 60% 45%;
      --chart-3: 30 80% 55%;
      --chart-4: 280 65% 60%;
      --chart-5: 340 75% 55%
    }
  }
  
  @layer base {
    * {
      @apply border-border;
    }
    body {
      @apply bg-background text-foreground;
    }
  }</boltAction>
  <boltAction type="file" filePath="src/lib/utils.ts">import { clsx, type ClassValue } from "clsx"
  import { twMerge } from "tailwind-merge"
  
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  </boltAction>
  <boltAction type="file" filePath="src/main.tsx">import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.tsx'
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  </boltAction>
  <boltAction type="file" filePath="src/vite-env.d.ts">/// <reference types="vite/client" />
  </boltAction>
  <boltAction type="file" filePath="tailwind.config.js">/** @type {import('tailwindcss').Config} */
  export default {
      darkMode: ["class"],
      content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))'
                }
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
  }</boltAction>
  <boltAction type="file" filePath="tsconfig.app.json">{
    "compilerOptions": {
      "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
  
      /* Bundler mode */
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "isolatedModules": true,
      "moduleDetection": "force",
      "noEmit": true,
      "jsx": "react-jsx",
  
      /* Linting */
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "noUncheckedSideEffectImports": true,
      
      "baseUrl": ".",
      "paths": {
        "@/*": [
          "./src/*"
        ]
      }
    },
    "include": ["src"]
  }
  </boltAction>
  <boltAction type="file" filePath="tsconfig.json">{
    "files": [],
    "references": [
      {
        "path": "./tsconfig.app.json"
      },
      {
        "path": "./tsconfig.node.json"
      }
    ],
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  </boltAction>
  <boltAction type="file" filePath="tsconfig.node.json">{
    "compilerOptions": {
      "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
      "target": "ES2022",
      "lib": ["ES2023"],
      "module": "ESNext",
      "skipLibCheck": true,
  
      /* Bundler mode */
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "isolatedModules": true,
      "moduleDetection": "force",
      "noEmit": true,
  
      /* Linting */
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "noUncheckedSideEffectImports": true
    },
    "include": ["vite.config.ts"]
  }
  </boltAction>
  <boltAction type="file" filePath="vite.config.ts">import path from "path"
  import react from "@vitejs/plugin-react"
  import { defineConfig } from "vite"
  
  // https://vite.dev/config/
  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
  </boltAction>
  <boltAction type="shell">npm install</boltAction><boltAction type="shell">npm run dev</boltAction>
  </boltArtifact>`;

export const reactPrompt = `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${baseReactFiles}\n\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n - eslint.config.js\n\nOther components of /src/components/ui are not shown to you, but they are present in the project in /src/components/ui directory.  ALL OF THEM ARE SHADCN COMPONENTS.\n\nHere is a list of all shadcn components that are not shown to you but are present in src/components/ui/ :\n\n  - button.tsx\n  - card.tsx\n  - checkbox.tsx\n  - input.tsx\n  - label.tsx\n  - switch.tsx\n  - textarea.tsx\n  - tooltip.tsx\n  - toast.tsx\n  - alert-dialog.tsx\n  - dropdown-menu.tsx\n  - progress.tsx\n  - slider.tsx\n  - tabs.tsx\n  - toggle.tsx\n  - accordion.tsx\n  - select.tsx\n  - spinner.tsx\n
  - skeleton.tsx\n  - badge.tsx\n  - avatar.tsx\n  - progress-bar.tsx\n  and so on\n\n`;


export const reactRunCommands = `<boltArtifact id="project init" title="Project Init"><boltAction type="shell">npm install</boltAction><boltAction type="shell">npm run dev</boltAction></boltArtifact>`