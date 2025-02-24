import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "./lib/constants";

export function middleware(req: NextRequest) {
    console.log("Middleware executed");

    const authorization = req.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return new Response("Missing or invalid Authorization header", { status: 401 });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
        return new Response("No token provided", { status: 401 });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
        
        const response = NextResponse.next();
        response.headers.set("X-User-Id", decoded.userId);
        
        return response;
    } catch (error) {
        console.error("Token verification failed:", error);
        return new Response("Invalid or expired token", { status: 403 });
    }
}

export const config = {
    matcher: "/api/main/:path*",
};
