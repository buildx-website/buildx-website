"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BlocksIcon } from "lucide-react"

export default function Loading() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const quotes = [
    "Getting your project up and running in no time....",
    "Building the future, one line of code at a time.",
    "Your code, your way. BuildX makes it happen.",
    "Sit tight, we're building something amazing.",
    "Create, iterate, and deploy faster than ever before.",
    "Your next breakthrough project starts here.",
    "Empowering developers to build the future.",
    "Build like never before, without limitations.",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center flex-col justify-center min-h-screen bg-black">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <BlocksIcon size={48} className="text-white/90" />
          <span className="text-white text-xl font-semibold font-heading">
            BuildX Website
          </span>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
          className="fixed bottom-20 hidden md:block text-white/40 text-center max-w-md px-6 text-lg"
        >
          &quot;{quotes[currentQuoteIndex]}&quot;
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
          className="md:hidden text-white/40 text-center max-w-md px-6 text-lg mt-10"
        >
          {quotes[currentQuoteIndex]}
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 -z-10 bg-gradient-to-b from-black via-zinc-900 to-zinc-950"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  )
}
