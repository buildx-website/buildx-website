import { chatBodyTypes } from "@/types/types";


export const baseReactPrompt = `
Hello! I can help you set up a React + ShadCN + Framer Motion project. Here's a step-by-step guide to get you started:
<boltArtifact id="project-import" title="React + ShadCN + Framer Motion Project">
  <boltAction type="file" filePath="vite.config.ts">import path from "path"
  import react from "@vitejs/plugin-react"
  import { defineConfig } from "vite"
  
  // https://vite.dev/config/
  export default defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  })
  </boltAction>
  <boltAction type="shell">
  npm install
  
  </boltAction>
  <boltAction type="shell">
  npm run dev
  </boltAction>
  </boltArtifact>
  I hope this helps you get started with a React + ShadCN + Framer Motion project! You can customize the components and styles as per your requirements. If you have any questions or need further assistance, feel free to ask.`;

  function getToken(input: string) {
    let index = 0;

    return function () {
        if (index >= input.length) return null;

        const chunkSize = Math.floor(Math.random() * 5) + 1;
        const token = input.slice(index, index + chunkSize);
        index += chunkSize;

        return token;
    };
}

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const parsedData = chatBodyTypes.safeParse(body);
        if (!parsedData.success) {
            return new Response(JSON.stringify({ zodErr: parsedData.error }), { status: 400 });
        }

        const stream = new ReadableStream({
            async start(controller) {
                const nextToken = getToken(baseReactPrompt);

                let token;
                while ((token = nextToken()) !== null) {
                    controller.enqueue(new TextEncoder().encode(token));
                    await new Promise((res) => setTimeout(res, 10));
                }

                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error) {
        console.error("Error parsing data", error);
        return new Response("Error parsing data", { status: 500 });
    }
}
