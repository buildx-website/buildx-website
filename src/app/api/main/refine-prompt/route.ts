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
            model: "gemini-2.0-flash",
            messages: [{
                role: "system",
                content: "Your only job is to refine the given prompt for creating a web application or video creation using manim project.\nFor Web Application, focus exclusively on the web app's features, functionality, user interface, and user experience. Make the prompt more specific, detailed, and clear. Do not include any deployment steps, hosting information, or DevOps concerns. Keep the prompt to the point and focused on what the web app should do and how it should look/function. Do not add any commentary or explanations. Simply return the refined prompt text only. The prompt should be no more than 1000 characters.\nFor Video Creation using Manim, focus exclusively on the video's features, functionality, and user experience. Make the prompt more specific, detailed, and clear. Do not include any deployment steps, hosting information, or DevOps concerns. Keep the prompt to the point and focused on what the video should do and how it should look/function. Do not add any commentary or explanations. Simply return the refined prompt text only. The prompt should be no more than 1000 characters."
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