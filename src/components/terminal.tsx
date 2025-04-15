"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"
import { Maximize2, Minimize2, } from "lucide-react"

type TerminalProps = {
    containerId: string
    autoFocus?: boolean
}

const TerminalComponent: React.FC<TerminalProps> = ({ containerId, autoFocus = true }) => {
    const xtermRef = useRef<HTMLDivElement | null>(null)
    const terminal = useRef<Terminal | null>(null)
    const fitAddon = useRef<FitAddon | null>(null)
    const [status, setStatus] = useState<"connecting" | "connected" | "error" | "disconnected">("connecting")
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Define theme colors - dark theme only now
    const getThemeColors = () => ({
        background: "#09090b", // Darker background
        foreground: "#e2e2e5",
        cursor: "#a1a1aa",
        selection: "#27272a",
        black: "#09090b",
        red: "#f87171",
        green: "#4ade80",
        yellow: "#facc15",
        blue: "#60a5fa",
        magenta: "#c084fc",
        cyan: "#22d3ee",
        white: "#e2e2e5",
    })

    useEffect(() => {
        // Initialize XTerm.js
        const term = new Terminal({
            cursorBlink: true,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            rows: 24,
            cols: 80,
            lineHeight: 1.2,
            scrollback: 5000,
            theme: getThemeColors(),
            allowTransparency: true,
            cursorStyle: "bar",
            cursorWidth: 2,
            screenReaderMode: true,
        })

        terminal.current = term
        fitAddon.current = new FitAddon()
        const webLinksAddon = new WebLinksAddon()

        // Add addons
        term.loadAddon(fitAddon.current)
        term.loadAddon(webLinksAddon)

        // Open terminal and fit to container
        if (xtermRef.current) {
            term.open(xtermRef.current)
            fitAddon.current.fit()

            if (autoFocus) {
                term.focus()
            }
        }

        // Connect to WebSocket
        const socket = new WebSocket(`ws://localhost:8080`)

        socket.onopen = () => {
            setStatus("connected")
            socket.send(JSON.stringify({ type: "start", containerId }))
            term.writeln("\r\nTerminal session started\r\n")
        }

        socket.onmessage = (event) => {
            if (terminal.current) {
                terminal.current.write(event.data)
            }
        }

        socket.onerror = () => {
            setStatus("error")
            term.writeln("\r\n\x1b[31m Connection error. Please try again later.\x1b[0m\r\n")
        }

        socket.onclose = () => {
            setStatus("disconnected")
            term.writeln("\r\n\x1b[33m Connection closed\x1b[0m\r\n")
        }

        // Send terminal input to WebSocket
        term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data)
            }
        })

        // Handle window resize
        const handleResize = () => {
            if (fitAddon.current) {
                fitAddon.current.fit()
            }
        }

        window.addEventListener("resize", handleResize)

        // Handle fullscreen change
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement !== null)
            setTimeout(handleResize, 100)
        }

        document.addEventListener("fullscreenchange", handleFullscreenChange)

        // Clean up
        return () => {
            socket.close()
            terminal.current?.dispose()
            window.removeEventListener("resize", handleResize)
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }
    }, [containerId, autoFocus])

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            xtermRef.current?.parentElement?.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    // Status indicator components
    const statusIndicators = {
        connecting: { color: "bg-amber-500" },
        connected: {  color: "bg-emerald-500" },
        error: {  color: "bg-red-500" },
        disconnected: {  color: "bg-red-400" },
    }

    return (
        <div className={`overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-zinc-900" : ""} border-t border-zinc-800`}>
            <div className="flex justify-between w-full p-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-zinc-200 font-heading">Terminal</span>
                    <span className={`w-3 h-3 ${statusIndicators[status].color} rounded-full animate-pulse my-auto`}></span>
                </div>
                <div className={`flex justify-end gap-3`}>
                    {/* show dot */}
                    <button
                        onClick={toggleFullscreen}
                        className="text-zinc-400 hover:text-zinc-50 transition-colors"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>
            <div
                ref={xtermRef}
                className="terminal-container"
                style={{
                    height: isFullscreen ? "calc(100vh - 40px)" : "500px",
                    width: "100%",
                    backgroundColor: getThemeColors().background,
                    padding: "4px",
                }}
                aria-label="Terminal window"
                role="application"
                tabIndex={0}
            />
        </div>
    )
}

export default TerminalComponent