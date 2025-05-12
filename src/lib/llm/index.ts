import OpenAI from 'openai';

export function llm(apiKey: string, modelProvider: string) {
    if (!apiKey || apiKey === "") {
        if (modelProvider === "OPENROUTER") {
            return new OpenAI({
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: process.env.OPENROUTER_API_KEY
            });
        } else if (modelProvider === "OPENAI") {
            return new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
        } else if (modelProvider === "ANTHROPIC") {
            return new OpenAI({
                baseURL: "https://api.anthropic.com/v1/",
                apiKey: process.env.ANTHROPIC_API_KEY
            });
        } else if (modelProvider === "GEMINI") {
            return new OpenAI({
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
                apiKey: process.env.GEMINI_API_KEY
            })
        }
    }
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey
    });
}

export function defaultLLM() {
    return new OpenAI({
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        apiKey: process.env.GEMINI_API_KEY
    });
}