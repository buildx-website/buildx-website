"use client"

import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { ContainerPort, Content, FileContent, FileType, Message, } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";
import { User } from "@/components/User";
import { extractAndParseStepsFromMessages } from "@/lib/extract-parse-steps";
import { startNewContainer } from "@/lib/worker-config";
import { ArtifactParser } from "@/lib/artifactParser";
import { useUser } from "@/hooks/useUser";
import Loading from "@/app/loading";
import { BrowserPreview } from "@/components/WebPreview/browser-preview";
import HomeSidebar from "@/components/HomeSidebar";
import { toast } from "sonner";

export default function Editor() {
  const router = useRouter();
  const { user, isLoggedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const { messages, addMessage, setMessages } = useMessagesStore();
  const { steps, setSteps, addSteps } = useStepsStore();
  const [allModels, setAllModels] = useState<{ id: string, name: string, displayName: string }[]>([]);
  const [model, setModel] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<string>("");
  const [containerId, setContainerId] = useState<string>("");
  const [containerStatus, setContainerStatus] = useState<string>("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [uiMsgs, setUiMsgs] = useState<Message[]>([]);
  const [building, setBuilding] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<{ framework: string; messages: Message[]; } | null>(null);
  const [currentActionBuilding, setCurrentActionBuilding] = useState<string | null>(null);
  const [currentActionContent, setCurrentActionContent] = useState<string | null>(null);
  const [containerPort, setContainerPort] = useState<ContainerPort[]>([{}]);
  const [selectedFileText, setSelectedFileText] = useState<FileContent | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const params = useParams()
  const projectId = params.projectId as string

  useEffect(() => {
    if (!projectId) {
      router.push("/");
      return;
    }
    const validateAndLoadProject = async () => {
      setLoading(true);
      try {
        if (!isLoggedIn) {
            router.push("/");
          return;
        }

        const response = await fetch(`/api/main/project/${projectId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          router.push("/");
          return;
        }

        const projectData = await response.json();
        // console.log("Project", projectData)
        setProject(projectData);
        setFramework(projectData.framework);

        if (projectData.messages.length === 0) {
          await saveMsg(messages.slice(0, messages.length - 1));
          const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
          if (lastUserMessage) {
            console.log("Sending last user message: ", lastUserMessage);
            send(lastUserMessage.content, projectData.framework);
          }
        }

        if (projectData.messages && projectData.messages.length > 0) {
          setMessages(projectData.messages);

          const extractedSteps = extractAndParseStepsFromMessages(projectData.messages);
          console.log("Extracted steps", extractedSteps);
          setSteps(extractedSteps);

          const displayMessages = projectData.messages
            .filter((msg: Message) => !msg.ignoreInUI)
            .map((msg: Message) => {
              if (msg.role === "assistant" && msg.content.length > 0) {
                return {
                  ...msg,
                  content: msg.content.map((content: Content) => {
                    if (!content.text) return content;
                    
                    const processedText = content.text
                      .replace(/<boltArtifact[^>]*>[\s\S]*?<\/boltArtifact>/g, '')
                      .replace(/<boltAction[^>]*>[\s\S]*?<\/boltAction>/g, '')
                      .replace(/<boltAction[^>]*>[\s\S]*?<boltArtifact[^>]*>[\s\S]*?<\/boltArtifact>[\s\S]*?<\/boltAction>/g, '')
                      .trim();

                    const finalText = processedText 
                      ? `\n\n**Content before response:**\n${processedText}`
                      : "";

                    return {
                      ...content,
                      text: finalText
                    };
                  })
                };
              }
              return msg;
            }) || [];

          setUiMsgs(displayMessages);
        }

        setInitialLoadComplete(true);
      } catch (error) {
        console.error("Error validating project:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadProject();
  }, []);

  useEffect(() => {
    if (project == null) {
      console.log("Project is null");
      return;
    }

    const startContainer = async () => {
      try {
        const image = project?.framework === "REACT" ? "buildx-react" : project?.framework === "NEXT" ? "buildx-next" : project?.framework === "NODE" ? "buildx-node" : "null";

        const data = await startNewContainer(image, "tail -f /dev/null", ["3000"]);
        console.log("Container started", data);

        setContainerId(data.containerId);
        setContainerStatus(data.status);
        setContainerPort(data.urls);

      } catch (error) {
        console.error("Error starting container:", error);
      };
    }
    startContainer();
  }, [project])

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [uiMsgs]);

  useEffect(() => {
    if (isLoggedIn) {
      getModels();
      getUserModel();
    }
  }, [isLoggedIn]);

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

  async function handleModelChange(modelId: string) {
    if (!isLoggedIn) {
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

  async function saveMsg(msg: Message[]) {
    try {
      await fetch(`/api/main/save-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          messages: msg,
        })
      });
    } catch (error) {
      console.error("Error saving project state:", error);
    }
  }

  async function send(content: Content[], projectFramework: string) {
    try {
      setIsStreaming(true);
      setUiMsgs(prev => [...prev, { role: "user", content: content }]);
      setUiMsgs(prev => [...prev, { role: "assistant", content: [], loading: true }]);

      await saveMsg([{
        role: "user",
        content: content,
        ignoreInUI: false
      }]);

      const prompt = content.map(c => c.text).join("\n");
      setSelectedFileText(null);


      const response = await fetch('/api/main/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          prompt,
          framework: projectFramework,
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponseText = "";

      const artifactParser = new ArtifactParser();

      while (true) {
        const { done, value } = await reader.read();
        setBuilding(true);
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        artifactParser.addChunk(chunk);
        const newStep = artifactParser.getStep();
        const currentAction = artifactParser.getCurrentActionTitle();
        const currentActionContent = artifactParser.getCurrentActionContent();
        if (currentAction) {
          setCurrentActionBuilding(currentAction);
        }
        if (currentActionContent) {
          setCurrentActionContent(currentActionContent);
        }
        if (newStep) {
          console.log("New step: ", newStep);
          addSteps([newStep]);
        }
        fullResponseText += chunk;

        // add the content before the XML to the visible response text
        const contentBeforeArtifact = artifactParser.getContentBeforeArtifact();
        if (contentBeforeArtifact) {
          await setUiMsgs(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
              ...newMsgs[newMsgs.length - 1],
              role: "assistant",
              content: [{
                type: "text",
                text: contentBeforeArtifact
              }],
              loading: false
            };
            return newMsgs;
          });
        }

        if (contentBeforeArtifact.trim() == "") {
          setUiMsgs(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
              ...newMsgs[newMsgs.length - 1],
              role: "assistant",
              content: [{
                type: "text",
                text: "Okay, Building it..."
              }],
              loading: false
            };
            return newMsgs;
          });
        }
        const contentAfterArtifact = artifactParser.getContentAfterArtifact();
        if (contentAfterArtifact) {
          await setUiMsgs(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
              role: "assistant",
              content: [{
                type: "text",
                text: contentAfterArtifact
              }],
              loading: false
            };
            return newMsgs;
          });
        }

      }

      while (artifactParser.getActions().length > 0) {
        const step = artifactParser.getStep();
        if (step) {
          addSteps([step]);
        }
      }
      const currentAction = artifactParser.getCurrentActionTitle();
      const currentActionContent = artifactParser.getCurrentActionContent();
      console.log("Current action content: ", currentActionContent);
      setCurrentActionBuilding(currentAction);

      const newMsg: Message = {
        role: "assistant",
        content: [{
          type: "text",
          text: fullResponseText
        }],
        ignoreInUI: false
      };
      addMessage(newMsg);
      setIsStreaming(false);

      setUiMsgs(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0) {
          newMsgs[newMsgs.length - 1].loading = false;
        }
        return newMsgs;
      });
      setBuilding(false);
      setCurrentActionBuilding(null);
      await saveMsg([newMsg]);

    } catch (e) {
      setUiMsgs(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0) {
          newMsgs[newMsgs.length - 1].loading = false;
        }
        return newMsgs;
      });
      console.error("Error sending message: ", e);
      setIsStreaming(false);
    }
  }

  async function handleSubmit() {
    if (prompt.trim() === "" || isStreaming || building || !initialLoadComplete) return
    let fullPrompt = prompt;

    if(selectedFileText) {
      fullPrompt = fullPrompt + `\n\nReference file:
      <userSelectedFile>
        <fileName>${selectedFileText.fileName}</fileName>
        <fileDir>${selectedFileText.fileDir}</fileDir>
        <fileType>${selectedFileText.fileType}</fileType>
        <fileContent>${selectedFileText.fileContent}</fileContent>
      </userSelectedFile>`
    }

    const userMsg: Message = {
      role: "user",
      content: [{
        type: "text",
        text: fullPrompt
      }]
    };

    // unset the selected file
    setSelectedFile(null);
    setSelectedFileText(null);

    addMessage(userMsg);
    send(userMsg.content, framework);
    setPrompt("");
  }

  if (loading) {
    return (
      <Loading />
    );
  }

  return (
      <div className="flex flex-row h-screen w-screen">
        <HomeSidebar />
        <main className="h-screen w-full flex flex-1 flex-col md:grid md:grid-cols-4 gap-0 p-0 bg-[#121212] overflow-hidden ml-[64px] md:ml-[64px] transition-all duration-300">
            <div className="h-[40vh] md:h-auto md:col-span-1 flex flex-col overflow-hidden shadow-lg px-2">
              <div className="p-4 flex flex-row gap-2 my-auto">
                <h2 className="text-lg font-medium text-gray-200 my-auto">Conversation</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide gap-3" ref={conversationRef}>
                {uiMsgs.map((msg, idx) => (
                  <MessageComponent key={idx} message={msg} loading={isStreaming} />
                ))}
              </div>

              <div className="p-4">
                <StepList 
                  StepTitle={currentActionBuilding} 
                  steps={steps} 
                  building={building} 
                  setPrompt={setPrompt}
                  currentActionContent={currentActionContent}
                />
                <SendPrompt 
                  handleSubmit={handleSubmit} 
                  prompt={prompt} 
                  setPrompt={setPrompt} 
                  disabled={isStreaming}
                  model={model}
                  onModelChange={handleModelChange}
                  allModels={allModels}
                  containerId={containerId}
                  setSelectedFileText={setSelectedFileText}
                  setSelectedFile={setSelectedFile}
                  selectedFile={selectedFile}
                />
              </div>
            </div>

          <div
            className={`flex-1 md:col-span-3 flex flex-col bg-black/10 text-white overflow-hidden shadow-lg font-heading`}
          >
            {containerStatus !== "running" ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20">
                  <h3 className="text-xl font-semibold text-red-400 mb-2">Container Not Running</h3>
                  <p className="text-gray-400 mb-4">
                    Our worker is not currently running. Please retry after a few minutes.
                  </p>
                  <div className="animate-pulse">
                    <div className="h-2 w-24 bg-red-500/20 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 px-4 gap-4">
                  <div className="flex items-center gap-3 sm:gap-6">
                    <h2 className="text-lg font-medium text-gray-200">{showPreview ? "Preview" : "Code"}</h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${!showPreview ? "text-gray-300" : "text-gray-500"}`}>Code</span>
                      <Switch
                        checked={showPreview}
                        onCheckedChange={setShowPreview}
                        className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-gray-800"
                      />
                      <span className={`text-sm ${showPreview ? "text-gray-300" : "text-gray-500"}`}>Preview</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 hover:bg-gray-800"
                      onClick={() => {
                        // handleDownload(files, projectId);
                      }}
                    >
                      <Download size={16} />
                    </Button>
                    <User user={user} />
                  </div>
                </div>

                <div className={`flex-1 overflow-hidden ${showPreview ? "hidden" : "block"}`}>
                  <EditorInterface containerId={containerId} />
                </div>

                <div className={`flex-1 overflow-hidden ${showPreview ? "block" : "hidden"}`}>
                  <BrowserPreview
                    containerPort={containerPort}
                    height="100%"
                    width="100%"
                    building={building}
                  />
                </div>
              </>
            )}
        </div>
      </main>
    </div>
      ) 
}