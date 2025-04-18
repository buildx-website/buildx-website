import { db } from '../src/db'
import { Prisma } from '@prisma/client';

const modelData: Prisma.ModelsCreateInput[] = [{
    name: 'google/gemini-2.5-pro-exp-03-25:free',
    displayName: "Gemini 2.5 Pro",
}, {
    name: "deepseek/deepseek-chat-v3-0324:free",
    displayName: "DeepSeek Chat v3",
    default: true,
}, {
    name: "deepseek/deepseek-r1-zero:free",
    displayName: "DeepSeek R1 Zero",
}, {
    name: "mistralai/mistral-nemo:free",
    displayName: "Mistral Nemo",
}, {
    name: "meta-llama/llama-4-maverick:free",
    displayName: "Llama 4 Maverick",
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