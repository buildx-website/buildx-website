import { Message } from "@/types/types";
import OpenAI from "openai";
import { getSystemPrompt } from "../prompts";

export async function chat(llm: OpenAI, prompt: string) {
    try {
        const completion = await llm.chat.completions.create({
            model: "qwen/qwen-2.5-coder-32b-instruct",
            messages: [{
                role: "system",
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra."
            }, {
                role: "user",
                content: prompt
            }]
        });
        return completion.choices[0].message;
    } catch (error) {
        if (error instanceof Error) {
            throw Error(`${error.message}`);
        } else {
            throw Error("An unknown error occurred");
        }
    }
}

export async function chatStream(llm: OpenAI, prompt: string, messages: Message[], modelName: string, response: (token: string) => void) {
    try {
        if (!messages.some(msg => msg.role === "system")) {
            messages.unshift({
                role: "system", content: [{
                    type: "text",
                    text: getSystemPrompt(modelName)
                }]
            });
        }
        messages.push({
            role: 'user', content: [{
                type: "text",
                text: prompt
            }]
        });

        console.log("Messages: ", messages);


        const completion = await llm.chat.completions.create({
            model: modelName,
            messages: messages,
            stream: true
        });

        let fullContent = "";
        for await (const chunk of completion) {
            response(chunk.choices[0]?.delta?.content || '');
            fullContent += chunk.choices[0]?.delta?.content || '';
        }
        return fullContent;

    } catch (error) {
        console.error("Error: ", error);
        messages.push({
            role: "assistant", content: [{
                type: "text",
                text: "Error occurred while processing the request"
            }]
        });
        response("Error occurred while processing the request");
        return "Error occurred while processing the request";
    }
}