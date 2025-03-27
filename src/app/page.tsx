"use client";

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
import { Sparkles, SendHorizontal } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const setMessages = useMessagesStore((state) => state.setMessages);
  const addMessage = useMessagesStore((state) => state.addMessage);
  const setSteps = useStepsStore((state) => state.setSteps);
  const [loading, setLoading] = useState(false);

  // save prompt in local storage
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
    // Check if Enter is pressed without Shift (to allow multiline input)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
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
      <div className="min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8 container mx-auto">
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

      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  )
}