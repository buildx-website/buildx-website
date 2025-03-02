"use client"
import { useStepsStore } from '@/store/initialStepsAtom';
import { StepType } from '@/types/types';
import { WebContainer } from '@webcontainer/api';
import { useEffect, useState } from 'react';

export function Web({ webcontainer }: { webcontainer: WebContainer | null }) {
    const [url, setUrl] = useState<string | null>(null);
    const { steps, updateStep } = useStepsStore();
    const [serverReady, setServerReady] = useState(false);

    function startServer() {
        console.log("Starting server...");
        webcontainer?.on('server-ready', (port, url) => {
            console.log(`Server ready on port ${port}`);
            console.log(`Server ready at ${url}`);
            setUrl(url);
            setServerReady(true);
        });
    }

    async function runCommands() {
        const stepsToRun = steps.filter(step => step.status !== "completed" && step.type === StepType.RunScript);

        console.log("Steps to run:", stepsToRun);
        for (const step of stepsToRun) {
            console.log("Running step:", step);

            const commands = (step?.code)?.split("\n") || [];
            for (const command of commands) {
                let response = "";
                const data = command.trim();
                if (data === "") {
                    continue;
                }
                const cmd = data.split(" ") || [];
                console.log("Now Running:", cmd[0], cmd.slice(1));
                const run = await webcontainer?.spawn(cmd[0], cmd.slice(1));
                run?.output.pipeTo(new WritableStream({
                    write(data) {
                        response += data;
                    }
                }));
                const code = await run?.exit;
                console.log("response: ", response);
                if (code === 0) {
                    updateStep({ id: step.id, status: "completed", title: step.title, description: step.description, type: step.type });
                } else {
                    updateStep({ id: step.id, status: "failed", title: step.title, description: step.description, type: step.type });
                }
            }


        }
    }

    useEffect(() => {
        console.log("Steps", steps);
        runCommands().then(() => {
            startServer();
        }
        );
    }, []);

    return (
        <>
            {!url && <p>Starting server...</p>}
            {url && <iframe src={url} height={"100%"} width={"100%"} />}
        </>
    )
}
