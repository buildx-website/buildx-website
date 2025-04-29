"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMessagesStore } from "@/store/messagesAtom";
import { useStepsStore } from "@/store/initialStepsAtom";
import { Sparkles, BlocksIcon, Paperclip, ArrowUp, X, Github } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion";
import { Content } from "@/types/types";
import { Spotlight } from "@/components/ui/spotlight-new";
import Sidebar from "@/components/Sidebar";
import { Navbar } from "@/components/navbar";
import { ArtifactParser } from "@/lib/artifactParser";
import { useUser } from "@/hooks/useUser";

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const [prompt, setPrompt] = useState<string>("");
  const addMessage = useMessagesStore((state) => state.addMessage);
  const addSteps = useStepsStore((state) => state.addSteps);
  const [loading, setLoading] = useState(false);
  const [allModels, setAllModels] = useState<{ id: string, name: string, displayName: string }[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [openAuthDialog, setOpenAuthDialog] = useState(false);

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';

      const maxHeight = 250;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;

      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    autoResize();
  }, [prompt]);

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
    if (isLoggedIn) {
      getModels();
      getUserModel();
    }
  }, [isLoggedIn]);

  const examplePrompts: string[] = [
    "An e-commerce site for selling sports equipment",
    "A blog platform for tech enthusiasts",
    "A social media platform for pet lovers",
    "A dashboard for my SaaS product",
    "Backend for note-taking app",
  ]

  async function getModels() {
    if (!isLoggedIn) {
      return;
    }
    const models = await fetch("/api/main/models", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (models.ok) {
      const data = await models.json();
      setAllModels(data);
    } else {
      const data = await models.json();
      // toast.error(data.error);
      console.log("Error fetching models: ", data.error);
    }
  }

  async function getUserModel() {
    if (!isLoggedIn) {
      return;
    }
    const userModel = await fetch("/api/main/user-model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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

  function getBase64(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // this gives you base64 with data prefix
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  async function handleSubmit() {
    if (!prompt.trim()) {
      return toast.error("Please write your idea first");
    }
    if (!isLoggedIn) {
      setOpenAuthDialog(true);
      return;
    }
    setLoading(true);
    const template = await fetch("/api/main/template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (template.ok) {
      const artifactParser = new ArtifactParser();
      const data = await template.json();
      if (data.message === "Try again with a different prompt") {
        return toast.error("Try again with a different prompt");
      }
      const { uiPrompts } = data;
      artifactParser.addChunk(uiPrompts[0]);
      while (artifactParser.getActions().length > 0) {
        const step = artifactParser.getStep();
        if (step) {
          addSteps([step]);
        }
      }
      if (image) {
        const base64 = await getBase64(image);
        const content: Content[] = [
          { type: "text", text: prompt! },
          { type: "image_url", image_url: { url: base64 as string } }
        ];

        addMessage({ role: "user", content: content, ignoreInUI: true });
        setImage(null);
      } else {
        addMessage({
          role: "user", content: [{
            type: "text",
            text: prompt,
          }]
        });
      }

      const createProject = await fetch("/api/main/create-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt, framework: data.framework,
        }),
      });

      const project = await createProject.json();
      console.log("Project: ", project);
      if (createProject.status != 200) {
        return toast.error(project.error);
      }

      setPrompt("");
      router.push(`/editor/${project.id}`);

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
    if (!isLoggedIn) {
      setOpenAuthDialog(true);
      return;
    }
    setLoading(true);
    const refinePrompt = await fetch("/api/main/refine-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });
    if (refinePrompt.ok) {
      const data = await refinePrompt.json();
      console.log("Refined Prompt: ", data);
      setPrompt(data.refinedPrompt);
      toast.success("Prompt refined successfully");
    }
    else {
      const data = await refinePrompt.json();
      toast.error(data.error);
    }
    setLoading(false);

  }

  async function handleModelChange(modelId: string) {
    if (!isLoggedIn) {
      setOpenAuthDialog(true);
      return;
    }

    try {
      const response = await fetch("/api/main/user-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const buttonHover = {
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  };


  return (<>
    <div className="flex relative overflow-hidden min-h-screen">
      <Sidebar isLoggedIn={isLoggedIn} />
      <main className="flex-1 bg-gradient-to-b from-black to-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col">
            <Navbar
              user={user}
              isLoggedIn={isLoggedIn}
              openDialog={openAuthDialog}
            />

            <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-24">
              <Spotlight />
              {/* Hero Section */}
              <motion.div
                className="flex flex-col gap-6 items-center text-center w-full max-w-4xl"
                initial="hidden"
                animate="visible"
                variants={fadeIn}
              >
                <motion.div
                  className="inline-flex items-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm"
                  variants={slideUp}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-slate-500" />
                  <span className="text-sm text-zinc-300 font-heading italic">V1 is here! Try it out!</span>
                </motion.div>

                <motion.h1
                  className="text-balance text-center font-heading text-4xl font-bold sm:text-5xl lg:text-6xl leading-tight text-zinc-200"
                  variants={slideUp}
                >
                  What do you want to build today?
                </motion.h1>


                <motion.p
                  className="text-zinc-400 max-w-lg text-center text-lg text-muted-foreground sm:text-lg tracking-wide text-balance"
                  variants={slideUp}
                >
                  Transform your ideas into working MVPs within minutes. No coding required.
                </motion.p>
              </motion.div>

              {/* Textarea Section */}
              <motion.div
                className="w-full max-w-3xl mt-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="relative group">
                  <motion.div
                    className="absolute -inset-0.5 bg-gradient-to-r from-slate-500/20 to-slate-400/20 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-1000"
                    animate={{
                      background: [
                        "linear-gradient(to right, rgba(100,116,139,0.2), rgba(148,163,184,0.2))",
                        "linear-gradient(to right, rgba(148,163,184,0.2), rgba(100,116,139,0.2))",
                        "linear-gradient(to right, rgba(100,116,139,0.2), rgba(148,163,184,0.2))"
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  ></motion.div>
                  <div className="flex flex-col gap-3 text-base rounded-xl border border-zinc-800 bg-black/50 shadow-slate-500/10 transition-all duration-200 font-heading p-4">
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="relative w-full border-none outline-none focus:outline-none focus:border-none focus:ring-0 focus:ring-opacity-0 bg-transparent text-white resize-none"
                      placeholder="Describe your app idea in detail..."
                      style={{
                        resize: 'none',
                        minHeight: '100px',
                        maxHeight: '200px'
                      }}
                    />
                    <div className="flex space-x-2 z-20 justify-end">
                      <Select value={model || ""} onValueChange={handleModelChange}>
                        <SelectTrigger className="w-[160px] bg-black/50 border-zinc-800">
                          <SelectValue placeholder="Select Model" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {allModels.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                {model.displayName}
                              </div>
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
                      <motion.div whileHover="hover" variants={buttonHover}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-10 h-10 hover:bg-zinc-800/50"
                          onClick={() => document.getElementById("image-input")?.click()}
                        >
                          <Paperclip className="w-5 h-5" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover="hover" variants={buttonHover}>
                        <Button
                          variant="ghost"
                          disabled={loading}
                          size="icon"
                          className="w-10 h-10 hover:bg-zinc-800/50"
                          onClick={handleRefinePrompt}
                        >
                          <Sparkles className="w-5 h-5" />
                        </Button>
                      </motion.div>
                      <motion.div whileHover="hover" variants={buttonHover}>
                        <Button
                          onClick={handleSubmit}
                          variant="default"
                          disabled={loading}
                        >
                          {loading ? (
                            <motion.div
                              className="h-5 w-5 border-2 border-t-transparent border-black rounded-full animate-spin"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                          ) : (<>
                            Build
                            <ArrowUp className="w-5 h-5" />
                          </>
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {imagePreview && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-zinc-900/50 border-zinc-800 w-full">
                      <CardContent className="flex items-center p-4 gap-4">
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Uploaded preview"
                            className="w-16 h-16 rounded-md object-cover border border-zinc-800"
                          />
                          <motion.button
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-zinc-800 rounded-full p-1 hover:bg-zinc-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-4 h-4 text-zinc-400" />
                          </motion.button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{image?.name}</p>
                          <p className="text-xs text-zinc-500">
                            {image?.size ? (image.size / 1024).toFixed(1) : 0} KB
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  className="mt-6"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.p
                    className="text-sm text-zinc-500 mb-3 italic"
                    variants={slideUp}
                  >
                    Need inspiration? Try one of these:
                  </motion.p>
                  <div className="flex flex-wrap gap-2">
                    {examplePrompts.map((example, index) => (
                      <motion.div
                        key={index}
                        variants={slideUp}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setPrompt(example)}
                          className="text-xs border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors tracking-tight font-heading"
                        >
                          {example}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </main>
          </div>
        </div>
        <motion.footer
          className="py-8 border-t border-zinc-800 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <BlocksIcon className="w-6 h-6 text-slate-400" />
                <span className="text-white font-medium font-heading">Builder</span>
              </motion.div>

              <div className="flex flex-wrap gap-3 justify-center">
                <div>
                  <Button
                    variant="link"
                    size="sm"
                    className="bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 gap-2 px-4 py-2 rounded-lg"
                    onClick={() => window.open("https://github.com/tsahil01/builder", "_blank")}
                  >
                    <Github className="w-4 h-4" />
                    <span className="font-heading tracking-tighter">Builder</span>
                  </Button>
                </div>

                <div>
                  <Button
                    variant="link"
                    size="sm"
                    className="bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 gap-2 px-4 py-2 rounded-lg"
                    onClick={() => window.open("https://github.com/tsahil01/builder-templates", "_blank")}
                  >
                    <Github className="w-4 h-4" />
                    <span className="font-heading tracking-tighter">Builder Template</span>
                  </Button>
                </div>
              </div>

            </div>

            <motion.div
              className="md:hidden flex justify-center mt-6 text-xs text-zinc-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span>© {new Date().getFullYear()} Builder. All rights reserved.</span>
            </motion.div>
          </div>
        </motion.footer>
      </main>
      <motion.div
        className="absolute top-1/4 -left-64 w-96 h-96 bg-slate-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 20, 0],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      ></motion.div>
      <motion.div
        className="absolute bottom-1/3 -right-64 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, -20, 0],
          opacity: [0.5, 0.7, 0.5]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 2
        }}
      ></motion.div>
    </div>
  </>
  )
}