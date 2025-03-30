import { db } from "@/db";
import { setModelTypes } from "@/types/types";

export async function GET(req: Request) {
    try {
        const userId = req.headers.get('X-User-Id') || '';
        if (!userId) {
            return new Response(JSON.stringify({ error: "User ID not provided" }), { status: 400 });
        }
        const model = await db.userModels.findFirst({
            where: {
                userId: userId,
            },
            include: {
                model: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })
        if (!model) {
            return new Response(JSON.stringify({ error: "Model not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(model.model), { status: 200 });
    } catch (error) {
        console.log("Error occurred getting Model: ", error);
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = req.headers.get('X-User-Id') || '';
    if (!userId) {
        return new Response(JSON.stringify({ error: "User ID not provided" }), { status: 400 });
    }
    try {
        const data = await req.json();
        const parseData = setModelTypes.safeParse(data);
        if (!parseData.success) {
            return new Response(JSON.stringify({ error: "Zod Error" }), { status: 400 });
        }
        const { modelId } = parseData.data;
        if (!modelId) {
            return new Response(JSON.stringify({ error: "Model not provided" }), { status: 400 });
        }
        const model = await db.userModels.upsert({
            where: {
                userId: userId,
            },
            update: {
                modelId: modelId,
            },
            create: {
                userId: userId,
                modelId: modelId,
            },
        });
        if (!model) {
            return new Response(JSON.stringify({ error: "Model not found" }), { status: 404 });
        }
        return new Response(JSON.stringify(model), { status: 200 });
    } catch (error) {
        console.log("Error occurred updating Model: ", error);
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
    }
}