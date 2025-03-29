import { db } from "@/db";

export async function GET() {
    try {
        const models = await db.models.findMany();
        return new Response(JSON.stringify(models), { status: 200 });
    } catch (error) {
        console.log("Error occurred getting Model: ", error);
        return new Response(JSON.stringify({ error: "An unknown error occurred" }), { status: 500 });
    }
}