"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { Terminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"

type TerminalProps = {
    containerId: string
    autoFocus?: boolean
}

const MainTerminalComponent: React.FC<TerminalProps> = ({ containerId, autoFocus = true }) => {
    const xtermRef = useRef<HTMLDivElement | null>(null)
    const terminal = useRef<Terminal | null>(null)
    const fitAddon = useRef<FitAddon | null>(null)

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
            socket.send(JSON.stringify({ type: "start", containerId }))
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

        // Send terminal input to WebSocket
        term.onData((data) => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(data)
            }
        })


        // Clean up
        return () => {
            socket.close()
            terminal.current?.dispose()
        }
    }, [containerId])

    return (
        <div className={`overflow-hidden border-t border-zinc-800`}>
            <div
                ref={xtermRef}
                className="terminal-container"
                style={{
                    height: "500px",
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

export default MainTerminalComponent