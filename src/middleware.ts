import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from 'jose'

export async function middleware(req: NextRequest) {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    console.log("Base URL:", baseUrl);

    const authorization = req.headers.get("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
        return new Response("Missing or invalid Authorization header", { status: 401 });
    }
    const token = authorization.split(" ")[1];
    if (!token) {
        return new Response("No token provided", { status: 401 });
    }
    try {
        const JWKS = jose.createRemoteJWKSet(new URL(`${baseUrl}/api/auth/jwks`))
        const { payload } = await jose.jwtVerify(token, JWKS, {
            issuer: baseUrl,
        })

        console.log("Decoded JWT payload:", payload);
        const userId = payload.id as string;
        const email = payload.email as string;

        if (!userId || !email) {
            throw new Error("User ID not found in token payload");
        }

        const response = NextResponse.next();
        response.headers.set("X-User-Id", userId);
        response.headers.set("X-User-Email", email);
        return response;

    } catch (error) {
        console.error("Token verification failed:", error);
        return new Response("Invalid or expired token", { status: 403 });
    }
}

export const config = {
    matcher: "/api/main/:path*",
};
