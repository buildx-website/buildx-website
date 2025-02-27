import { getApiKey } from "@/lib/apiKey";
import { llm } from "@/lib/llm";
import { chatStream } from "@/lib/llm/chat";
import { chatBodyTypes } from "@/types/types";

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const parsedData = chatBodyTypes.safeParse(body);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
        }

        const userId = req.headers.get("X-User-Id") || "";
        const apiKey = (await getApiKey(userId)) || "";

        const prompt = parsedData.data.prompt;
        const messages = parsedData.data.messages;

        const stream = new ReadableStream({
            async start(controller) {
                await chatStream(llm(apiKey), prompt, messages, (token) => {
                    if (token) {
                        console.log("Token: ", token);
                        controller.enqueue(new TextEncoder().encode(token));
                    }
                });
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error) {
        console.error("Error parsing data", error);
        return new Response("Error parsing data", { status: 500 });
    }
}
