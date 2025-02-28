import { Message } from "@/types/types";

export function MessageComponent({ message }: { message: Message }) {
    return <div className="my-3 w-full p-4 text-lg rounded-lg resize-none border border-gray-900 bg-[#1e1e1e] backdrop-blur-sm shadow-primary/10  font-mono">
        <h2 className="text-md font-bold text-primary">
            {message.role}
        </h2>
        <div>
            {message.content}
        </div>
    </div>
}