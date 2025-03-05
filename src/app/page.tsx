"use client";

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { Navbar } from "@/components/navbar"
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "@/store/messagesAtom";
import { useStepsStore } from "@/store/initialStepsAtom";
import { parseXml } from "@/lib/steps";
import {  Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const setMessages = useMessagesStore((state) => state.setMessages);
  const addMessage = useMessagesStore((state) => state.addMessage);
  const setSteps = useStepsStore((state) => state.setSteps);
  const [loading, setLoading] = useState(false);

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
      router.push("/editor");

    } else {
      const data = await template.json();
      if (template.status === 401) {
        return toast.warning(data.error);
      }
      return toast.error(data.error);
    }
  }

  return (
    <div className="overflow-hidden relative bg-gradient-to-t from-black to-zinc-900">
      <Spotlight />
      <div className="h-[40rem] grid grid-rows-[60px_1fr_20px] items-center justify-items-center min-h-screen py-8 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)] container mx-auto">
        <Navbar />

        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start container mx-auto">
          <div className="flex flex-col gap-4 items-center text-center mx-auto">
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
          <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="relative w-full min-h-[160px] p-4 text-lg rounded-lg resize-none border border-zinc-800 bg-black/50 backdrop-blur-sm shadow-inner shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono"
                placeholder="Describe your app idea in detail..."
              />
            </div>
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
            <div className="flex justify-end w-full mx-3">
              <Button
                onClick={handleSubmit}
                size={"lg"}
                disabled={loading}
                className="text-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors hover:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] hover:bg-[length:220%_100%] hover:text-slate-200 outline-none"
              >
                Generate App
              </Button>
            </div>
          </div>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
    </div>
  )
}
