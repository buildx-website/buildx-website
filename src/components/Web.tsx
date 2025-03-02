"use client"
import { useStepsStore } from "@/store/initialStepsAtom"
import { StepType } from "@/types/types"
import type { WebContainer } from "@webcontainer/api"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Terminal, Play, Square, ChevronUp, ChevronDown, Send, Loader2, Server } from "lucide-react"
import { cn } from "@/lib/utils"

export function Web({ webcontainer }: { webcontainer: WebContainer | null }) {
    const [url, setUrl] = useState<string | null>(null)
    const [serverStatus, setServerStatus] = useState<"starting" | "running" | "stopped">("starting")
    const [commandInput, setCommandInput] = useState("")
    const [commandOutput, setCommandOutput] = useState("")
    const [isExecuting, setIsExecuting] = useState(false)
    const [showTerminal, setShowTerminal] = useState(false)
    const { steps, updateStep } = useStepsStore()
    //   eslint-disable-next-line
    const serverProcess = useRef<any>(null)
    const terminalRef = useRef<HTMLDivElement>(null)

    const startServer = useCallback(async () => {
        if (!webcontainer || serverStatus === "running") return

        console.log("Starting server...")
        setServerStatus("starting")
        setCommandOutput((prev) => prev + "\n> Starting server...\n")
        setShowTerminal(true)

        webcontainer.on("server-ready", (port, url) => {
            console.log(`Server ready on port ${port}`)
            console.log(`Server ready at ${url}`)
            setUrl(url)
            setServerStatus("running")
            setCommandOutput((prev) => prev + `\n> Server ready at ${url}\n`)
        })

        // Find the start command from steps
        const startStep = steps.find(
            (step) =>
                step.type === StepType.RunScript &&
                (step.code?.includes("npm run dev") ||
                    step.code?.includes("yarn dev") ||
                    step.code?.includes("npm run start") ||
                    step.code?.includes("yarn start")),
        )

        if (startStep) {
            const command = startStep.code?.trim().split(" ") || []
            if (command.length > 0) {
                setCommandOutput((prev) => prev + `\n> Running ${command.join(" ")}\n`)
                serverProcess.current = await webcontainer.spawn(command[0], command.slice(1))

                serverProcess.current.output.pipeTo(
                    new WritableStream({
                        write(data) {
                            setCommandOutput((prev) => prev + data)
                            console.log("%c" + data, "display: inline;")
                            if (terminalRef.current) {
                                terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                            }
                        },
                    }),
                )

                console.log("Server process started")
            }
        } else {
            // Default to npm run dev if no start command found
            setCommandOutput((prev) => prev + "\n> Running npm run dev\n")
            serverProcess.current = await webcontainer.spawn("npm", ["run", "dev"])

            serverProcess.current.output.pipeTo(
                new WritableStream({
                    write(data) {
                        setCommandOutput((prev) => prev + data)
                        console.log("%c" + data, "display: inline;")
                        if (terminalRef.current) {
                            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                        }
                    },
                }),
            )

            console.log("Server process started with default command")
        }
    }, [steps, webcontainer, serverStatus])

    async function stopServer() {
        if (!serverProcess.current || serverStatus !== "running") return

        console.log("Stopping server...")
        setCommandOutput((prev) => prev + "\n> Stopping server...\n")

        try {
            // Kill the server process
            await serverProcess.current.kill()
            serverProcess.current = null
            setUrl(null)
            setServerStatus("stopped")
            setCommandOutput((prev) => prev + "> Server stopped\n")
            console.log("Server stopped")
        } catch (error) {
            console.error("Error stopping server:", error)
            setCommandOutput((prev) => prev + `> Error stopping server: ${error}\n`)
        }
    }

    async function runCommand() {
        if (!webcontainer || !commandInput.trim() || isExecuting) return

        setIsExecuting(true)
        setShowTerminal(true)
        const cmd = commandInput.trim()
        setCommandOutput((prev) => prev + `\n> ${cmd}\n`)
        setCommandInput("")

        try {
            const parts = cmd.split(" ")
            const command = parts[0]
            const args = parts.slice(1)

            console.log("Running command:", command, args)

            const process = await webcontainer.spawn(command, args)

            process.output.pipeTo(
                new WritableStream({
                    write(data) {
                        setCommandOutput((prev) => prev + data)
                        console.log("%c" + data, "display: inline;")
                        if (terminalRef.current) {
                            terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                        }
                    },
                }),
            )

            const exitCode = await process.exit
            console.log("Command exit code:", exitCode)

            if (exitCode !== 0) {
                setCommandOutput((prev) => prev + `\n> Command exited with code ${exitCode}\n`)
            } else {
                setCommandOutput((prev) => prev + `\n> Command completed successfully\n`)
            }
        } catch (error) {
            console.error("Error running command:", error)
            setCommandOutput((prev) => prev + `\n> Error: ${error instanceof Error ? error.message : String(error)}\n`)
        } finally {
            setIsExecuting(false)
        }
    }

    const runCommands = useCallback(async () => {
        const stepsToRun = steps.filter((step) => step.status !== "completed" && step.type === StepType.RunScript)

        console.log("Steps to run:", stepsToRun)
        setShowTerminal(true)

        for (const step of stepsToRun) {
            console.log("Running step:", step)
            setCommandOutput((prev) => prev + `\n> Running step: ${step.title}\n`)

            const commands = step?.code?.split("\n") || []
            for (const command of commands) {
                let response = ""
                const data = command.trim()
                if (data === "") {
                    continue
                }
                const cmd = data.split(" ") || []
                console.log("Now Running:", cmd[0], cmd.slice(1))
                setCommandOutput((prev) => prev + `\n> ${data}\n`)

                if (data == "npm run dev" || data == "yarn dev" || data == "npm run start" || data == "yarn start") {
                    serverProcess.current = await webcontainer?.spawn(cmd[0], cmd.slice(1))

                    serverProcess.current.output.pipeTo(
                        new WritableStream({
                            write(data) {
                                setCommandOutput((prev) => prev + data)
                                console.log("%c" + data, "display: inline;")
                                if (terminalRef.current) {
                                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                                }
                            },
                        }),
                    )

                    updateStep({
                        id: step.id,
                        status: "completed",
                        title: step.title,
                        description: step.description,
                        type: step.type,
                    })
                } else {
                    const run = await webcontainer?.spawn(cmd[0], cmd.slice(1))
                    run?.output.pipeTo(
                        new WritableStream({
                            write(data) {
                                response += data
                                setCommandOutput((prev) => prev + data)
                                console.log("%c" + data, "display: inline;")
                                if (terminalRef.current) {
                                    terminalRef.current.scrollTop = terminalRef.current.scrollHeight
                                }
                            },
                        }),
                    )

                    const code = await run?.exit
                    console.log("code: ", code)
                    console.log("response: ", response)
                    if (code === 0) {
                        updateStep({
                            id: step.id,
                            status: "completed",
                            title: step.title,
                            description: step.description,
                            type: step.type,
                        })
                        setCommandOutput((prev) => prev + `\n> Command completed successfully\n`)
                    } else {
                        updateStep({
                            id: step.id,
                            status: "failed",
                            title: step.title,
                            description: step.description,
                            type: step.type,
                        })
                        setCommandOutput((prev) => prev + `\n> Command failed with code ${code}\n`)
                    }
                }
            }
        }
    }, [steps, updateStep, webcontainer])

    useEffect(() => {
        console.log("Steps", steps)
        runCommands().then(() => {
            // Server will be started by runCommands if there's a start command
            if (serverStatus === "starting" && !url) {
                startServer()
            }
        })
    }, [steps, url, serverStatus, runCommands, startServer])

    const toggleTerminal = () => {
        setShowTerminal(!showTerminal)
    }

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-1 relative">
                {serverStatus === "starting" && !url && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-lg">Starting server...</p>
                    </div>
                )}
                {serverStatus === "stopped" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-2">
                        <Server className="h-8 w-8 text-muted-foreground" />
                        <p className="text-lg">Server is stopped</p>
                        <Button onClick={startServer} disabled={!webcontainer} variant="default" className="mt-2">
                            Start Server
                        </Button>
                    </div>
                )}
                {url && <iframe src={url} height="100%" width="100%" className="border-0" />}
            </div>

            {/* Terminal Panel */}
            <div
                className={cn(
                    "bg-black text-green-400 transition-all duration-300 ease-in-out border-t border-gray-700",
                    showTerminal ? "h-[200px]" : "h-0 overflow-hidden",
                )}
            >
                <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <Terminal size={16} />
                        <span className="font-bold">Terminal</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTerminal}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </div>
                <div ref={terminalRef} className="p-3 font-mono text-sm overflow-auto h-[calc(100%-36px)]">
                    <pre className="whitespace-pre-wrap">{commandOutput || "Terminal ready. Run a command to see output."}</pre>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="p-3 border-t bg-muted/30 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={startServer}
                        disabled={serverStatus === "running" || !webcontainer}
                        variant="outline"
                        size="sm"
                        className="text-green-600 flex items-center gap-1"
                    >
                        <Play className="h-3.5 w-3.5" />
                        Start Server
                    </Button>
                    <Button
                        onClick={stopServer}
                        disabled={serverStatus !== "running" || !webcontainer}
                        variant="outline"
                        size="sm"
                        className="text-red-600 flex items-center gap-1"
                    >
                        <Square className="h-3.5 w-3.5" />
                        Stop Server
                    </Button>
                    <Button onClick={toggleTerminal} variant="outline" size="sm" className="flex items-center gap-1">
                        <Terminal className="h-3.5 w-3.5" />
                        {showTerminal ? "Hide Terminal" : "Show Terminal"}
                        {showTerminal ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
                    </Button>
                </div>

                <div className="flex-1 flex items-center gap-2 ml-auto">
                    <Input
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        placeholder="Enter command (e.g., npm install express)"
                        className="text-sm"
                        onKeyDown={(e) => e.key === "Enter" && runCommand()}
                        disabled={isExecuting || !webcontainer}
                    />
                    <Button
                        onClick={runCommand}
                        disabled={isExecuting || !commandInput.trim() || !webcontainer}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-1"
                    >
                        {isExecuting ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <Send className="h-3.5 w-3.5" />
                                Run
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}

