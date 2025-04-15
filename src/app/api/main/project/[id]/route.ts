import { db } from "@/db";
import { Content, Message } from "@/types/types";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    console.log("Fetching project with ID:", id);

    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }

    if (!id) {
        return new Response("Project ID is required", { status: 400 });
    }

    try {
        const project = await db.project.findFirst({
            where: {
                id,
            },
            include: {
                messages: true,
            },
        });

        if (!project) {
            return new Response("Project not found", { status: 404 });
        }

        // Transform messages
        const transformedMessages: Message[] = project.messages.map((msg) => {
            const contents: Content[] = [];

            if (msg.content) {
                contents.push({
                    type: "text",
                    text: msg.content,
                });
            }

            if (msg.imgUrl) {
                contents.push({
                    type: "image_url",
                    image_url: {
                        url: msg.imgUrl,
                    },
                });
            }

            return {
                role: msg.role as "user" | "assistant" | "system",
                content: contents,
                ignoreInUI: msg.ignoreInUI ?? false,
            };
        });

        // Replace project.messages with transformed version
        const responsePayload = {
            ...project,
            messages: transformedMessages,
        };

        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (error) {
        console.error("Error fetching project", error);
        return new Response("Error fetching project", { status: 500 });
    }
}
