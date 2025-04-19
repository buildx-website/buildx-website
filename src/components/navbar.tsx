"use client"

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthCard } from "./AuthCard";
import { UserCard } from "./UserCard";
import { BlocksIcon, UserRound, UserRoundCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [name, setName] = useState("User");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPending, setIsPending] = useState(true);

    async function getSession() {
        const response = await authClient.getSession({
            fetchOptions: {
                onSuccess: (ctx) => {
                    const jwt = ctx.response.headers.get("set-auth-jwt")
                    if (jwt) {
                        localStorage.setItem("token", jwt);
                    }
                }
            }
        })
        return response?.data || null;
    }

    async function checkAuth() {
        setIsPending(true);
        const sessionData = await getSession();
        if (sessionData?.user) {
            setIsLoggedIn(true);
            setName(sessionData.user.name || "User");
            localStorage.setItem("name", sessionData.user.name);
        } else {
            setIsLoggedIn(false);
        }

        setIsPending(false);
    }
    useEffect(() => {
        checkAuth();
    }, []);

    function handleClick() {
        setIsDialogOpen(true);
    }

    return (
        <>
            <nav className="w-full row-start-1 flex items-center px-4 sm:px-0 py-4 justify-between">
                <span className="flex items-center gap-2 text-slate-200 cursor-pointer my-auto"
                    onClick={() => window.location.href = '/'}>
                    <BlocksIcon size={32} className="my-auto" />
                    <span className="text-xl font-bold text-slate-200 my-auto font-heading">
                        Builder
                    </span>
                </span>
                <Button
                    variant="outline"
                    className="bg-zinc-900/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white transition-all duration-200 gap-2 px-4 py-2 rounded-lg font-heading"
                    onClick={handleClick}
                >
                    {isPending && (
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    )}

                    {!isPending && isLoggedIn && (
                        <>
                            <UserRoundCheck size={16} />
                            <span>{name}</span>
                        </>
                    )}

                    {!isPending && !isLoggedIn && (
                        <>
                            <UserRound size={16} />
                            <span>Login</span>
                        </>
                    )}
                </Button>
            </nav>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTitle />
                <DialogContent>
                    {!isPending && !isLoggedIn && <AuthCard setIsDialogOpen={setIsDialogOpen} />}
                    {!isPending && isLoggedIn && <UserCard setIsDialogOpen={setIsDialogOpen} />}
                </DialogContent>
            </Dialog>
        </>
    );
}
