import type { Message } from "@/types/types"
import { BotMessageSquare, UserRoundIcon as UserRoundPen } from "lucide-react"

export function MessageComponent({ message }: { message: Message }) {
  return (
    <div className="my-4 w-full p-4 rounded-lg border border-zinc-800 bg-black/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 mb-3 border-b border-zinc-800">
        {message.role === "user" ? (
          <UserRoundPen className="text-gray-400" size={18} />
        ) : (
          <BotMessageSquare className="text-gray-400" size={18} />
        )}
        <span className="text-gray-400 text-sm font-semibold">{message.role === "user" ? "You" : "Bot"}</span>
      </div>
      <p className="text-gray-300 text-sm">{message.content}</p>
    </div>
  )
}

