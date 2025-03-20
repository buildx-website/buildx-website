import { db } from "@/db";

export async function GET(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }
    try {
        const projects = await db.project.findMany({
            where: {
                ownerId: userId
            }
        });

        return new Response(JSON.stringify(projects), { status: 200 });
    } catch (error) {
        console.error("Error fetching user", error);
        return new Response("Error fetching user", { status: 500 });
    }
}