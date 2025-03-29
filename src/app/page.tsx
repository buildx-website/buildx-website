"use client"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight-new"
import { Navbar } from "@/components/navbar"
import { useState, KeyboardEvent, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "@/store/messagesAtom";
import { useStepsStore } from "@/store/initialStepsAtom";
import { parseXml } from "@/lib/steps";
import { Sparkles, SendHorizontal, Rocket, Zap, Code, LayoutDashboard, ShieldCheck, BlocksIcon } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const setMessages = useMessagesStore((state) => state.setMessages);
  const addMessage = useMessagesStore((state) => state.addMessage);
  const setSteps = useStepsStore((state) => state.setSteps);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getPrompt = localStorage.getItem("prompt");
    if (getPrompt) {
      setPrompt(getPrompt);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("prompt", prompt);
  }, [prompt]);

  const examplePrompts: string[] = [
    "A task management app with Kanban boards",
    "An e-commerce site for handmade jewelry",
    "A fitness tracker with workout plans",
    "A recipe sharing platform with social features",
  ]

  const features = [
    {
      icon: <Rocket className="w-6 h-6 text-primary" />,
      title: "Lightning Fast",
      description: "Generate working prototypes in minutes instead of weeks"
    },
    {
      icon: <Code className="w-6 h-6 text-primary" />,
      title: "No Code Required",
      description: "Build complex applications without writing a single line of code"
    },
    {
      icon: <LayoutDashboard className="w-6 h-6 text-primary" />,
      title: "Beautiful UI",
      description: "Professional, responsive designs generated automatically"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-primary" />,
      title: "Secure by Default",
      description: "Built-in security best practices for your applications"
    }
  ]

  async function handleSubmit() {
    if (!prompt.trim()) {
      return toast.error("Please write your idea first");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }
    setLoading(true);
    const template = await fetch("/api/main/template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    })

    if (template.ok) {
      const data = await template.json();
      if (data.message === "Try again with a different prompt") {
        return toast.error("Try again with a different prompt");
      }
      const { prompts, uiPrompts } = data;
      setSteps(parseXml(uiPrompts[0]));
      setMessages(prompts.map((prompt: string) => ({ role: "user", content: prompt, ignoreInUI: true })));
      addMessage({ role: "user", content: prompt });
      setPrompt("");
      router.push("/editor");

    } else {
      const data = await template.json();
      if (template.status === 401) {
        return toast.warning(data.error);
      }
      return toast.error(data.error);
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleRefinePrompt() {
    if (!prompt.trim()) {
      return toast.error("Please write your idea first");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }
    setLoading(true);
    const refinePrompt = await fetch("/api/main/refine-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    if (refinePrompt.ok) {
      const data = await refinePrompt.json();
      if (data.zodErr) {
        return toast.error("Error parsing data");
      }
      if (data.refinedPrompt) {
        setPrompt(data.refinedPrompt);
        toast.success("Prompt refined successfully");
      }
    } else {
      toast.error("Error refining prompt");
    }
    setLoading(false);
  }

  return (
    <div className="overflow-hidden relative bg-gradient-to-t from-black to-zinc-900 min-h-screen">
      <Spotlight />
      <div className="flex flex-col py-8 px-4 sm:px-6 lg:px-8 container mx-auto">
        <div className="flex flex-col md:flex-col items-center justify-between min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col gap-8 items-center justify-center mt-8 md:mt-0 max-w-6xl mx-auto w-full">
            <div className="flex flex-col gap-4 items-center text-center w-full">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-4">
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                <span className="text-sm font-medium text-zinc-400">Build faster than ever</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                  What do you want to build today?
                </span>
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto">
                Transform your ideas into working MVPs within minutes. No coding required.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-300/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="z-10 relative w-full min-h-[120px] sm:min-h-[160px] p-4 text-sm sm:text-lg rounded-lg resize-none border border-zinc-800 bg-black/50 shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono pr-24"
                    placeholder="Describe your app idea in detail..."
                  />
                  <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                    <Button variant="ghost" disabled={loading} size="icon" className="w-10 h-10" onClick={handleRefinePrompt}>
                      <Sparkles className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" onClick={handleSubmit} disabled={loading} size="icon" className="w-10 h-10">
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      ) : (
                        <SendHorizontal className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 mt-3">
                <p className="text-sm text-zinc-500">Need inspiration? Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      variant="outline"
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-xs rounded-full font-medium border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>

        <section className="py-20 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Turn Ideas Into Reality
              </h2>
              <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                Our AI-powered platform handles the heavy lifting so you can focus on your vision
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:bg-zinc-900/70 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-lg font-semibold text-white ml-3">{feature.title}</h3>
                  </div>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        <section className="py-20 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm mb-6">
              <Zap className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium text-zinc-400">Ready to build?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Start Creating in Seconds
            </h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
              No credit card required. Get started with your first prototype today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-900 to-purple-900 hover:from-primary/90 hover:to-purple-600/90 text-white"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Your Idea
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-zinc-700 hover:bg-zinc-800/50"
                onClick={handleRefinePrompt}
                disabled={loading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Refine Prompt
              </Button>
            </div>
          </div>
        </section>
      </div>

      <footer className="py-8 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BlocksIcon className="w-6 h-6 text-primary" />
              <span className="text-white font-medium">Builder</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-zinc-400 hover:text-white transition">Terms</a>
              <a href="#" className="text-zinc-400 hover:text-white transition">Privacy</a>
              <a href="#" className="text-zinc-400 hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  )
}