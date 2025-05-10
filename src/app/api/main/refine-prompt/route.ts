import { defaultLLM } from "@/lib/llm";
import { refinePromptTypes } from "@/types/types";

export async function POST(req: Request) {
    const body = await req.json();
    const userId = req.headers.get("X-User-Id") || "";
    
    try {
        const parsedData = refinePromptTypes.safeParse(body);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
        }

        const parsedPrompt = parsedData.data;
        if (!parsedPrompt || !userId) {
            return new Response("Missing prompt or userId", { status: 400 });
        }   

        const chatBot = defaultLLM();
        const completion = await chatBot.chat.completions.create({
            model: "qwen/qwen-2.5-coder-32b-instruct",
            max_tokens: 200,
            messages: [{
                role: "system",
                content: "Make the prompt more specific and clear. Do not change the meaning of the prompt. Do not add any extra information. Just make it more specific and clear."
            }, {
                role: "user",
                content: parsedPrompt.prompt
            }]
        });
        const refinedPromptResponse = completion.choices[0].message.content;
        return new Response(JSON.stringify({ refinedPrompt: refinedPromptResponse }))

    } catch (error) {
        console.error("Error parsing data", error);
        return new Response("Error parsing data", { status: 500 });
    }
}