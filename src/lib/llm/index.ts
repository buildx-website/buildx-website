import OpenAI from 'openai';

export function llm(apiKey: string) {
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey
    });
}