"use client"
import { EditorInterface } from "@/components/editor-interface"
import { useMessagesStore } from "@/store/messagesAtom";

export default function Editor() {
    const { messages, addMessage, clearMessages } = useMessagesStore();
    return (
        <main className="flex min-h-screen flex-col">
            {
                messages.map((msg, index) => {
                    return (
                        <div key={index} className={`flex gap-4 ${msg.role === "system" ? "justify-start" : "justify-end"}`}>
                            <div className={`bg-gray-200 p-4 rounded-lg ${msg.role === "system" ? "rounded-br-none" : "rounded-bl-none"}`}>
                                {msg.content}
                            </div>
                        </div>
                    )
                })
            }
            <EditorInterface />
        </main>
    )
}
