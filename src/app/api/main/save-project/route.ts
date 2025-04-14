import { db } from "@/db";
import { Message } from "@/types/types";

type SanitizeMsg = {
    role: string;
    content: string;
    imageUrl?: string;
    ignoreInUI?: boolean;
}

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }
    try {
        const body = await req.json();
        const { projectId, messages } = body;

        console.log("Saving project with ID:", projectId);
        console.log("Messages:", messages);



        const sanitizeMsgs: SanitizeMsg[] = messages.map((msg: Message) => {
            const textContent = msg.content
                .filter((content) => content.type === "text")
                .map((content) => content.text || "")
                .join(" "); // Join into a single string

            const imageContent = msg.content.find((content) => content.type === "image_url");
            const imageUrl = imageContent?.image_url?.url || "";

            return {
                role: msg.role,
                content: textContent,
                imageUrl: imageUrl || undefined,
                ignoreInUI: msg.ignoreInUI ?? false,
            };
        });


        const project = await db.project.update({
            where: {
                id: projectId,
            },
            data: {
                messages: {
                    create: sanitizeMsgs.map(({ role, content, imageUrl, ignoreInUI }) => ({
                        role,
                        content,
                        imgUrl: imageUrl,
                        ignoreInUI,
                    })),
                },
            }
        });

        return new Response(JSON.stringify(project), { status: 200 });
    } catch (error) {
        console.error("Error saving project", error);
        return new Response("Error saving project", { status: 500 });
    }
}