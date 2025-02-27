import { getApiKey } from "@/lib/apiKey";
import { llm } from "@/lib/llm";
import { chat } from "@/lib/llm/chat";
import { getTempleteTypes } from "@/types/types";

export async function POST(req: Request) {
    const data = await req.json();
    try {
        const parsedData = getTempleteTypes.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify(parsedData.error), { status: 400 });
        }
        const { prompt } = parsedData.data;
        const userId = req.headers.get('X-User-Id') || '';
        const apiKey = await getApiKey(userId) || '';

        const response = await chat(llm(apiKey), prompt);
        console.log("Response: ", response);

        return new Response(JSON.stringify({ response }), { status: 200 });
    } catch (error) {
        console.error("Error parsing data", error);
        return new Response("Error parsing data", { status: 500 });
    }
}
