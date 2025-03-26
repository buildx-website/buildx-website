import OpenAI from 'openai';

export function llm(apiKey: string) {
    if (!apiKey || apiKey === "") {
        return new OpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY
        });
    }
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey
    });
}