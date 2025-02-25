import { db } from "@/db";
import { apiKeyTypes } from "@/types/types";

export async function GET(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }
    try {
        const user = await db.user.findFirst({
            where: {
                id: userId,
                email: email
            }
        });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        return new Response(JSON.stringify({
            apiKey: user.apiKey,
        }), { status: 200 });

    } catch (error) {
        console.error("Error fetching user", error);
        return new Response("Error fetching user", { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }

    const data = await req.json();
    try {
        const parsedData = apiKeyTypes.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify(parsedData.error), { status: 400 });
        }
        const user = await db.user.findFirst({
            where: {
                id: userId,
                email: email
            }
        });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const apiKey = parsedData.data.apiKey;
        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                apiKey: apiKey,
            }
        });

        return new Response(JSON.stringify({
            apiKey: apiKey,
        }), { status: 200 });
    } catch (error) {
        console.error("Error updating user", error);
        return new Response("Error updating user", { status: 500 });
    }
}