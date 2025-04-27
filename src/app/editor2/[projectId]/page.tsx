"use client"

import { EditorInterface } from "@/components/editor-interface"
import { useStepsStore } from "@/store/initialStepsAtom";
import { useMessagesStore } from "@/store/messagesAtom";
import { useRouter, useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, PanelRight, PanelRightClose } from "lucide-react";
import { SendPrompt } from "@/components/SendPrompt";
import { ContainerPort, Content, Message, } from "@/types/types";
import { StepList } from "@/components/StepList";
import { MessageComponent } from "@/components/Messages";
import { User } from "@/components/User";
import { extractAndParseStepsFromMessages } from "@/lib/extract-parse-steps";
import { startNewContainer } from "@/lib/worker-config";
import { ArtifactParser } from "@/lib/artifactParser";
import { useUser } from "@/hooks/useUser";
import Loading from "@/app/loading";
import { BrowserPreview } from "@/components/WebPreview/browser-preview";

import {
    Sidebar,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
} from "@/components/ui/sidebar"

export default function Editor() {
    const router = useRouter();
    const { user, isLoggedIn } = useUser();
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const { messages, addMessage, setMessages } = useMessagesStore();
    const { steps, setSteps, addSteps } = useStepsStore();

    const [prompt, setPrompt] = useState("");
    const [framework, setFramework] = useState<string>("");

    const [containerId, setContainerId] = useState<string>("");
    const [containerStatus, setContainerStatus] = useState<string>("");
    const [showConversation, setShowConversation] = useState(true)

    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [uiMsgs, setUiMsgs] = useState<Message[]>([]);
    const [building, setBuilding] = useState(false);
    const conversationRef = useRef<HTMLDivElement>(null);
    const [validationError, setValidationError] = useState<string>("");
    const [project, setProject] = useState<any | null>(null);
    const [currentActionBuilding, setCurrentActionBuilding] = useState<string | null>(null);

    const [containerPort, setContainerPort] = useState<ContainerPort[]>([{}]);

    const params = useParams()
    const projectId = params.projectId as string

    useEffect(() => {
        if (!projectId) {
            router.push("/");
            return;
        }
        const validateAndLoadProject = async () => {
            setLoading(true);
            try {
                if (!isLoggedIn) {
                    setValidationError("Authentication required");
                    router.push("/");
                    return;
                }

                const response = await fetch(`/api/main/project/${projectId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    setValidationError(data.message || 'Invalid project ID or access denied');
                    router.push("/");
                    return;
                }

                const projectData = await response.json();
                console.log("Project", projectData)
                setProject(projectData);
                setFramework(projectData.framework);

                if (projectData.messages.length === 0) {
                    await saveMsg(messages.slice(0, messages.length - 1));
                    const lastUserMessage = messages.filter(msg => msg.role === "user").pop();
                    if (lastUserMessage) {
                        console.log("Sending last user message: ", lastUserMessage);
                        send(lastUserMessage.content, projectData.framework);
                    }
                }

                if (projectData.messages && projectData.messages.length > 0) {
                    setMessages(projectData.messages);

                    const extractedSteps = extractAndParseStepsFromMessages(projectData.messages);
                    console.log("Extracted steps", extractedSteps);
                    setSteps(extractedSteps);

                    const displayMessages = projectData.messages
                        .filter((msg: Message) => !msg.ignoreInUI)
                        .map((msg: Message) => {
                            if (msg.role === "assistant" && msg.content.length > 0) {
                                return {
                                    ...msg,
                                    content: msg.content.map((content: Content) => ({
                                        ...content,
                                        text: (content.text
                                            ? `\n\n**Content before response:**\n${content.text}`
                                                .replace(
                                                    /<boltArtifact[\s\S]*?<\/boltArtifact>([\s\S]*)/,
                                                    (match, after) =>
                                                        after.trim()
                                                            ? `\n\n**Content after response:**\n${after.trim()}`
                                                            : ""
                                                )
                                            : "")

                                    }))
                                };
                            }
                            return msg;
                        }) || [];

                    setUiMsgs(displayMessages);
                }

                setInitialLoadComplete(true);
            } catch (error) {
                console.error("Error validating project:", error);
                setValidationError('Error loading project data');
                router.push("/");
            } finally {
                setLoading(false);
            }
        };

        validateAndLoadProject();
    }, []);

    useEffect(() => {
        if (project == null) {
            console.log("Project is null");
            return;
        }

        const startContainer = async () => {
            try {
                const image = project?.framework === "REACT" ? "buildx-react" : "null";
                console.log("Image: ", image);
                console.log("Starting container with image:", image);

                const data = await startNewContainer(image, "tail -f /dev/null", ["3000"]);
                console.log("Container started", data);

                setContainerId(data.containerId);
                setContainerStatus(data.status);
                setContainerPort(data.urls);

            } catch (error) {
                console.error("Error starting container:", error);
            };
        }
        startContainer();
    }, [project])

    useEffect(() => {
        if (conversationRef.current) {
            conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
    }, [uiMsgs]);

    async function saveMsg(msg: Message[]) {
        try {
            await fetch(`/api/main/save-project`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId,
                    messages: msg,
                })
            });
        } catch (error) {
            console.error("Error saving project state:", error);
        }
    }

    async function send(content: Content[], projectFramework: string) {
        try {
            setIsStreaming(true);
            setUiMsgs(prev => [...prev, { role: "user", content: content }]);
            setUiMsgs(prev => [...prev, { role: "assistant", content: [], loading: true }]);

            const prompt = content.map((c) => c.text).join(" ");
            console.log("Prompt: ", prompt);

            await saveMsg([{
                role: "user",
                content: content,
                ignoreInUI: false
            }]);

            const response = await fetch('/api/main/chat', {
                method: 'POST',
                body: JSON.stringify({
                    messages,
                    prompt,
                    framework: projectFramework,
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (!response.body) {
                throw new Error("Response body is null");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponseText = "";

            const artifactParser = new ArtifactParser();

            while (true) {
                const { done, value } = await reader.read();
                setBuilding(true);
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                artifactParser.addChunk(chunk);
                const newStep = artifactParser.getStep();
                const currentAction = artifactParser.getCurrentActionTitle();
                if (currentAction) {
                    // console.log("Current action: ", currentAction);
                    setCurrentActionBuilding(currentAction);
                }
                if (newStep) {
                    console.log("New step: ", newStep);
                    addSteps([newStep]);
                }
                fullResponseText += chunk;

                // add the content before the XML to the visible response text
                const contentBeforeArtifact = artifactParser.getContentBeforeArtifact();
                if (contentBeforeArtifact) {
                    await setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            ...newMsgs[newMsgs.length - 1],
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: contentBeforeArtifact
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }

                if (contentBeforeArtifact.trim() == "") {
                    setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            ...newMsgs[newMsgs.length - 1],
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: "Okay, Building it..."
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }
                const contentAfterArtifact = artifactParser.getContentAfterArtifact();
                if (contentAfterArtifact) {
                    await setUiMsgs(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1] = {
                            role: "assistant",
                            content: [{
                                type: "text",
                                text: contentAfterArtifact
                            }],
                            loading: false
                        };
                        return newMsgs;
                    });
                }

            }

            while (artifactParser.getActions().length > 0) {
                const step = artifactParser.getStep();
                if (step) {
                    addSteps([step]);
                }
            }
            const currentAction = artifactParser.getCurrentActionTitle();
            // console.log("Current action222: ", currentAction);
            setCurrentActionBuilding(currentAction);

            const newMsg: Message = {
                role: "assistant",
                content: [{
                    type: "text",
                    text: fullResponseText
                }],
                ignoreInUI: false
            };
            addMessage(newMsg);
            setIsStreaming(false);

            setUiMsgs(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0) {
                    newMsgs[newMsgs.length - 1].loading = false;
                }
                return newMsgs;
            });
            setBuilding(false);
            setCurrentActionBuilding(null);
            await saveMsg([newMsg]);

        } catch (e) {
            setUiMsgs(prev => {
                const newMsgs = [...prev];
                if (newMsgs.length > 0) {
                    newMsgs[newMsgs.length - 1].loading = false;
                }
                return newMsgs;
            });
            console.error("Error sending message: ", e);
            setIsStreaming(false);
        }
    }

    async function handleSubmit() {
        if (prompt.trim() === "" || isStreaming || building || !initialLoadComplete) return

        const userMsg: Message = {
            role: "user",
            content: [{
                type: "text",
                text: prompt
            }]
        };

        addMessage(userMsg);
        send(userMsg.content, framework);
        setPrompt("");
    }

    if (loading) {
        return (
            <Loading />
        );
    }

    if (validationError) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#1E1E1E] text-white">
                <h2 className="text-xl font-medium mb-4">Project Error</h2>
                <p className="text-red-400">{validationError}</p>
                <Button
                    className="mt-6"
                    onClick={() => router.push("/")}
                >
                    Return to Projects
                </Button>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex flex-row h-screen w-screen">
                <Sidebar className="bg-black border-r border-zinc-950">
                    <SidebarHeader className="p-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size='lg'
                                    className="flex justify-center"
                                    onClick={() => setShowConversation(!showConversation)}
                                    tooltip="Toggle Conversation"
                                >
                                    {showConversation ? (
                                        <PanelRightClose
                                            className="text-gray-200"
                                            size={30}
                                        />
                                    ) : (
                                        <PanelRight
                                            className="text-gray-200"
                                            size={30}
                                        />
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>
                </Sidebar>

                <main className="h-screen w-full flex flex-1 flex-col md:grid md:grid-cols-4 gap-0 p-0 bg-[#121212] overflow-hidden">
                    {showConversation && (
                        <div className="h-[40vh] md:h-auto md:col-span-1 flex flex-col overflow-hidden shadow-lg px-2">
                            <div className="p-4 flex flex-row gap-2 my-auto">
                                <h2 className="text-lg font-medium text-gray-200 my-auto">Conversation</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide gap-3" ref={conversationRef}>
                                {uiMsgs.map((msg, idx) => (
                                    <MessageComponent key={idx} message={msg} loading={isStreaming} />
                                ))}
                            </div>

                            <div className="p-4">
                                <StepList StepTitle={currentActionBuilding} steps={steps} building={building} setPrompt={setPrompt} />
                                <SendPrompt handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} disabled={isStreaming} />
                            </div>
                        </div>
                    )}

                    <div
                        className={`flex-1 ${showConversation ? "md:col-span-3" : "md:col-span-4"} flex flex-col bg-black/10 text-white rounded-xl overflow-hidden shadow-lg`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                            <div className="flex items-center gap-3 sm:gap-6">
                                <h2 className="text-lg font-medium text-gray-200">{showPreview ? "Preview" : "Code"}</h2>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${!showPreview ? "text-gray-300" : "text-gray-500"}`}>Code</span>
                                    <Switch
                                        checked={showPreview}
                                        onCheckedChange={setShowPreview}
                                        className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-gray-800"
                                    />
                                    <span className={`text-sm ${showPreview ? "text-gray-300" : "text-gray-500"}`}>Preview</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-700 hover:bg-gray-800"
                                    onClick={() => {
                                        // handleDownload(files, projectId);
                                    }}
                                >
                                    <Download size={16} />
                                </Button>
                                <User user={user} />
                            </div>
                        </div>

                        <div className={`flex-1 overflow-hidden ${showPreview ? "hidden" : "block"}`}>
                            <EditorInterface containerId={containerId} />
                        </div>

                        <div className={`flex-1 overflow-hidden ${showPreview ? "block" : "hidden"}`}>
                            <BrowserPreview containerPort={containerPort} height="100%" width="100%" />
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}