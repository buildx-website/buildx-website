import { Prisma } from '../generated/prisma/client';
import { db } from '../src/db'

const modelData: Prisma.ModelsCreateInput[] = [{
    name: "deepseek/deepseek-chat-v3-0324:free",
    displayName: "DeepSeek Chat v3",
    provider: "OPENROUTER",
    default: true,
}, {
    name: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5",
    provider: "ANTHROPIC",
}, {
    name: "gemini-2.0-flash",
    displayName: "Gemini flash 2.0",
    provider: "GEMINI",
}, {
    name: "gemini-2.5-flash-preview-04-17",
    displayName: "Gemini flash 2.5",
    provider: "GEMINI",
}]


async function main() {
    try {
        await Promise.all(
            modelData.map(model => db.models.upsert(
                {
                    where: { name: model.name },
                    update: {},
                    create: model,
                }
            )),
        )
    } catch (error) {
        console.error("Error during seed: ", error)
    }
}

main();