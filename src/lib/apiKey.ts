import { db } from "@/db";

export async function getApiKey(userId: string) {
    const user = await db.user.findUnique({
        where: {
            id: userId
        }
    });
    if (!user) return null;
    return user.apiKey;
}