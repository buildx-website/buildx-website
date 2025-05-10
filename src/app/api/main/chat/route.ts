import { db } from "@/db";
import { getApiKey } from "@/lib/apiKey";
import { llm } from "@/lib/llm";
import { chatStream } from "@/lib/llm/chat";
import { chatBodyTypes } from "@/types/types";

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id") || "";
    const body = await req.json();

    try {
        const parsedData = chatBodyTypes.safeParse(body);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
        }

        const apiKey = (await getApiKey(userId)) || "";
        const messages = parsedData.data.messages;
        const framework = parsedData.data.framework;
        const prompt = parsedData.data.prompt;
        const model = await db.userModels.findFirst({
            where: {
                userId: userId,
            }, include: {
                model: true,
            }
        });
        if (!model) {
            return new Response("No model found", { status: 404 });
        }
        const modelName = model.model.name;
        const modelProvider = model.model.provider;
        console.log("modelProvider", modelProvider);
        if (!modelName) {
            return new Response("No model name found", { status: 404 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                await chatStream(llm(apiKey, modelProvider), messages, prompt, framework, modelName, (token) => {
                    if (token) {
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
