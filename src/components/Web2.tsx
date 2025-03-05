"use client";

import { WebContainer } from "@webcontainer/api";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react"
import { Step, StepType } from "@/types/types";
import { useStepsStore } from "@/store/initialStepsAtom";
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { Button } from "./ui/button";
import { CustomTerminal } from "./CustomTerminal";

interface Web2Props {
    webcontainer: WebContainer | null
    url: string | null
    setUrl: (url: string) => void
}

export function Web2({ webcontainer, url, setUrl }: Web2Props) {
    const { steps, updateStep } = useStepsStore()
    const [runInitialCmd, setRunInitialCmd] = useState(false);
    const [runningCmd, setRunningCmd] = useState("");
    const [serverStart, setServerStart] = useState(false);
    const [stepsToRun, setStepsToRun] = useState<Step[]>([]);
    const [stepsRan, setStepsRan] = useState<number>(0);
    const terminalRef = useRef<HTMLDivElement>(null);
    const terminalInstance = useRef<Terminal | null>(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalInstance.current = new Terminal({
                convertEol: true,
                cursorBlink: true,
                fontSize: 14,
                fontFamily: 'Fira Code, Consolas, monospace',
                theme: {
                    background: '#212121',
                    foreground: '#e6e6e6',
                    black: '#000000',
                    red: '#ff6b6b',
                    green: '#4ecdc4',
                    yellow: '#ffeb3b',
                    blue: '#5f9ea0',
                    magenta: '#ff9ff3',
                    cyan: '#48dbfb',
                    white: '#ffffff',
                    brightBlack: '#545454',
                    brightRed: '#ff5252',
                    brightGreen: '#34e7e4',
                    brightYellow: '#ffd700',
                    brightBlue: '#5f9ea0',
                    brightMagenta: '#ff6b6b',
                    brightCyan: '#48dbfb',
                    brightWhite: '#ffffff'
                }
            });
            terminalInstance.current.open(terminalRef.current);
            terminalInstance.current.resize(120, 20);

            return () => {
                terminalInstance.current?.dispose();
            };
        }
    }, []);

    const refreshPage = () => {
        if (iframeRef.current) {
            iframeRef.current.src = url || '';
        }
    };

    async function sendOutputToTerminal(output: string) {
        if (output.trim() === "") {
            return;
        }
        terminalInstance.current?.write(`${output}\n`);
    }

    useEffect(() => {
        sendOutputToTerminal(`${runningCmd}`);
    }, [runningCmd])

    useEffect(() => {
        webcontainer?.on('error', (error) => {
            sendOutputToTerminal(`\n >Error: ${error} \n`);
        })
    }, [webcontainer])

    useEffect(() => {
        async function run() {
            if (webcontainer && !runInitialCmd) {
                setRunningCmd("npm i");
                const install = await webcontainer.spawn("npm", ['i']);
                install.output.pipeTo(new WritableStream({
                    write(data) {
                        sendOutputToTerminal(data);
                    }
                }));

                await install.exit;
                setRunInitialCmd(true);
            }
        }
        run();
    }, [webcontainer])

    useEffect(() => {
        console.log("inside useeffect", runInitialCmd, serverStart, url);
        if (runInitialCmd && !serverStart) {
            webcontainer?.on('server-ready', (port, url) => {
                setUrl(url);
                setServerStart(true);
                console.log('Server ready at', url, 'port', port);
                sendOutputToTerminal(`\n > Server ready at ${url} \n`);
            })
        }
    }, [webcontainer, runInitialCmd]);

    useEffect(() => {
        console.log("steps", steps);
        const oldStepsLength = stepsRan;
        const newStepsLength = steps.length;
        const diff = newStepsLength - oldStepsLength;
        if (diff > 0) {
            const newSteps = steps.slice(oldStepsLength, newStepsLength);
            const newCodeSteps: Step[] = newSteps.filter((step: Step) => {
                return step.type === StepType.RunScript && step.status === "pending";
            })
            setStepsToRun((prev) => [...prev, ...newCodeSteps]);
        };
        setStepsRan(newStepsLength);
    }, [steps]);


    async function parseCmd(cmd: string) {
        const command = cmd.split(" ") || [];
        if (command.length > 0) {
            const commandName = command[0];
            const args = command.slice(1);
            const fullCommand = command.join(" ");
            return { commandName, args, fullCommand };
        }
        return { commandName: "", args: [] };

    }

    useEffect(() => {
        if (stepsToRun.length > 0 && runInitialCmd) {
            const step = stepsToRun[0];
            const runStep = async () => {
                if (step.type === StepType.RunScript) {
                    setRunningCmd(step.code || "");
                    const { commandName, args, fullCommand } = await parseCmd(step.code || "");
                    if (commandName != "") {
                        const run = await webcontainer?.spawn(commandName, args);
                        run?.output.pipeTo(new WritableStream({
                            write(data) {
                                sendOutputToTerminal(data);
                            }
                        }));
                        console.log("running", commandName, args);
                        if (fullCommand === "npm start" || fullCommand === "npm run start" || fullCommand === "npm run dev" || fullCommand === "npm run serve" || fullCommand === "npm run server" || fullCommand === "npm run start:dev" || fullCommand === "npm run start:serve" || fullCommand === "npm run start:server") {
                            setUrl("")
                            await webcontainer?.spawn(commandName, args);
                            updateStep({
                                ...step,
                                _executed: true,
                                status: "completed"
                            })
                            setStepsToRun((prev) => prev.slice(1));
                            return;
                        }
                        const exit = await run?.exit;
                        if (exit === 0) {
                            await
                                updateStep({
                                    ...step,
                                    _executed: true,
                                    status: "completed"
                                });
                        } else {
                            sendOutputToTerminal(`\nError: ${fullCommand} failed with exit code ${exit} \n`);
                            await
                                updateStep({
                                    ...step,
                                    _executed: true,
                                    status: "failed"
                                });
                        }
                    } else {
                        await
                            updateStep({
                                ...step,
                                _executed: true,
                                status: "failed"
                            });
                    }
                    setStepsToRun((prev) => prev.slice(1));
                }
            }
            runStep();
            refreshPage();
        }
    }, [stepsToRun, runInitialCmd]);


    const toggleTerminal = () => {
        setIsTerminalOpen(!isTerminalOpen);
    };

    return <div className="flex flex-col h-full relative">
        < div className="flex-1 relative">
            {!url && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-lg">
                        {runInitialCmd ? "Starting server..." : "Installing dependencies..."}
                    </p>
                </div>
            )}
            {url && (
                <div className="relative h-full w-full">
                    <Button
                        onClick={refreshPage}
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 z-10 bg-background/50 hover:bg-background/80"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <iframe
                        ref={iframeRef}
                        src={url}
                        height="100%"
                        width="100%"
                        className="border-0"
                    />
                </div>
            )}
        </div>
        <div className="w-full flex flex-col gap-1 justify-between border-t p-2">
            <div className="w-full flex items-center px-4 gap-3">
                <div className="text-lg">
                    Terminal Logs
                </div>
                <Button
                    onClick={toggleTerminal}
                    variant={"secondary"}
                    size={'sm'}
                >
                    {isTerminalOpen ? <ChevronDown size={20} /> : <ChevronUp className="" size={20} />}
                </Button>
            </div>
            <div
                ref={terminalRef}
                className={`w-full bg-[#212121] rounded-b-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${isTerminalOpen ? 'h-[200px]' : 'h-0'
                    }`}
            />
        </div>
        <CustomTerminal webcontainer={webcontainer} />
    </div>
}