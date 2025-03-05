"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { Navbar } from "@/components/navbar"
import { toast } from "sonner"
import { useMessagesStore } from "@/store/messagesAtom"
import { useStepsStore } from "@/store/initialStepsAtom"
import { parseXml } from "@/lib/steps"
import { Sparkles, Rocket, Code, Layout } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [prompt, setPrompt] = useState<string>("")
  const setMessages = useMessagesStore((state) => state.setMessages)
  const addMessage = useMessagesStore((state) => state.addMessage)
  const setSteps = useStepsStore((state) => state.setSteps)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!prompt.trim()) {
      return toast.error("Please write your idea first")
    }

    const token = localStorage.getItem("token")
    if (!token) {
      return toast.error("You need to login first")
    }

    setLoading(true)

    try {
      const template = await fetch("/api/main/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      })

      if (template.ok) {
        const data = await template.json()
        if (data.message === "Try again with a different prompt") {
          setLoading(false)
          return toast.error("Try again with a different prompt")
        }

        const { prompts, uiPrompts } = data
        setSteps(parseXml(uiPrompts[0]))
        setMessages(
          prompts.map((prompt: string) => ({
            role: "user",
            content: prompt,
            ignoreInUI: true,
          })),
        )
        addMessage({ role: "user", content: prompt })
        router.push("/editor")
      } else {
        const data = await template.json()
        setLoading(false)
        if (template.status === 401) {
          return toast.warning(data.error)
        }
        return toast.error(data.error)
      }
    } catch (error) {
      setLoading(false)
      console.error(`Error: ${error}`)
      toast.error("Something went wrong. Please try again.")
    }
  }

  const examplePrompts = [
    "A task management app with Kanban boards",
    "An e-commerce site for handmade jewelry",
    "A fitness tracker with workout plans",
    "A recipe sharing platform with social features",
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black overflow-hidden">
      <Spotlight />

      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-20">
          <div className="max-w-4xl w-full space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-zinc-400">Build faster than ever</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                  What do you want to build today?
                </span>
              </h1>

              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                Transform your ideas into working MVPs within minutes. No coding required.
              </p>
            </div>

            {/* Input Section */}
            <div className="w-full space-y-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="relative w-full min-h-[160px] p-4 text-lg rounded-lg resize-none border border-zinc-800 bg-black/50 backdrop-blur-sm shadow-inner shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono"
                  placeholder="Describe your app idea in detail..."
                />
              </div>

              {/* Example Prompts */}
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-zinc-500">Need inspiration? Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-xs px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="relative overflow-hidden group px-6 h-12 rounded-lg bg-gradient-to-br from-primary/80 to-purple-600/80 text-white font-medium text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Generate MVP
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Rapid Prototyping</h3>
                <p className="text-zinc-400">Go from idea to working prototype in minutes instead of weeks</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No-Code Required</h3>
                <p className="text-zinc-400">Build complex applications without writing a single line of code</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Layout className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customizable UI</h3>
                <p className="text-zinc-400">Fully customize the look and feel of your application</p>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 border-t border-zinc-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} MVP Builder. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                Terms
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  )
}

