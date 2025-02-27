import { Message } from "@/types/types";
import OpenAI from "openai";

export async function chat(llm: OpenAI, prompt: string) {
    const completion = await llm.chat.completions.create({
        model: "qwen/qwen-2.5-coder-32b-instruct",
        max_tokens: 200,
        messages: [{
            role: "system",
            content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra."
        }, {
            role: "user",
            content: prompt
        }]
    });
    return completion.choices[0].message;
}

export async function chatStream(llm: OpenAI, prompt: string, messages: Message[], response: (token: string) => void) {
    try {
        messages.push({ role: 'user', content: prompt });
        const completion = await llm.chat.completions.create({
            model: "qwen/qwen-2.5-coder-32b-instruct",
            messages: messages,
            stream: true,
            temperature: 1,
        });

        let fullContent = "";
        for await (const chunk of completion) {
            response(chunk.choices[0]?.delta?.content || '');
            fullContent += chunk.choices[0]?.delta?.content || '';
        }
        return fullContent;

    } catch (error) {
        console.error("Error: ", error);
        messages.push({ role: "assistant", content: "Error occurred while processing the request" });
        response("Error occurred while processing the request");
        return "Error occurred while processing the request";
    }
}