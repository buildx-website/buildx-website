"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"

// Add custom styles for terminal container
const terminalStyles = `
  .terminal-container {
    position: relative;
    height: calc(100% - 16px);
    margin-bottom: 16px;
  }
  .terminal-container .xterm {
    height: 100%;
    width: 100%;
    padding: 4px;
  }
  .terminal-container .xterm-viewport {
    overflow-y: scroll !important;
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
  .xterm .xterm-screen {
    position: relative;
  }
`

type TerminalProps = {
    containerId: string
    autoFocus?: boolean
    startCmd: string | null
}

const MainTerminalComponent = ({ containerId, autoFocus = true, startCmd }: TerminalProps) => {
    const xtermRef = useRef<HTMLDivElement | null>(null)
    const terminal = useRef<Terminal | null>(null)
    const fitAddon = useRef<FitAddon | null>(null)
    const socketRef = useRef<WebSocket | null>(null)
    const prevStartCmdRef = useRef<string | null>(null)

    const getThemeColors = () => ({
        background: "#09090b",
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
        // Add styles to document head
        const styleElement = document.createElement('style')
        styleElement.textContent = terminalStyles
        document.head.appendChild(styleElement)

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

        // Set up resize observer
        const resizeObserver = new ResizeObserver(() => {
            if (fitAddon.current) {
                fitAddon.current.fit()
            }
        })

        if (xtermRef.current) {
            resizeObserver.observe(xtermRef.current)
        }

        // Connect to WebSocket
        const socket = new WebSocket(process.env.NEXT_PUBLIC_WORKER_WS_URL! || "ws://localhost:8080")
        socketRef.current = socket

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "start", containerId }))
            
            setTimeout(() => {
                if (terminal.current && socket.readyState === WebSocket.OPEN) {
                    const initCmd = "npm install --legacy-peer-deps && npm run dev";
                    terminal.current.write(`${initCmd}\r\n`);
                    socket.send(`${initCmd}\r`);
                    socket.send('\n');
                }
            }, 1500);
        }

        socket.onmessage = (event) => {
            if (terminal.current) {
                terminal.current.write(event.data)
            }
        }

        socket.onerror = () => {
            term.writeln("\r\n\x1b[31m Connection error. Please try again later.\x1b[0m\r\n")
        }

        socket.onclose = () => {
            term.writeln("\r\n\x1b[33m Connection closed\x1b[0m\r\n")
        }
        
        term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data)
            }
        });

        // Clean up
        return () => {
            resizeObserver.disconnect()
            socket.close()
            terminal.current?.dispose()
            socketRef.current = null
            // Remove styles
            styleElement.remove()
        }
    }, [containerId])

    useEffect(() => {
        if (startCmd === prevStartCmdRef.current) return;

        if (!startCmd || !socketRef.current || !terminal.current) {
            prevStartCmdRef.current = startCmd;
            return;
        }

        const socket = socketRef.current;

        if (socket.readyState === WebSocket.OPEN) {
            socket.send('\x03');

            setTimeout(() => {
                const cmd = `clear && cd /app && ${startCmd}`;
                terminal.current?.write(`${cmd}\r\n`);
                socket.send(`${cmd}\r`);
                socket.send('\n');
            }, 1000);
        }

        prevStartCmdRef.current = startCmd;
    }, [startCmd])

    return (
        <div className="flex flex-col h-full overflow-hidden border-t border-zinc-800 mb-4 pb-5" style={{ paddingBottom: "20px" }}>
            <div className="px-3 py-1 text-sm font-semibold text-gray-300 border-b border-[#333333] bg-black/40 sticky top-0 z-10 flex items-center justify-between">
                <span>Terminal</span>
                <button
                    className="text-gray-400 hover:text-gray-200 p-1"
                    onClick={() => {
                        if (terminal.current) {
                            terminal.current.clear()
                        }
                    }}
                >
                    <span className="text-gray-400 hover:text-gray-200">Clear</span>
                </button>
            </div>
            <div
                ref={xtermRef}
                className="terminal-container flex-1"
                style={{
                    width: "100%",
                    backgroundColor: getThemeColors().background,
                    padding: "4px",
                    minHeight: "200px",
                    display: "flex",
                    flexDirection: "column"
                }}
                aria-label="Terminal window"
                role="application"
                tabIndex={0}
            />
        </div>
    )
}

export default MainTerminalComponent