"use client"
import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState, useRef } from "react";
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
import { Web2 } from "@/components/Web2";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


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
  const [url, setUrl] = useState<string>("");
  const conversationRef = useRef<HTMLDivElement>(null);

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
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
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
      const updatedSteps: Step[] = steps.map(step => {
        if (step.status === "pending") {
          if (step.type === StepType.RunScript) {
            return { ...step, status: "in-progress" }
          }
          return { ...step, status: "completed" }
        }
        return step;
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

  }, [files, webcontainer]);


  useEffect(() => {
    if (initialLoadComplete && messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
      if (lastUserMessage) {
        send(lastUserMessage.content);
      }
    }
  }, [initialLoadComplete]);


  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [uiMsgs]);


  async function send(msg: string) {
    try {
      setIsStreaming(true);
      setUiMsgs(prev => [...prev, { role: "user", content: msg }]);
      setUiMsgs(prev => [...prev, { role: "assistant", content: "", loading: true }]);

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
          const combinedText = visibleResponseText + chunk;
          const boltIndex = combinedText.indexOf("<boltArtifact");
          const codeBlockIndex = combinedText.indexOf("```");

          let cutoffIndex = -1;
          if (boltIndex !== -1) cutoffIndex = boltIndex;
          if (codeBlockIndex !== -1 && (cutoffIndex === -1 || codeBlockIndex < cutoffIndex)) {
            cutoffIndex = codeBlockIndex;
          }

          if (cutoffIndex !== -1) {
            visibleResponseText = combinedText.substring(0, cutoffIndex);
            foundXml = true;
            setBuilding(true);
            setShowPreview(false);
          } else {
            visibleResponseText = combinedText;
          }

          setUiMsgs(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = {
              ...newMsgs[newMsgs.length - 1],
              content: visibleResponseText,
              loading: false
            };
            return newMsgs;
          });
        }
      }

      const newSteps = parseXml(fullResponseText);
      let stepLength = steps.length;
      const newStepsWithId = newSteps.map(step => {
        return { ...step, id: stepLength++ }
      });
      addSteps(newStepsWithId);

      setBuilding(false);
      setShowPreview(true)
      const newMsg: Message = {
        role: "assistant",
        content: fullResponseText,
        ignoreInUI: foundXml
      };
      addMessage(newMsg);
      setIsStreaming(false);

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
    if (prompt.trim() === "" || isStreaming) return;

    const userMsg: Message = {
      role: "user",
      content: prompt
    };

    addMessage(userMsg);
    send(prompt);
    setPrompt("");
  }

  const handleDownload = async () => {
    const zip = new JSZip();

    // Helper function to add files recursively
    const addFilesToZip = (files: FileType[], currentPath: string = '') => {
      files.forEach(file => {
        const filePath = `${currentPath}${file.name}`;
        if (file.type === 'file') {
          zip.file(filePath, file.content || '');
        } else if (file.type === 'directory' && file.children) {
          addFilesToZip(file.children, `${filePath}/`);
        }
      });
    };

    // Add all files to zip
    addFilesToZip(files);

    // Generate and download the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'project.zip');
  };

  if (loading) {
    return <div>Loading...</div>
  }

  if (!loading) {
    return (
      <main className="h-screen grid grid-cols-1 md:grid-cols-4 p-3 gap-3 bg-[#121212] overflow-hidden">
        <div className="col-span-1 h-full flex flex-col rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-lg font-medium text-gray-200">Conversation</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide gap-3" ref={conversationRef}>
            {uiMsgs.map((msg, idx) => (
              <MessageComponent key={idx} message={msg} loading={isStreaming || false} />
            ))}
          </div>

          <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
            <StepList StepTitle="Build Steps" steps={steps} building={building} setPrompt={setPrompt} />
            <SendPrompt handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} disabled={isStreaming} />
          </div>
        </div>

        <div className="col-span-1 md:col-span-3 flex flex-col bg-[#1e1e1e] text-white h-full rounded-xl overflow-hidden border border-gray-800 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800 p-4">
            <div className="flex items-center gap-6 mb-2 sm:mb-0">
              <span className="flex items-center gap-2 text-slate-200 cursor-pointer"
                onClick={() => window.location.href = '/'}>
                <BlocksIcon size={32} />
              </span>
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
                size={"sm"} 
                variant={"outline"} 
                className="border-gray-700 hover:bg-gray-800"
                onClick={handleDownload}
              >
                <Download size={16} />
              </Button>
              <User />
            </div>
          </div>

          <div className={`flex-1 ${showPreview ? "hidden" : "block"}`}>
            <EditorInterface />
          </div>
          <div className={`flex-1 ${showPreview ? "block" : "hidden"}`}>
            <Web2 webcontainer={webcontainer} url={url} setUrl={setUrl} />
          </div>
        </div>
      </main>
    )
  }
}