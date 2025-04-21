import { WebContainer } from "@webcontainer/api";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Code, Loader2, RefreshCw, Terminal as TerminalIcon } from "lucide-react";
import { Step, StepType } from "@/types/types";
import { useStepsStore } from "@/store/initialStepsAtom";
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { Button } from "./ui/button";
// import { CustomTerminal } from "./CustomTerminal";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    const [activeTab, setActiveTab] = useState('console');

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
            terminalInstance.current.resize(120, 10);
            terminalInstance.current.write('$ ');

            if (terminalInstance.current) {
                let commandBuffer = '';
                interface SpawnProcess {
                    kill: () => void;
                    output: ReadableStream;
                    exit: Promise<number>;
                }
                let currentProcess: { process: SpawnProcess | null; killed: boolean } | null = null;

                terminalInstance.current.onData(async (data) => {
                    if (currentProcess?.killed) {
                        currentProcess = null;
                    }

                    if (data === '\x7f') {
                        if (commandBuffer.length > 0) {
                            commandBuffer = commandBuffer.slice(0, -1);
                            terminalInstance.current?.write('\b \b');
                        }
                        return;
                    }

                    if (data === '\x03') {
                        terminalInstance.current?.write('^C\r\n$ ');
                        if (currentProcess?.process) {
                            try {
                                await currentProcess.process.kill();
                                currentProcess.killed = true;
                            } catch (error) {
                                console.error('Failed to kill process:', error);
                            }
                        }
                        commandBuffer = '';
                        return;
                    }

                    if (data === '\r') {
                        const trimmedCommand = commandBuffer.trim();
                        terminalInstance.current?.write('\r\n');

                        if (trimmedCommand) {
                            const parts = trimmedCommand.split(' ');
                            const cmd = parts[0];
                            const args = parts.slice(1);

                            if (cmd === 'clear' || cmd === 'cls') {
                                terminalInstance.current?.clear();
                                commandBuffer = '';
                                terminalInstance.current?.write('$ ');
                                return;
                            }

                            try {
                                const process = await webcontainer?.spawn(cmd, args);
                                if (process) {
                                    currentProcess = { process, killed: false };

                                    process.output.pipeTo(new WritableStream({
                                        write(data) {
                                            terminalInstance.current?.write(data);
                                        }
                                    }));

                                    await process.exit;
                                    if (!currentProcess.killed) {
                                        terminalInstance.current?.write('\r\n$ ');
                                    }
                                }
                            } catch (error) {
                                console.error('Error spawning process:', error)
                                terminalInstance.current?.write(`\r\nCommand not found: ${cmd}\r\n$ `);
                            }
                        } else {
                            terminalInstance.current?.write('$ ');
                        }

                        commandBuffer = '';
                        return;
                    }

                    commandBuffer += data;
                    terminalInstance.current?.write(data);
                });

                return () => {
                    terminalInstance.current?.dispose();
                };
            }
        }
    }, [webcontainer]);

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
                setRunningCmd("npm i --yes");
                const install = await webcontainer.spawn("npm", ['i', '--yes']);
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
        if (runInitialCmd && !serverStart) {
            webcontainer?.on('server-ready', (port, url) => {
                setUrl(url);
                setServerStart(true);
                sendOutputToTerminal(`\n > Server ready at ${url} \n`);
            })
        }
    }, [webcontainer, runInitialCmd]);

    useEffect(() => {
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
            if (commandName === 'npm' && (args.includes('install') || args.includes('i'))) {
                args.push('--yes');
            }
            if (commandName === 'npx') {
                const fullCommand = `echo 'y' | ${command.join(" ")}`;
                return { commandName: 'sh', args: ['-c', fullCommand], fullCommand };
            }

            const fullCommand = [commandName, ...args].join(" ");
            console.log(`Parsed command: ${fullCommand}`);
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
                        let errorOutput = '';

                        run?.output.pipeTo(new WritableStream({
                            write(data) {
                                if (data.includes('Error') || data.includes('error')) {
                                    errorOutput += data;
                                }
                                sendOutputToTerminal(data);
                            }
                        }));

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
                            await updateStep({
                                ...step,
                                _executed: true,
                                status: "completed"
                            });
                        } else {
                            await updateStep({
                                ...step,
                                _executed: true,
                                status: "failed",
                                error: errorOutput || `Command failed with exit code ${exit}`
                            });
                        }
                    } else {
                        await updateStep({
                            ...step,
                            _executed: true,
                            status: "failed",
                            error: `Invalid command: '${step.code}'`
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

    return (
        <div className="flex flex-col h-full relative">
            <div className="flex-1 relative">
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

            <div className="w-full border-t">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between">
                            <TabsList className="grid w-[400px] grid-cols-2">
                                <TabsTrigger value="console" className="flex items-center gap-2">
                                    <Code className="h-4 w-4" /> Console Logs
                                </TabsTrigger>
                                <TabsTrigger value="terminal" className="flex items-center gap-2">
                                    <TerminalIcon className="h-4 w-4" /> Custom Terminal
                                </TabsTrigger>
                            </TabsList>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTerminal}
                                className="ml-2"
                            >
                                {isTerminalOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronUp className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </Tabs>
                </div>

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isTerminalOpen ? 'h-[200px]' : 'h-0'}`}>
                    <Tabs defaultValue={activeTab} value={activeTab}>
                        <div
                            ref={terminalRef}
                            className={`w-full h-full bg-[#212121] p-2 ${activeTab === 'console' ? 'block' : 'hidden'}`}
                        />
                        <div className={`w-full h-full bg-[#212121] p-2 ${activeTab === 'terminal' ? 'block' : 'hidden'}`}>
                            {/* <CustomTerminal webcontainer={webcontainer} /> */}
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

