"use client";

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight-new"
import { Navbar } from "@/components/navbar"
import { useState } from "react";
import { toast } from "sonner";
import { Message } from "@/types/types";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "@/store/messagesAtom";
import { useStepsStore } from "@/store/initialStepsAtom";
import { parseXml } from "@/lib/steps";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const setMessages = useMessagesStore((state) => state.setMessages);
  const setSteps = useStepsStore((state) => state.setSteps);

  async function handleSubmit() {
    if (!prompt.trim()) {
      return toast.error("Please write your idea first");
    }
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }

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
      setSteps(
        uiPrompts.map((x: string) => parseXml(x))
      );
      const msgs: Message[] = [...prompts, prompt].map(content => ({ role: "user", content }));
      console.log("Messages: ", msgs);
      setMessages(msgs);
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
    <div className="overflow-hidden relative">
      <Spotlight />
      <div className="h-[40rem] grid grid-rows-[60px_1fr_20px] items-center justify-items-center min-h-screen py-8 pb-20 gap-16 sm:p-10 font-[family-name:var(--font-geist-sans)] container mx-auto">
        <Navbar />

        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex flex-col gap-4 items-center">
            <h1 className="text-5xl font-bold text-center sm:text-left tracking-normal">What do you want to build today?</h1>
            <p className="text-lg text-center mx-auto text-gray-300 sm:text-left max-w-[400px]">
              Build your MVP within minutes!
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 p-4 text-lg rounded-lg resize-none m-3 border border-gray-700 bg-black/30 backdrop-blur-sm shadow-inner shadow-primary/10 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 font-mono"
              placeholder="Write your idea here..."
            />
            <div className="flex justify-end w-full">
              <Button
                onClick={handleSubmit}
                size={"lg"}
                className="text-lg inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors hover:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] hover:bg-[length:220%_100%] hover:text-slate-200 outline-none"
              >
                Create Project
              </Button>
            </div>
          </div>
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
      </div>
    </div>
  )
}
