import type { Content, Message } from "@/types/types"
import { BotMessageSquare, UserRoundIcon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

export function MessageComponent({ message, loading }: { message: Message, loading: boolean }) {

  if (!message || message.ignoreInUI) return null

  const isUser = message.role === "user"

  const renderContent = (content: Content) => {
    if (content.type === "text") {
      return (
        <ReactMarkdown
          // className="prose prose-invert max-w-none"
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content.text}
        </ReactMarkdown>
      )
    }
    else if (content.type === "image_url") {
      return (
        <img
          src={content.image_url?.url}
          alt="Input Image"
          className="rounded-lg shadow-lg mt-5"
        />
      )
    }
    return null
  }

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
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/70 font-heading">
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
            <span className="italic font-heading">Thinking...</span>
          </div>
        ) : (
          <div className={cn("tracking-tight font-heading", isUser ? "text-zinc-50" : "text-zinc-50")}>
            {message.content.map((content, index) => (
              <div key={index}>
                {renderContent(content)}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}