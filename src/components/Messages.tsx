import type { Message } from "@/types/types"
import { BotMessageSquare, UserRoundIcon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function MessageComponent({ message, loading }: { message: Message, loading: boolean }) {

  if (!message || message.ignoreInUI) return null

  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full p-5 rounded-xl border shadow-lg my-6 transition-all",
        "bg-black/40 border-zinc-800",
      )}
    >
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/70">
        <div className="flex items-center gap-3">
          {isUser ? <UserRoundIcon className="" size={18} /> : <BotMessageSquare className="" size={18} />}
          <div className="flex items-center gap-2">
            <span className={cn("font-semibold")}>
              {isUser ? "You" : "Assistant"}
            </span>
            {!isUser && loading && <Loader2 className="w-3 h-3 animate-spin" />}
          </div>
        </div>
      </div>

      <div className="message-content">
        {message.loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <p className={cn("text-base leading-relaxed whitespace-pre-wrap font-semibold", isUser ? "text-zinc-50" : "text-zinc-50")}>
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  )
}

