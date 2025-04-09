"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "@/store/messagesAtom";
import { useStepsStore } from "@/store/initialStepsAtom";
import { parseXml } from "@/lib/steps";
import { Sparkles, BlocksIcon, Paperclip, ArrowUp, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight-new";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<string>("");
  const setMessages = useMessagesStore((state) => state.setMessages);
  const addMessage = useMessagesStore((state) => state.addMessage);
  const setSteps = useStepsStore((state) => state.setSteps);
  const [loading, setLoading] = useState(false);
  const [allModels, setAllModels] = useState<{ id: string, name: string, displayName: string }[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    const getPrompt = localStorage.getItem("prompt");
    if (getPrompt) {
      setPrompt(getPrompt);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("prompt", prompt);
  }, [prompt]);

  useEffect(() => {
    getModels();
    getUserModel();
  }, []);

  const examplePrompts: string[] = [
    "An e-commerce site for selling sports equipment",
    "A social media platform for pet lovers",
    "A dashboard for my SaaS product",
  ]

  async function getModels() {
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }
    const models = await fetch("/api/main/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (models.ok) {
      const data = await models.json();
      setAllModels(data);
    } else {
      const data = await models.json();
      toast.error(data.error);
    }
  }

  async function getUserModel() {
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }
    const userModel = await fetch("/api/main/user-model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (userModel.ok) {
      const data = await userModel.json();
      setModel(data.id);
    } else {
      const data = await userModel.json();
      toast.error(data.error);
    }
  }

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

  async function handleModelChange(modelId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      return toast.error("You need to login first");
    }

    try {
      const response = await fetch("/api/main/user-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ modelId }),
      });

      if (response.ok) {
        setModel(modelId);
        toast.success("Model updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Error updating model: ", error);
      toast.error("Failed to update model");
    }
  }


  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-zinc-950 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Spotlight/>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-24">
            {/* Hero Section */}
            <div className="flex flex-col gap-6 items-center text-center w-full max-w-4xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2 text-slate-500" />
                <span className="text-sm font-bold text-zinc-300">V1 is here! Try it out!</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-300 leading-tight">
                What do you want to build today?
              </h1>

              <p className="text-lg text-zinc-400 max-w-2xl">
                Transform your ideas into working MVPs within minutes. No coding required.
              </p>
            </div>

            {/* Textarea Section */}
            <div className="w-full max-w-3xl mt-12">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500/20 to-slate-400/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="z-10 relative w-full min-h-[180px] p-6 text-base rounded-xl border border-zinc-800 bg-black/50 shadow-slate-500/10 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all duration-200 font-mono pr-32"
                    placeholder="Describe your app idea in detail..."
                    style={{ resize: 'none' }}
                  />
                  <div className="absolute bottom-5 right-5 flex space-x-2 z-20">
                    <Select value={model || ""} onValueChange={handleModelChange}>
                      <SelectTrigger className="w-[160px] bg-black/50 border-zinc-800">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {allModels.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            {model.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-input"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-10 h-10 hover:bg-zinc-800/50"
                      onClick={() => document.getElementById("image-input")?.click()}
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={loading}
                      size="icon"
                      className="w-10 h-10 hover:bg-zinc-800/50"
                      onClick={handleRefinePrompt}
                    >
                      <Sparkles className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || prompt.trim() === ""}
                      className="w-10 h-10 bg-slate-500 hover:bg-slate-600 transition-colors"
                    >
                      {loading ? (
                        <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      ) : (
                        <ArrowUp className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <Card className="bg-zinc-900/50 border-zinc-800 w-full">
                    <CardContent className="flex items-center p-4 gap-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Uploaded preview"
                          className="w-16 h-16 rounded-md object-cover border border-zinc-800"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute -top-2 -right-2 bg-zinc-800 rounded-full p-1 hover:bg-zinc-700 transition-colors"
                        >
                          <X className="w-4 h-4 text-zinc-400" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{image?.name}</p>
                        <p className="text-xs text-zinc-500">
                          {image?.size ? (image.size / 1024).toFixed(1) : 0} KB
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm text-zinc-500 mb-3">Need inspiration? Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <Button
                      variant="outline"
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-xs rounded-full font-medium border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors"
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </main>

          <footer className="py-8 border-t border-zinc-800 mt-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <BlocksIcon className="w-6 h-6 text-slate-500" />
                  <span className="text-white font-medium">Builder</span>
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Terms
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Privacy
                  </a>
                  <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"></div>
    </div>
  )
}