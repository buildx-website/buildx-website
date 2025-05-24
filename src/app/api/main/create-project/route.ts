import { db } from "@/db";
import { defaultLLM } from "@/lib/llm";
import { createProjectTypes } from "@/types/types";

export async function POST(req: Request) {
    const userId = req.headers.get("X-User-Id");
    const email = req.headers.get("X-User-Email");
    const body = await req.json();

    const parsedData = createProjectTypes.safeParse(body);
    if (!parsedData.success) {
        return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
    }
    const { prompt, framework } = parsedData.data;

    if (!userId || !email) {
        return new Response("User not found", { status: 404 });
    }
    try {
        const chatBot = defaultLLM();
        const completion = await chatBot.chat.completions.create({
            model: "gemini-1.5-flash",
            max_tokens: 200,
            messages: [{
                role: "system",
                content: "Suggest the name of the project based on the prompt and framework. Do not add any extra information. Just suggest the name of the project. Do not give project name in code block or markdown. Just give a short project name.",
            }, {
                role: "user",
                content: `Prompt: ${prompt} | Framework: ${framework}`
            }]
        });
        const projectName = completion.choices[0].message.content || "Unnamed Project";
        if (!projectName) {
            return new Response("Project name not found", { status: 404 });
        }

        const project = await db.project.create({
            data: {
                name: projectName,
                ownerId: userId,
                status: 'CREATED',
                framework: framework == "node" ? "NODE" : framework == "react" ? "REACT" : framework == "nextjs" ? "NEXT" : "UNDEFINED",
            }
        });
        return new Response(JSON.stringify(project), { status: 200 });
    } catch (error) {
        console.error("Error creating project:", error);
        return new Response("Error creating project", { status: 500 });
    }
}