"use client"
import { EditorInterface } from "@/components/editor-interface"
import { Spotlight } from "@/components/ui/spotlight-new";
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";


export default function Editor() {
    const router = useRouter();
    const [showPreview, setShowPreview] = useState<boolean>(false);

    const { messages, addMessage, clearMessages } = useMessagesStore();
    const { steps, setSteps } = useStepsStore();

    // if (messages.length === 0) {
    //     router.push("/");
    // }

    console.log("Steps: ", steps);

    return (
        <main className="min-h-screen min-w-screen grid grid-cols-3 p-3 gap-3">
            <div className="col-span-1 lex flex-col bg-[#1e1e1e] text-white h-full flex-1 rounded-xl shadow-lg overflow-hidden p-4">
                Hello
            </div>
            <div className="col-span-2 flex flex-col bg-[#1e1e1e] text-white h-full flex-1 rounded-xl shadow-lg overflow-hidden p-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
                    <h2 className="text-lg font-semibold">{
                        showPreview ? "Preview" : "Code"
                    }</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Code</span>
                            <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                            <span className="text-sm text-gray-400">Preview</span>
                        </div>
                        <Button size={'sm'} variant={'outline'}>
                            <Download size={16} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    <EditorInterface />
                </div>
            </div>
        </main>
    )
}
