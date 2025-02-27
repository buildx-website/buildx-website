import OpenAI from "openai";

export async function chat(llm: OpenAI, prompt: string) {
    const completion = await llm.chat.completions.create({
        model: "google/gemini-2.0-flash-lite-001",
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