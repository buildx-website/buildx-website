import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    console.log(`Middleware triggered for ${request.nextUrl.pathname}`);
    
    const session = await auth.api.getSession({
        headers: await headers()
    })


    if (!session) {
        return new Response("Cannot find user's session. Please login again.", { status: 401 });;
    }

    const response = NextResponse.next();
    const userId = session.user.id;
    const email = session.user.email;

    response.headers.set("X-User-Id", userId);
    response.headers.set("X-User-Email", email);
    return response;
}

export const config = {
    runtime: "nodejs",
    matcher: ["/api/main/:path*", "/editor2/:path"],
};
