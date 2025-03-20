import { db } from "@/db";

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");
    const body = await req.json();
    const projectId = body.projectId;

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }

    if (!projectId) {
        return new Response("No Project ID provided", { status: 400 });
    }

    try {
        const project = await db.project.findFirst({
            where: {
                id: projectId,
                ownerId: userId
            }, include: {
                messages: true
            }
        });

        if (!project) {
            return new Response("Project not found", { status: 404 });
        }
        return new Response(JSON.stringify(project), { status: 200 });
    } catch (error) {
        console.error("Error fetching project", error);
        return new Response("Error fetching project", { status: 500 });
    }
}