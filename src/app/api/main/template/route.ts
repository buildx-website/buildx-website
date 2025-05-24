
import { defaultLLM } from "@/lib/llm";
import { chat } from "@/lib/llm/chat";
import { getTempleteTypes } from "@/types/types";

export async function POST(req: Request) {
    const data = await req.json();
    try {
        const parsedData = getTempleteTypes.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ err: "Zod Error" }), { status: 400 });
        }
        const { prompt } = parsedData.data;

        const response = await chat(defaultLLM(), prompt);

        if (response.content?.toLowerCase().includes("react")) {
            return new Response(JSON.stringify({
                framework: "react"
            }))
        } else if (response.content?.toLowerCase().includes("nextjs")) {
            return new Response(JSON.stringify({
                framework: "nextjs"
            }))
        } else if (response.content?.toLowerCase().includes("node")) {
            return new Response(JSON.stringify({
                framework: "node"
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
