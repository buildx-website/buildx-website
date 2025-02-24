import { db } from "@/db";
import { userSignUp } from "@/types/userTypes";
import bcrypt from "bcrypt";


export async function POST(req: Request) {
    const data = await req.json();
    try {
        const parsedData = userSignUp.safeParse(data);
        if (!parsedData.success) {
            return new Response(JSON.stringify(parsedData.error), { status: 400 });
        }

        const userExists = await db.user.findFirst({
            where: {
                email: parsedData.data.email
            }
        });

        if (userExists) {
            return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const pwHash = await bcrypt.hash(parsedData.data.password, salt);

        const user = await db.user.create({
            data: {
                email: parsedData.data.email,
                password: pwHash,
                name: parsedData.data.name,
            }
        });

        return new Response(JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
        }), { status: 201 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e }), { status: 500 });
    }
}

