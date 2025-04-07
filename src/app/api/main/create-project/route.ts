import { db } from "@/db";

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");
    const body = await req.json();
    const projectName = body.projectName;
    const frameWork = body.framework;

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }
    try {
        const project = await db.project.create({
            data: {
                name: projectName,
                ownerId: userId,
                projectLocation: '',
                status: 'CREATED',
                framework: frameWork
            }
        });
        return new Response(JSON.stringify(project), { status: 200 });
    } catch (error) {
        console.error("Error creating project:", error);
        return new Response("Error creating project", { status: 500 });
    }
}