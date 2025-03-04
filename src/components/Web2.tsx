"use client";

import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react"
import { Step, StepType } from "@/types/types";
import { useStepsStore } from "@/store/initialStepsAtom";

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

    useEffect(() => {
        async function run() {
            if (webcontainer && !runInitialCmd) {
                setRunningCmd("npm i");
                const inatall = await webcontainer.spawn("npm", ['i']);
                await inatall.exit;
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
                        console.log("running", commandName, args);
                        if (fullCommand === "npm start" || fullCommand === "npm run start" || fullCommand === "npm run dev" || fullCommand === "npm run serve" || fullCommand === "npm run server" || fullCommand === "npm run start:dev" || fullCommand === "npm run start:serve" || fullCommand === "npm run start:server") {
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
        }
    }, [stepsToRun, runInitialCmd]);



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
                {url && <iframe src={url} height="100%" width="100%" className="border-0" />}
                {runningCmd && (
                    <div className="absolute bottom-0 right-0 bg-background/80 p-2 rounded-tl-md">
                        <p className="text-sm text-white">{runningCmd}</p>
                        {url}
                    </div>
                )}
            </div>
        </div>
    )
}