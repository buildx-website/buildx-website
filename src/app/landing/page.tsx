"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FaGithub, FaArrowRight, FaCode, FaTerminal, FaEdit, FaVideo, FaRobot, FaLightbulb, FaCalculator } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const features = [
    {
      icon: <FaCode className="w-5 h-5" />,
      title: "AI-Powered Development",
      description: "Describe your app in natural language and watch it come to life. No coding required.",
      image: "/images/web-dev.jpg"
    },
    {
      icon: <FaVideo className="w-5 h-5" />,
      title: "Manim Video Creation",
      description: "Create stunning mathematical animations and educational videos using natural language prompts.",
      image: "/images/manim.jpg"
    },
    {
      icon: <FaTerminal className="w-5 h-5" />,
      title: "Live Preview",
      description: "See your changes in real-time with our integrated development environment.",
      image: "/images/preview.jpg"
    },
    {
      icon: <FaEdit className="w-5 h-5" />,
      title: "Code Editor",
      description: "Customize your application with our built-in code editor and terminal.",
      image: "/images/editor.jpg"
    }
  ];

  const capabilities = [
    {
      icon: <FaRobot className="w-5 h-5" />,
      title: "Web Applications",
      description: "Build full-stack web applications with React, Next.js, and Node.js. From simple landing pages to complex web apps.",
      image: "/images/web-apps.jpg"
    },
    {
      icon: <FaCalculator className="w-5 h-5" />,
      title: "Mathematical Animations",
      description: "Create beautiful mathematical visualizations and educational content using Manim. Perfect for teachers and content creators.",
      image: "/images/math-anim.jpg"
    },
    {
      icon: <FaLightbulb className="w-5 h-5" />,
      title: "AI-Powered Features",
      description: "Leverage advanced AI to generate code, create animations, and solve complex problems with natural language.",
      image: "/images/ai-features.jpg"
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/5 to-transparent" />
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.03]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-zinc-100 mb-6 font-heading tracking-tight"
              variants={slideUp}
            >
              Create Anything with
              <span className="text-zinc-400"> AI</span>
            </motion.h1>
            
            <motion.p
              className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto"
              variants={slideUp}
            >
              From web applications to mathematical animations, transform your ideas into reality using natural language.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={slideUp}
            >
              <Button
                size="lg"
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium px-8 py-6 rounded-lg"
                onClick={() => router.push("/")}
              >
                Start Creating
                <FaArrowRight className="ml-2" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-300 px-8 py-6 rounded-lg"
                onClick={() => window.open("https://github.com/tsahil01/buildx-website", "_blank")}
              >
                <FaGithub className="mr-2" />
                View on GitHub
              </Button>
            </motion.div>
    
            <motion.div
              className="mt-16 relative aspect-video rounded-lg overflow-hidden border border-zinc-800"
              variants={slideUp}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-zinc-500 text-lg">Hero Preview</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4 font-heading">
              Everything You Need to Create
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              A complete development environment powered by AI
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 group-hover:scale-105 transition-all duration-300"
                variants={slideUp}
              >
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-zinc-500 text-sm">{feature.title} Preview</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-zinc-400 mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">{feature.title}</h3>
                  <p className="text-zinc-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-zinc-900/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4 font-heading">
              What You Can Build
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Explore the possibilities with BuildX
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 group-hover:scale-105 transition-all duration-300"
                variants={slideUp}
              >
                <div className="relative aspect-video">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-zinc-500 text-sm">{capability.title} Preview</div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="text-zinc-400 mb-4">{capability.icon}</div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">{capability.title}</h3>
                  <p className="text-zinc-400">{capability.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4 font-heading">
              See It in Action
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Real examples of what you can create with BuildX
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800"
              variants={slideUp}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-zinc-500 text-lg">Web App Showcase</div>
              </div>
            </motion.div>

            <motion.div
              className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800"
              variants={slideUp}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-zinc-900/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-zinc-500 text-lg">Manim Animation Showcase</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center relative overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 to-zinc-900/10" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-6 font-heading">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Join thousands of creators who are building the future with AI.
              </p>
              <Button
                size="lg"
                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium px-8 py-6 rounded-lg"
                onClick={() => router.push("/")}
              >
                Start Creating
                <FaArrowRight className="ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-zinc-100 font-medium font-heading">BuildX</span>
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-300"
                onClick={() => window.open("https://github.com/tsahil01/buildx-website", "_blank")}
              >
                <FaGithub className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 