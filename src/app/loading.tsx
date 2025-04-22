"use client"

import { motion } from "framer-motion"
import { BlocksIcon } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-zinc-950 font-heading">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center gap-3 mb-4">
          <BlocksIcon size={40} className="text-white" />
          <span className="text-white text-xl font-medium font-heading">Builder</span>
        </div>

      </motion.div>

      {/* Simple background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black to-zinc-950" />
    </div>
  )
}
