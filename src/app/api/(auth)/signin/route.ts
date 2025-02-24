import { db } from "@/db";
import { userSignIn } from "@/types/userTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

export async function POST(req: Request) {
    const data = await req.json();
    try {
        const parsedData = userSignIn.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify(parsedData.error), { status: 400 });
        }

        const pwHash = parsedData.data.password;
        const user = await db.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        });

        if (!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const match = await bcrypt.compare(pwHash, user.password);
        if (!match) {
            return new Response(JSON.stringify({ error: "Invalid password" }), { status: 401 });
        }

        const token = await jwt.sign({
            id: user.id,
            email: user.email,
            name: user.name,
        }, SECRET_KEY);

        return new Response(JSON.stringify({ token }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}