"use client"
import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BlocksIcon, Download } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { FileType, Message, Step, StepType } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";
import { useFileStore } from "@/store/filesAtom";
import { User } from "@/components/User";
import { parseXml } from "@/lib/steps";
import { useWebContainer } from "@/hooks/useWebContainer";
import { FileSystemTree } from "@webcontainer/api";
import { Web } from "@/components/Web";


export default function Editor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const { messages, addMessage } = useMessagesStore();
  const { steps, setSteps, addSteps } = useStepsStore();
  const { files, setFiles } = useFileStore();
  const [prompt, setPrompt] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [uiMsgs, setUiMsgs] = useState<Message[]>([]);
  const [building, setBuilding] = useState(false);
  const webcontainer = useWebContainer();

  useEffect(() => {
    setLoading(true);
    if (messages.length === 0) {
      router.push("/");
    } else {
      setInitialLoadComplete(true);
    }
    setLoading(false);
  }, [messages]);

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;

    steps.filter(({ status }) => status === "pending").map(step => {
      updateHappened = true;

      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]    
        let currentFileStructure = [...originalFiles]; // {}    
        const finalAnswerRef = currentFileStructure;

        let currentFolder = ""
        while (parsedPath.length) {
          currentFolder = `${currentFolder}/${parsedPath[0]}`;
          const currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);


          if (!parsedPath.length) {
            const file = currentFileStructure.find(x => x.id === currentFolder);

            if (!file) {
              currentFileStructure.push({
                id: currentFolder,
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              currentFileStructure.push({
                id: currentFolder,
                name: currentFolderName,
                type: 'directory',
                path: currentFolder,
                children: []
              })
            }
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

      if (step?.type === StepType.EditFile) {
        const file = originalFiles.find(x => x.path === step.path);
        if (file) {
          file.content = step.code;
        }
      }

      if (step?.type === StepType.DeleteFile) {
        originalFiles = originalFiles.filter(x => x.path !== step.path);
      }

      if (step?.type === StepType.DeleteFolder) {
        originalFiles = originalFiles.filter(x => step?.path && !x.path.startsWith(step.path));
      }

    })
    if (updateHappened) {
      setFiles(originalFiles)
      // console.log("Files updated", originalFiles)
      // set all steps to completed except for the StepType.RunScript. set it to in-progress
      const updatedSteps: Step[] = steps.map(step => {
        if (step.type === StepType.RunScript) {
          return { ...step, status: "in-progress" }
        }
        return { ...step, status: "completed" }
      })
      setSteps(updatedSteps);
    }
    setLoading(false);
  }, [steps, files]);

  useEffect(() => {
    if (!webcontainer) return;
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
    const mountFiles = createFileSystemTree(files);
    // console.log(mountFiles);
    webcontainer.mount(mountFiles);

  }, [files, webcontainer])

  async function send(msg: string) {
    try {
      setIsStreaming(true);
      setUiMsgs(prev => [...prev, { role: "user", content: msg }]);
      setUiMsgs(prev => [...prev, { role: "assistant", content: "" }]);

      const response = await fetch('api/main/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: messages.slice(0, -1),
          prompt: msg
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      let visibleResponseText = "";
      let foundXml = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullResponseText += chunk;
        if (!foundXml) {
          if (chunk.includes("<")) {
            foundXml = true;
            setBuilding(true);
          } else {
            visibleResponseText += chunk;
            setUiMsgs(prev => {
              const newMsgs = [...prev];
              newMsgs[newMsgs.length - 1].content = visibleResponseText;
              return newMsgs;
            });
          }
        }
      }

      const newSteps = parseXml(fullResponseText);
      let stepLength = steps.length;
      const newStepsWithId = newSteps.map(step => {
        return { ...step, id: stepLength++ }
      });
      addSteps(newStepsWithId);

      setBuilding(false);
      const newMsg: Message = {
        role: "assistant",
        content: fullResponseText,
        ignoreInUI: foundXml
      };
      addMessage(newMsg);
      setIsStreaming(false);

    } catch (e) {
      console.error("Error sending message: ", e);
      setIsStreaming(false);
    }

  }

  useEffect(() => {
    if (initialLoadComplete && messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
      if (lastUserMessage) {
        send(lastUserMessage.content);
      }
    }
  }, [initialLoadComplete]);

  async function handleSubmit() {
    if (prompt.trim() === "" || isStreaming) return;

    const userMsg: Message = {
      role: "user",
      content: prompt
    };

    addMessage(userMsg);
    send(prompt);
    setPrompt("");
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!loading) {
    return (
      <main className="h-screen grid grid-cols-3 p-3 gap-3 bg-[#121212] overflow-hidden">
        <div className="col-span-1 h-full flex flex-col rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-medium text-gray-200">Conversation</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide gap-3">
            {uiMsgs.map((msg, idx) => (
              <MessageComponent key={idx} message={msg} />
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
            <StepList StepTitle="Build Steps" steps={steps} building={building} />
            <SendPrompt handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} disabled={isStreaming} />
          </div>
        </div>

        <div className="col-span-2 flex flex-col bg-[#1e1e1e] text-white h-full rounded-xl overflow-hidden border border-gray-800 shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-slate-200 cursor-pointer"
                onClick={() => window.location.href = '/'}>
                <BlocksIcon size={32} />
              </span>
              <h2 className="text-lg font-medium text-gray-200">{showPreview ? "Preview" : "Code"}</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!showPreview ? "text-gray-300" : "text-gray-500"}`}>Code</span>
                <Switch
                  checked={showPreview}
                  onCheckedChange={setShowPreview}
                  className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-gray-800"
                />
                <span className={`text-sm ${showPreview ? "text-gray-300" : "text-gray-500"}`}>Preview</span>
              </div>
              <Button size={"sm"} variant={"outline"} className="border-gray-700 hover:bg-gray-800">
                <Download size={16} />
              </Button>
              <User />
            </div>
          </div>

          <div className="flex-1 overflow-auto">{
            showPreview ? <Web webcontainer={webcontainer} /> : <EditorInterface />
          }
          </div>
        </div>
      </main>
    )
  }
}