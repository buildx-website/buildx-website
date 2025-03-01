"use client"
import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Boxes, Download } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { StepType } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";
import { useFileStore } from "@/store/filesAtom";
import { User } from "@/components/User";


export default function Editor() {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const { messages } = useMessagesStore();
  const { steps, setSteps } = useStepsStore();
  const { files, setFiles } = useFileStore();

  useEffect(() => {
    if (messages.length === 0) {
      router.push("/");
    }
  }, [])

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
            // final file
            const file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                id: Math.random().toString(),
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            const folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                id: Math.random().toString(),
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

    })
    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps.map(step => ({ ...step, status: "completed" })))
    }
    console.log(files);
  }, [steps, files]);

  return (
    <main className="h-screen grid grid-cols-3 p-3 gap-3 bg-[#121212] overflow-hidden">
      <div className="col-span-1 h-full flex flex-col rounded-xl overflow-hidden bg-[#1e1e1e] border border-gray-800 shadow-lg">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-medium text-gray-200">Conversation</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <MessageComponent key={0} message={messages[2]} />
          <StepList steps={steps} currentStep={1} onStepClick={() => { }} />
          {messages.slice(3).map((msg, idx) => (
            <MessageComponent key={idx} message={msg} />
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
          <SendPrompt handleSubmit={() => { }} prompt={""} setPrompt={() => { }} />
        </div>
      </div>

      <div className="col-span-2 flex flex-col bg-[#1e1e1e] text-white h-full rounded-xl overflow-hidden border border-gray-800 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 text-slate-200 cursor-pointer"
            onClick={() => window.location.href = '/'}>
            <Boxes size={32} />
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

        <div className="flex-1 overflow-auto">
          <EditorInterface />
        </div>
      </div>
    </main>
  )
}
