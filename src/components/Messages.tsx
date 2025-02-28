import { Message } from "@/types/types";
import { BotMessageSquare, UserRoundPen } from "lucide-react";

export function MessageComponent({ message }: { message: Message }) {
    return (
        <div className="my-4 w-full p-4 text-lg rounded-xl border border-gray-800 bg-[#1e1e1e] shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2 pb-2 mb-3">
                {
                    message.role === "user" ? (
                        <UserRoundPen className="text-primary-500" size={20} />
                    ) : (
                        <BotMessageSquare className="text-primary-500" size={20} />
                    )
                }
                <span className="text-primary-500 text-sm font-semibold">
                    {message.role === "user" ? "You" : "Bot"}
                </span>
            </div>
            <p className="text-gray-300">{message.content}</p>
        </div>
    );
}
