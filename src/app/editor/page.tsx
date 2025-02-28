"use client"
import { EditorInterface } from "@/components/editor-interface"
import { messagesAtom } from "@/store/messagesAtom";
import { useRecoilState, useRecoilValue } from "recoil";

export default function Editor() {
    
    const msgs = useRecoilValue(messagesAtom);
    console.log("Messages: ", msgs);

    return (
        <main className="flex min-h-screen flex-col">
            {/* {
                msgs.map((msg, index) => {
                    return (
                        <div key={index} className={`flex gap-4 ${msg.role === "system" ? "justify-start" : "justify-end"}`}>
                            <div className={`bg-gray-200 p-4 rounded-lg ${msg.role === "system" ? "rounded-br-none" : "rounded-bl-none"}`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })
            } */}
            <EditorInterface />
        </main>
    )
}
