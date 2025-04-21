"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Blocks } from "lucide-react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [isLoadingToken, setIsLoadingToken] = useState(false);
    const { data: session, error, isPending } = authClient.useSession();

    useEffect(() => {
        async function fetchToken() {
            if (!session?.user) return;

            try {
                setIsLoadingToken(true);
                const response = await fetch("/api/auth/token");
                if (response.ok) {
                    const data = await response.json();
                    if (data.token) {
                        localStorage.setItem("token", data.token);
                        setToken(data.token);
                    }
                } else {
                    console.error("Failed to fetch token:", response.statusText);
                }
            } catch (error) {
                console.error("Token fetch error:", error);
            } finally {
                setIsLoadingToken(false);
            }
        }

        if (session?.user && !token) {
            fetchToken();
        }
    }, [session, token]);

    useEffect(() => {
        if (session?.user) {
            const { name, email } = session.user;

            if (name) {
                localStorage.setItem("name", name);
            }

            if (email) {
                localStorage.setItem("email", email);
            }
        }
    }, [session]);

    if (isPending || isLoadingToken) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black/40 text-white font-heading">
                <Blocks size={64} className="text-white" />
                <p className="mt-4 text-lg text-white">BuildX Website</p>
            </div>
        );
    }
    
        

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-6 bg-red-50 rounded-lg">
                    <h2 className="text-xl font-semibold text-red-700">Authentication Error</h2>
                    <p className="mt-2 text-red-600">{error.message || "Failed to authenticate"}</p>
                </div>
            </div>
        );
    }

    return (<>
        {children}
    </>);
}