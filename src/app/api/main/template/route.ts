import { getApiKey } from "@/lib/apiKey";
import { baseNodePrompt } from "@/lib/defaults/node";
import { baseReactPrompt } from "@/lib/defaults/react";
import { llm } from "@/lib/llm";
import { chat } from "@/lib/llm/chat";
import { BASE_PROMPT } from "@/lib/prompts";
import { getTempleteTypes } from "@/types/types";

export async function POST(req: Request) {
    const data = await req.json();
    try {
        const parsedData = getTempleteTypes.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ err: "Zod Error" }), { status: 400 });
        }
        const { prompt } = parsedData.data;
        const userId = req.headers.get('X-User-Id') || '';
        let apiKey = await getApiKey(userId) || '';
        if (!apiKey) {
            apiKey = process.env.OPENROUTER_API_KEY || '';
        }

        const response = await chat(llm(apiKey), prompt);

        if (response.content === "react") {
            return new Response(JSON.stringify({
                prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${baseReactPrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [baseReactPrompt],
            }))
        }

        if (response.content === "node") {
            return new Response(JSON.stringify({
                prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${baseNodePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                uiPrompts: [baseNodePrompt],
            }))
        }

        return new Response(JSON.stringify({
            message: "Try again with a different prompt",
        }))

    } catch (error) {
        if (error instanceof Error) {
            console.log("Inside error: ", error.message);
            if (error.message === "401 No auth credentials found") {
                return new Response(JSON.stringify({
                    error: "Check your API key in your profile and try again",
                }), { status: 401 });
            }
            return new Response(JSON.stringify({
                error: error.message,
            }), { status: 500 });
        } else {
            console.log("Inside error: ", error);
            return new Response(JSON.stringify({
                error: "An unknown error occurred",
            }), { status: 500 });
        }
    }
}
